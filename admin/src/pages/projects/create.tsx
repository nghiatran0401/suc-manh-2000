import React, { useRef } from "react";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { Button, Form, Input, Select, Tooltip, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import { generateNewDocumentId } from "../../firebase/firestore";
import { ProjectResource } from "../../resources";
import TextArea from "antd/es/input/TextArea";
import Group from "antd/lib/input/Group";

export const ProjectCreate: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const ref = useRef(generateNewDocumentId({ collection: ProjectResource.name }));
  const { formProps, saveButtonProps, queryResult } = useForm<Sucmanh2000.Post>({});

  console.log({ data: formProps.form?.getFieldValue("thumbnailUrl") });
  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} initialValues={{ id: ref.current }} layout="horizontal">
        <Form.Item
          label={translate("projects.fields.id")}
          name={["id"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input disabled value={3} />
        </Form.Item>

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
            {/* {ProjectCategories.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))} */}
          </Select>
        </Form.Item>
        <Form.Item
          label={translate("projects.fields.style")}
          name={["style"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select>
            {/* {ProjectCategories.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))} */}
          </Select>
        </Form.Item>
        <Form.Item
          label={translate("projects.fields.time")}
          name={["time"]}
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
          name={["description"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <TextArea rows={4} />
        </Form.Item>
        <Group style={{ marginBottom: "12px" }}></Group>
        <Form.Item label={translate("projects.fields.thumbnailUrl")}>
          <Form.Item
            name="thumbnailUrl"
            noStyle
            rules={[
              {
                required: true,
              },
            ]}
          >
            {/* <ImgCrop aspect={1.25} rotationSlider>
              <Upload
                maxCount={1}
                accept="image/*"
                onChange={(info) => {
                  if (info.file.status === "done") {
                    const url = info.file.response.url;
                    formProps.form?.setFieldValue("thumbnailUrl", url);
                  }
                }}
                customRequest={async ({ file, onSuccess, onError, onProgress }) => {
                  try {
                    uploadFileToFirebaseStorage({
                      file: file as File,
                      fileName: formProps.form?.getFieldValue("id") ?? v4() + ".png",
                      bucketName: "thumbnail",
                      handleUrlResponse(url) {
                        onSuccess?.call(this, { url }, undefined);
                      },
                      handleError(error) {
                        console.log({ error });
                        onError?.call(this, error);
                      },
                      handleSnapshot: (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        onProgress?.call(this, { percent: progress });
                      },
                    });
                  } catch (error: any) {
                    console.log(error);
                    onError?.call(this, error);
                  }
                }}
                listType="picture-card"
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </ImgCrop> */}
          </Form.Item>
        </Form.Item>
      </Form>
    </Create>
  );
};
