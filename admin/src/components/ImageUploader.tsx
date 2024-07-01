import React, { useState } from "react";
import { Upload, UploadFile, UploadProps, Modal, Input } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, StorageReference, getMetadata } from "firebase/storage";
import Compressor from "compressorjs";
import { storage } from "../firebase/client";

const ImageUploader = (props: { maxCount?: number; initialImages?: { image?: string; caption?: string }[]; handleChange: (urls: { image: string; caption?: string }[]) => any }) => {
  const [imageCaption, setImageCaption] = useState<string>("");
  const [fileList, setFileList] = useState<UploadFile[]>(
    props.initialImages?.map((image, index) => ({
      uid: index.toString(),
      name: image.caption ?? "Image",
      thumbUrl: image.image,
      status: "done",
      response: {
        url: image.image,
      },
    })) ?? []
  );

  const handleChange: UploadProps["onChange"] = ({ file, fileList: newFileList }) => {
    if (newFileList.every((f) => f.status === "done")) {
      const urls = newFileList.map((f: any) => ({
        image: f?.response?.url,
        caption: f.name,
      }));
      console.log("here123", { urls, newFileList });
      props.handleChange(urls);
    }
    setFileList(newFileList);
  };

  return (
    <Upload
      accept="images/**"
      maxCount={props.maxCount}
      onPreview={async (file: UploadFile) => window.open(file.response?.url, "_blank")}
      listType="picture-card"
      multiple={true}
      fileList={fileList}
      onChange={handleChange}
      onRemove={async (file) => {
        await deleteFileOnFirebase(file.response.url);
        const urls = fileList
          .filter((f) => f.response?.url !== file.response.url)
          .map((f, idx) => ({
            uid: idx.toString(),
            name: f.name ?? "Image",
            image: f.response.url,
            response: {
              url: f.response.url,
            },
          }));
        props.handleChange(urls);
      }}
      customRequest={async ({ file, onSuccess, onError, onProgress }) => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");
        const filePath = `uploads/${currentYear}/${currentMonth}/${(file as File).name}`;

        try {
          const fileRefUrl = await isExistedFileOnFirebase(filePath);
          if (fileRefUrl) {
            onSuccess?.call(this, { url: fileRefUrl }, undefined);
            return;
          }

          uploadFileToFirebaseStorage({
            file: file as File,
            filePath: filePath,
            handleUrlResponse(imgObj: any) {
              onSuccess?.call(this, { url: imgObj.image }, undefined);
              setImageCaption(imgObj.caption);
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

export const uploadFileToFirebaseStorage = ({ file, filePath, handleSnapshot, handleError, handleUrlResponse }: any): void => {
  const storageRef: StorageReference = ref(storage, filePath);
  const FILE_MAX_SIZE = 512000;

  const fileSize = file.size;
  const quality = fileSize > FILE_MAX_SIZE ? FILE_MAX_SIZE / fileSize : 1;

  const uploadFile = (fileToUpload: File | Blob) => {
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload);
    uploadTask.on("state_changed", handleSnapshot, handleError, () => {
      getDownloadURL(uploadTask.snapshot.ref).then((URL: string) => {
        if (URL) {
          let caption = "";
          Modal.confirm({
            title: "Enter the image caption",
            content: <Input onChange={(e) => (caption = e.target.value)} />,
            onOk() {
              handleUrlResponse?.call(this, { image: URL, caption: caption });
            },
          });
        }
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

export const isExistedFileOnFirebase = async (filePath: string): Promise<string> => {
  try {
    const fileRef = ref(storage, filePath);
    await getMetadata(fileRef);
    const fileRefUrl = await getDownloadURL(fileRef);
    console.log("File already exists at:", fileRefUrl);

    return fileRefUrl;
  } catch (error) {
    if ((error as any).code === "storage/object-not-found") {
      console.log(`File does not exist at: ${filePath}`);
      return "";
    } else {
      console.error("Error checking file existence:", error);
      return ""; // Not break current logic
    }
  }
};

export default ImageUploader;
