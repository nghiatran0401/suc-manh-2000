import React, { useState } from "react";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import { Edit, useForm } from "@refinedev/antd";
import {
  Button,
  Dropdown,
  Form,
  Input,
  Select,
  Space,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";
import { DownOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import LoadingScreen from "../state/loading";
import { uploadFileToFirebaseStorage } from "../../firebase/storage";
import TextArea from "antd/es/input/TextArea";
import { ProjectCategories } from "../../constants/options";

export const ProjectEdit: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { formProps, saveButtonProps, queryResult } = useForm();

  const projectData = queryResult?.data?.data;
  const isLoading = queryResult?.isFetching || queryResult?.isLoading;
  if (isLoading || !projectData) return <LoadingScreen />;
  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        initialValues={projectData ?? { thumbnailUrl: "14" }}
        layout="vertical"
      >
        <Form.Item
          label={translate("projects.fields.name")}
          name={["name"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={translate("projects.fields.category")}
          name={["category"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select>
            {ProjectCategories.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label={translate("projects.fields.description")}
          name={["description"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item label={translate("projects.fields.donor")}>
          <div style={{ marginLeft: "16px" }}>
            <div>
              <Form.Item
                label={translate("projects.fields.description")}
                name={["donor.description"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <TextArea rows={4} />
              </Form.Item>
            </div>
            <Form.Item
              label={translate("projects.fields.logo")}
              name="donor.logos"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              {
                <ImageUploader
                  docId={formProps.form?.getFieldValue("id")}
                  handleChange={(url) => {
                    formProps.form?.setFieldValue("thumbnailUrl", url);
                  }}
                  thumbnailUrl={
                    formProps.form?.getFieldValue("thumbnailUrl") ??
                    projectData.thumbnailUrl
                  }
                />
              }
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item label={translate("projects.fields.progress")}>
          <div style={{ marginLeft: "16px" }}>
            <div>
              <Form.Item
                label={translate("projects.fields.stage")}
                name={["progress.0.title"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={translate("projects.fields.description")}
                name={["progress.0.description"]}
                rules={[]}
              >
                <Input />
              </Form.Item>
            </div>
            <Form.Item
              label={translate("projects.fields.images")}
              name="progress.images"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              {
                <ImageUploader
                  docId={formProps.form?.getFieldValue("id")}
                  handleChange={(url) => {
                    formProps.form?.setFieldValue("thumbnailUrl", url);
                  }}
                  thumbnailUrl={
                    formProps.form?.getFieldValue("thumbnailUrl") ??
                    projectData.thumbnailUrl
                  }
                />
              }
            </Form.Item>
          </div>
          <div>
            <Button style={{ width: "100%" }}>Thêm giai đoạn</Button>
          </div>
        </Form.Item>

        <Form.Item label={translate("projects.fields.body")}>
          <div style={{ marginLeft: "16px" }}>
            <div>
              <Form.Item
                label={translate("projects.fields.tab_name")}
                name={["progress.0.title"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={translate("projects.fields.content")}
                name={["progress.0.description"]}
                rules={[]}
              >
                <TextArea rows={4} />
              </Form.Item>
              <Dropdown
                menu={{
                  items: [
                    {
                      label: "Slide show",
                      key: "1",
                      icon: <UserOutlined />,
                    },
                    {
                      label: "Iframe",
                      key: "2",
                      icon: <UserOutlined />,
                    },
                    
                  ],
                  onClick: (e) => {
                    console.log("click", e);
                  },
                }}
              >
                <Button>
                  <Space>
                    Thêm mục
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>
            </div>
          </div>
          <div>
            <Button style={{ width: "100%", marginTop: '20px' }}>Thêm Tab</Button>
          </div>
        </Form.Item>
      </Form>
    </Edit>
  );
};

const ImageUploader = (props: {
  thumbnailUrl: string;
  handleChange: (url: string) => any;
  docId: string;
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([
    {
      uid: props.thumbnailUrl,
      url: props.thumbnailUrl,
    } as UploadFile,
  ]);
  console.log(fileList);
  const handleChange: UploadProps["onChange"] = ({
    file,
    fileList: newFileList,
  }) => {
    if (file.status === "done") {
      const url = file.response.url;
      props.handleChange(url);
    }
    setFileList(newFileList);
  };

  return (
    <Upload
      showUploadList={{
        showRemoveIcon: false,
      }}
      fileList={fileList}
      maxCount={1}
      accept="images/**"
      listType="picture-card"
      defaultFileList={fileList}
      onChange={handleChange}
      customRequest={async ({ file, onSuccess, onError, onProgress }) => {
        try {
          uploadFileToFirebaseStorage({
            file: file as File,
            fileName: props.docId,
            bucketName: "thumbnail",
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
    >
      <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
    </Upload>
  );
};
