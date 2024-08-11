jest.mock("firebase-admin"); // Mock Firebase Admin

const { updateClassificationAndCategoryCounts } = require("../utils/index");
const { firestore } = require("firebase-admin");

describe("updateClassificationAndCategoryCounts", () => {
  const mockGet = firestore().collection().doc().get;
  const mockSet = firestore().collection().doc().set;

  beforeEach(() => jest.clearAllMocks());

  it("should update classification counts when classification exists", async () => {
    const classificationDocData = { classificationA: 1 };
    mockGet.mockResolvedValueOnce({ exists: true, data: () => classificationDocData });
    mockGet.mockResolvedValueOnce({ exists: false });

    await updateClassificationAndCategoryCounts("classificationA", undefined, 1);

    expect(mockSet).toHaveBeenCalledWith({ classificationA: 2 });
  });

  it("should update category counts when category exists", async () => {
    const categoryDocData = { categoryA: 2 };
    mockGet.mockResolvedValueOnce({ exists: false });
    mockGet.mockResolvedValueOnce({ exists: true, data: () => categoryDocData });

    await updateClassificationAndCategoryCounts(undefined, "categoryA", -1);

    expect(mockSet).toHaveBeenCalledWith({ categoryA: 1 });
  });

  it("should correctly update both classification and category counts", async () => {
    const classificationDocData = { classificationA: 1 };
    const categoryDocData = { categoryA: 2 };
    mockGet.mockResolvedValueOnce({ exists: true, data: () => classificationDocData });
    mockGet.mockResolvedValueOnce({ exists: true, data: () => categoryDocData });

    await updateClassificationAndCategoryCounts("classificationA", "categoryA", 1);

    expect(mockSet).toHaveBeenCalledWith({ classificationA: 2 });
    expect(mockSet).toHaveBeenCalledWith({ categoryA: 3 });
  });

  it("should not update counts if classification and category are undefined", async () => {
    mockGet.mockResolvedValueOnce({ exists: false });
    mockGet.mockResolvedValueOnce({ exists: false });

    await updateClassificationAndCategoryCounts(undefined, undefined, 1);

    expect(mockSet).not.toHaveBeenCalled();
  });
});
