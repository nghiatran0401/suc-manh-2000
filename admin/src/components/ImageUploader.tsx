import React, { useState } from "react";
import { Upload, UploadFile, UploadProps, Modal, Input } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { uploadFileToFirebaseStorage } from "../firebase/storage";

const ImageUploader = (props: { docId: string; handleChange: (url: string, caption: string) => any }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [caption, setCaption] = useState("");

  console.log("here", fileList);

  const handleChange: UploadProps["onChange"] = ({ file, fileList: newFileList }) => {
    if (file.status === "done") {
      const url = file.response.url;
      props.handleChange(url, caption);
      setCaption(""); // Reset the caption
    }
    setFileList(newFileList);
  };

  const handleBeforeUpload: UploadProps["beforeUpload"] = (file) => {
    setIsModalVisible(true); // Show the modal when a file is selected
    return false; // Prevent the upload from starting immediately
  };

  const handleOk = () => {
    setIsModalVisible(false); // Hide the modal when the OK button is clicked
    // Start the upload here
  };

  return (
    <>
      <Upload
        accept="images/**"
        listType="picture-card"
        multiple={true}
        fileList={fileList}
        onChange={handleChange}
        beforeUpload={handleBeforeUpload}
        // customRequest={async ({ file, onSuccess, onError, onProgress }) => {
        //   try {
        //     uploadFileToFirebaseStorage({
        //       file: file as File,
        //       fileName: props.docId,
        //       bucketName: "thumbnail",
        //       handleUrlResponse(url) {
        //         onSuccess?.call(this, { url }, undefined);
        //       },
        //       handleError(error) {
        //         console.log({ error });
        //         onError?.call(this, error);
        //       },
        //       handleSnapshot: (snapshot) => {
        //         const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        //         onProgress?.call(this, { percent: progress });
        //       },
        //     });
        //   } catch (error: any) {
        //     console.log(error);
        //     onError?.call(this, error);
        //   }
        // }}
      >
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Upload</div>
        </div>
      </Upload>
      <Modal title="Enter a caption" visible={isModalVisible} onOk={handleOk} onCancel={() => setIsModalVisible(false)}>
        <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption" />
      </Modal>
    </>
  );
};

export default ImageUploader;
