import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
  StorageError,
  StorageReference,
} from "firebase/storage";
import { storage } from "./client";
import { v4 as uuidv4 } from "uuid";
import Compressor from "compressorjs";

type SnapshotHandler = (snapshot: UploadTaskSnapshot) => void;
type ErrorHandler = (error: StorageError) => void;
type UrlResponseHandler = (url: string) => void;
type SuccessHandler = () => void;
type DeleteErrorHandler = (error: any) => void;

export interface UploadFileProps {
  file: File;
  fileName: string;
  bucketName: string;
  handleSnapshot?: SnapshotHandler;
  handleError?: ErrorHandler;
  handleUrlResponse?: UrlResponseHandler;
}

interface DeleteFileProps {
  url: string;
  handleSuccess?: SuccessHandler;
  handleError?: DeleteErrorHandler;
}

export const uploadFileToFirebaseStorage = ({
  file,
  fileName,
  bucketName,
  handleSnapshot,
  handleError,
  handleUrlResponse,
}: UploadFileProps): void => {
  const storageRef: StorageReference = ref(
    storage,
    `images/${bucketName}/${uuidv4()}_${fileName}`
  );
  const FILE_MAX_SIZE = 512000;

  const fileSize = file.size;
  const quality = fileSize > FILE_MAX_SIZE ? FILE_MAX_SIZE / fileSize : 1;
  new Compressor(file, {
    quality: 0.6,
    convertSize: FILE_MAX_SIZE,

    // The compression process is asynchronous,
    // which means you have to access the `result` in the `success` hook function.
    success(result) {
      const uploadTask = uploadBytesResumable(storageRef, result);
      uploadTask.on("state_changed", handleSnapshot, handleError, () => {
        getDownloadURL(uploadTask.snapshot.ref).then((URL: string) => {
          handleUrlResponse?.call(this, URL);
        });
      });
    },
    error(err) {
      console.log(">>>>>>>>Cannot compress file for some reason");
      console.log(err);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on("state_changed", handleSnapshot, handleError, () => {
        getDownloadURL(uploadTask.snapshot.ref).then((URL: string) => {
          handleUrlResponse?.call(this, URL);
        });
      });
    },
  });
};

export const deleteFileOnFirebase = ({
  url,
  handleSuccess,
  handleError,
}: DeleteFileProps): void => {
  const relativeUrlRegex = /\/o\/(.+)\?/;
  const relativeUrl = url.match(relativeUrlRegex)?.[1].replace(/%2F/g, "/");
  const fileRef: StorageReference = ref(storage, relativeUrl);

  deleteObject(fileRef)
    .then(() => {
      handleSuccess?.call(this);
    })
    .catch((error: any) => {
      console.log({ error });
      handleError?.call(this, error);
    });
};
