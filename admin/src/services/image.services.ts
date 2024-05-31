import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "../firebase/client";
import {
  UploadFileProps,
  deleteFileOnFirebase,
  uploadFileToFirebaseStorage,
} from "../firebase/storage";

export const addImageToProject = async ({
  collection,
  file,
  fileName,
  docId,
  handleSnapshot,
  handleError,
  handleUrlResponse,
}: Omit<UploadFileProps, "bucketName"> & {
  collection: string;
  docId: string;
}) => {
  return new Promise<string>((resolve, reject) => {
    uploadFileToFirebaseStorage({
      file,
      fileName,
      bucketName: `${collection}/${docId}`,
      handleSnapshot,
      handleError: (e) => {
        handleError?.call(this, e);
        console.log(e);
        reject(e.message);
      },
      handleUrlResponse: async (url) => {
        const documentRef = doc(firestore, collection, docId);
        const documentData = await getDoc(documentRef);
        const existingImgUrls = documentData.get("imgUrls");
        if (existingImgUrls === null) {
          await updateDoc(documentRef, {
            imgUrls: [url],
          });
        } else {
          await updateDoc(documentRef, {
            imgUrls: arrayUnion(url),
          });
        }

        handleUrlResponse?.call(this, url);
        resolve(url);
      },
    });
  });
};

export const removeImageFrom = async ({
  url,
  collection,
  docId,
  handleError,
  handleSuccess,
}: Omit<UploadFileProps, "bucketName" | "file" | "fileName"> & {
  collection: string;
  docId: string;
  url: string;
  handleSuccess: () => void;
}) => {
  const documentRef = doc(firestore, collection, docId);
  const documentData = await getDoc(documentRef);
  const existingImgUrls = documentData.get("imgUrls");
  if (existingImgUrls !== null) {
    await updateDoc(documentRef, {
      imgUrls: arrayRemove(url),
    });
  }
  deleteFileOnFirebase({
    url: url,
    handleSuccess,
    handleError,
  });
};
