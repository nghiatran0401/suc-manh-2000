import React, { useState } from 'react';
import { Upload, UploadFile, UploadProps, Modal, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  StorageReference,
  getMetadata,
} from 'firebase/storage';
import Compressor from 'compressorjs';
import { storage } from '../firebase/client';
import { v4 as uuidv4 } from 'uuid';

interface FirestoreDbImage {
  image: string;
  caption: string;
}

interface ImageUploaderImage {
  uid: string;
  name: string;
  thumbUrl: string;
  response: { url: string; caption: string };
}

const ImageUploader = (props: {
  maxCount?: number;
  initialImages?: { image?: string; caption?: string }[];
  handleChange: (urls: { image: string; caption?: string }[]) => any;
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>(
    props.initialImages?.map(
      (image): ImageUploaderImage => ({
        uid: uuidv4(),
        name: image.caption ?? 'No caption image',
        thumbUrl: image.image ?? '',
        response: { url: image.image ?? '', caption: image.caption ?? '' },
      })
    ) ?? []
  );

  return (
    <Upload
      fileList={fileList}
      accept="images/**"
      maxCount={props.maxCount ?? 100}
      multiple={props.maxCount === 1 ? false : true}
      listType="picture-card"
      onPreview={async (file: UploadFile) =>
        window.open(file.response?.url, '_blank')
      }
      onChange={({ file, fileList: newFileList }) => {
        const transformedFileList = newFileList.map(
          (f): ImageUploaderImage => ({
            uid: f?.uid,
            name: f?.name,
            thumbUrl: f?.response?.url,
            response: f?.response,
          })
        );
        const urls = newFileList.map(
          (f): FirestoreDbImage => ({
            image: f?.response?.url,
            caption: f?.response?.caption,
          })
        );

        setFileList(transformedFileList);
        props.handleChange(urls);
      }}
      onRemove={async (file) => {
        const transformedFileList = fileList.filter(
          (f) => f.response?.url !== file.response.url
        );
        const urls = transformedFileList.map(
          (f): FirestoreDbImage => ({
            image: f?.response?.url,
            caption: f?.response?.caption,
          })
        );

        setFileList(transformedFileList);
        props.handleChange(urls);
      }}
      customRequest={async ({ file, onSuccess, onError, onProgress }) => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = (currentDate.getMonth() + 1)
          .toString()
          .padStart(2, '0');
        const filename_uid = (file as File).name; // (file as File).name + "_" + uuidv4();
        const filePath = `uploads/${currentYear}/${currentMonth}/${filename_uid}`;

        try {
          const existedImage = await isExistedFileOnFirebase(filePath);
          if (existedImage) {
            inputImageCaption({
              fileName: existedImage.fileName,
              url: existedImage.url,
              onSuccess,
              fileList,
              setFileList,
            });
            return;
          }

          uploadFileToFirebaseStorage({
            file: file as File,
            filePath: filePath,
            handleUrlResponse({
              url,
              fileName,
            }: {
              url: string;
              fileName: string;
            }) {
              inputImageCaption({
                fileName,
                url,
                onSuccess,
                fileList,
                setFileList,
              });
            },
            handleError(error: any) {
              console.log({ error });
              onError?.call(this, error);
            },
            handleSnapshot: (snapshot: any) => {
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
    >
      <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
    </Upload>
  );
};

const inputImageCaption = ({
  fileName,
  url,
  onSuccess,
  fileList,
  setFileList,
}: {
  fileName: string;
  url: string;
  onSuccess: any;
  fileList: UploadFile[];
  setFileList: React.Dispatch<React.SetStateAction<UploadFile<any>[]>>;
}) => {
  let imageCaption = fileName;
  const imageUrl = url;

  Modal.confirm({
    title: 'Enter the image caption',
    content: (
      <Input
        defaultValue={imageCaption}
        onChange={(e) => (imageCaption = e.target.value)}
        onPressEnter={() => {
          onSuccess?.call(
            Modal,
            { url: imageUrl, caption: imageCaption },
            undefined
          );
          Modal.destroyAll();
        }}
      />
    ),
    onOk() {
      onSuccess?.call(
        this,
        { url: imageUrl, caption: imageCaption },
        undefined
      );
    },
    onCancel() {
      deleteFileOnFirebase(imageUrl);
      const transformedFileList = fileList.filter((f) => f.name !== fileName);
      setFileList(transformedFileList);
    },
  });
};

const uploadFileToFirebaseStorage = ({
  file,
  filePath,
  handleSnapshot,
  handleError,
  handleUrlResponse,
}: any): void => {
  const storageRef: StorageReference = ref(storage, filePath);
  const FILE_MAX_SIZE = 512000;

  const fileSize = file.size;
  const quality = fileSize > FILE_MAX_SIZE ? FILE_MAX_SIZE / fileSize : 1;

  const uploadFile = (fileToUpload: File | Blob) => {
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload);
    uploadTask.on('state_changed', handleSnapshot, handleError, () => {
      getDownloadURL(uploadTask.snapshot.ref).then((URL: string) => {
        if (URL) {
          handleUrlResponse?.call(this, {
            url: URL,
            fileName: fileToUpload.name,
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
      console.log('>>>>>>>>Cannot compress file for some reason');
      console.log(err);
      uploadFile(file);
    },
  });
};

const deleteFileOnFirebase = async (url: string): Promise<void> => {
  let path;
  try {
    path = new URL(url).pathname.split('/o/')[1].split('?')[0];
  } catch (error) {
    console.error('Invalid URL:', url);
    return;
  }

  const decodedPath = decodeURIComponent(path);
  const fileRef = ref(storage, decodedPath);

  try {
    await deleteObject(fileRef);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

export const isExistedFileOnFirebase = async (
  filePath: string
): Promise<{ url: string; fileName: string } | null> => {
  try {
    const fileRef = ref(storage, filePath);
    const fileRefUrl = await getDownloadURL(fileRef);
    const imgMetaData = await getMetadata(fileRef);
    console.log(`File ${imgMetaData?.name} exists at: ${fileRefUrl}`);

    return { url: fileRefUrl, fileName: imgMetaData?.name };
  } catch (error) {
    if ((error as any).code === 'storage/object-not-found') {
      console.log(`File does not exist at: ${filePath}`);
      return null;
    } else {
      console.error('Error checking file existence:', error);
      return null; // Not break current logic
    }
  }
};

export default ImageUploader;
