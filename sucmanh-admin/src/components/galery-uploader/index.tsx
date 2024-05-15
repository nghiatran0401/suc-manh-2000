import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Modal, Upload, UploadFile } from "antd";
import { RcFile, UploadProps } from "antd/es/upload";
import React, { useState } from "react";
import {
  addImageToProject,
  removeImageFrom,
} from "../../services/image.services";
import { availableParallelism } from "os";
import { ProjectResource } from "../../resources";
import { getBase64 } from "../../utils";
export type GaleryUploaderProps = {
  collection: string;
  imgUrls: string[];
  docId: string;
  onUpload?: (props: any) => any;
};

const GaleryUploader = ({
  imgUrls,
  docId,
  collection,
}: GaleryUploaderProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name);
  };
  const fileListAvailable: UploadFile[] = imgUrls?.map((item) => {
    return {
      uid: item,
      url: item,
      status: "done",
      name: `${item.split("/").pop()?.split("?").shift()}.png`,
    };
  });
  const [fileList, setFileList] = useState<UploadFile[]>(fileListAvailable);
  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const handleRemove = async (file: UploadFile) => {
    return new Promise<boolean>((resolve) => {
      setFileList((value) =>
        value.map((item) => {
          if (item.uid === file.uid) {
            return { ...item, status: "uploading" };
          }
          return item;
        })
      );
      const { url, uid } = file;
      removeImageFrom({
        url: url ?? uid,
        collection: collection,
        docId: docId,
        handleSuccess: () => {
          setFileList((value) => value.filter((item) => item.uid != file.uid));

          resolve(true);
        },
        handleError: () => {
          resolve(false);
        },
      });
    });
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <>
      <Upload
        progress={{ strokeWidth: 2, showInfo: false }}
        accept="image/*"
        fileList={fileList}
        onRemove={handleRemove}
        customRequest={async ({ file, onSuccess, onError, onProgress }) => {
          try {
            const url = await addImageToProject({
              docId: docId,
              file: file as File,
              collection: collection,
              fileName: (file as File).name,
              handleUrlResponse(url) {
                onSuccess?.call(this, { url }, undefined);
              },
              handleError(error) {
                console.log({ error });
                onError?.call(this, error);
              },
              handleSnapshot: (snapshot) => {
                const progress =
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress?.call(this, { percent: progress });
              },
            });
          } catch (error: any) {
            console.log(error);
            onError?.call(this, error);
          }
        }}
        style={{ width: 200, height: 200 }}
        listType="picture-card"
        onPreview={handlePreview}
        onChange={handleChange}
        multiple
        maxCount={20}
      >
        {fileList.length >= 20 ? null : uploadButton}
      </Upload>
      <Modal
        open={previewOpen}
        footer={null}
        width={'700px'}
        onCancel={handleCancel}
      >
        <img alt="example" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </>
  );
};

export default GaleryUploader;
