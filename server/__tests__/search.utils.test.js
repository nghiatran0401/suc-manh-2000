const { convertToCleanedName, escapeSpecialCharacters } = require("../utils/search");

describe("convertToCleanedName", () => {
  it("should convert and clean a Vietnamese name", () => {
    const input = "Nguyễn Văn A";
    const expectedOutput = "nguyen van a";
    expect(convertToCleanedName(input)).toBe(expectedOutput);
  });

  it("should remove non-alphanumeric characters", () => {
    const input = "Nguyễn Văn A!@#$%^&*()_+";
    const expectedOutput = "nguyen van a";
    expect(convertToCleanedName(input)).toBe(expectedOutput);
  });

  it("should handle empty string input", () => {
    const input = "";
    const expectedOutput = "";
    expect(convertToCleanedName(input)).toBe(expectedOutput);
  });
});

describe("escapeSpecialCharacters", () => {
  it("should escape hyphens and underscores", () => {
    const input = "some-string_with-hyphens_and_underscores";
    const expectedOutput = "some\\-string\\_with\\-hyphens\\_and\\_underscores";
    expect(escapeSpecialCharacters(input)).toBe(expectedOutput);
  });

  it("should handle empty string input", () => {
    const input = "";
    const expectedOutput = "";
    expect(escapeSpecialCharacters(input)).toBe(expectedOutput);
  });

  it("should return the same string if there are no special characters to escape", () => {
    const input = "simple string";
    const expectedOutput = "simple string";
    expect(escapeSpecialCharacters(input)).toBe(expectedOutput);
  });
});
