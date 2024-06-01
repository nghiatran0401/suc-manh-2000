import React, { useState } from "react";
import { Upload, UploadFile, UploadProps } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, StorageReference, getStorage } from "firebase/storage";
import Compressor from "compressorjs";
import { storage } from "../firebase/client";

const ImageUploader = (props: { handleChange: (urls: { image: string; caption?: string }[]) => any }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleChange: UploadProps["onChange"] = ({ file, fileList: newFileList }) => {
    if (newFileList.every((f) => f.status === "done")) {
      const urls = newFileList.map((f: any) => ({ image: f?.response?.url, caption: f.name }));
      props.handleChange(urls);
    }
    setFileList(newFileList);
  };

  return (
    <Upload
      accept="images/**"
      listType="picture-card"
      multiple={true}
      fileList={fileList}
      onChange={handleChange}
      onRemove={(file) => deleteFileOnFirebase(file.response.url)}
      customRequest={async ({ file, onSuccess, onError, onProgress }) => {
        try {
          uploadFileToFirebaseStorage({
            file: file as File,
            handleUrlResponse(url: any) {
              onSuccess?.call(this, { url }, undefined);
            },
            handleError(error: any) {
              console.log({ error });
              onError?.call(this, error);
            },
            handleSnapshot: (snapshot: any) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress?.call(this, { percent: progress });
            },
          });
        } catch (error: any) {
          console.log(error);
          onError?.call(this, error);
        }
      }}
    >
      <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
    </Upload>
  );
};

export const uploadFileToFirebaseStorage = ({ file, handleSnapshot, handleError, handleUrlResponse }: any): void => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");

  const storageRef: StorageReference = ref(storage, `uploads/${currentYear}/${currentMonth}/${file.name}`);
  const FILE_MAX_SIZE = 512000;

  const fileSize = file.size;
  const quality = fileSize > FILE_MAX_SIZE ? FILE_MAX_SIZE / fileSize : 1;

  const uploadFile = (fileToUpload: File | Blob) => {
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload);
    uploadTask.on("state_changed", handleSnapshot, handleError, () => {
      getDownloadURL(uploadTask.snapshot.ref).then((URL: string) => {
        handleUrlResponse?.call(this, URL);
      });
    });
  };

  new Compressor(file, {
    quality: quality,
    convertSize: FILE_MAX_SIZE,
    success(result) {
      uploadFile(result);
    },
    error(err) {
      console.log(">>>>>>>>Cannot compress file for some reason");
      console.log(err);
      uploadFile(file);
    },
  });
};

export const deleteFileOnFirebase = async (url: string): Promise<void> => {
  const storage = getStorage();

  let path;
  try {
    path = new URL(url).pathname.split("/o/")[1].split("?")[0];
  } catch (error) {
    console.error("Invalid URL:", url);
    return;
  }

  const decodedPath = decodeURIComponent(path);
  const fileRef = ref(storage, decodedPath);

  try {
    await deleteObject(fileRef);
    console.log("File deleted successfully");
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};

export default ImageUploader;
