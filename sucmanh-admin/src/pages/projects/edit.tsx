import React, { useState } from "react";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import { Edit, useForm, getValueFromEvent } from "@refinedev/antd";
import {
  Button,
  Form,
  Input,
  Select,
  Tooltip,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import LoadingScreen from "../state/loading";
import { uploadFileToFirebaseStorage } from "../../firebase/storage";
import { v4 } from "uuid";
import TextArea from "antd/es/input/TextArea";
import { categoryOptions, styleOptions } from "../../constants/options";
import { Group } from "antd/es/avatar";
export const projectDescriptions = [
  "Dự án kiến trúc tinh tế với phong cách hiện đại và sự kết hợp hài hòa giữa yếu tố truyền thống, nổi bật trong việc tạo dấu ấn riêng. Dự án thuộc loại căn hộ cao cấp, đáp ứng nhu cầu cuộc sống đẳng cấp. Chủ sở hữu của dự án là một nhà đầu tư tài ba với nhiều năm kinh nghiệm trong lĩnh vực bất động sản. Nằm tại khu vực trung tâm thành phố lớn, dự án tận dụng mọi tiện ích xung quanh như trung tâm thương mại, công viên, và giao thông thuận lợi. Diện tích toàn dự án rộng 10000m², tạo không gian sống thoải mái và thoáng đãng. Phong thủy được coi trọng, với việc tối ưu hóa luồng không khí và ánh sáng tự nhiên.",
  "Mang phong cách kiến trúc hiện đại đầy thú vị, dự án này là một tòa nhà văn phòng tinh xảo. Được xây dựng bởi một công ty công nghệ đang nổi đình đám, dự án thể hiện tính sáng tạo và tiên phong. Tọa lạc tại khu vực công nghệ cao, tòa nhà rộng 8000m² là nơi chốn cho những tâm hồn nghệ sĩ làm việc và sáng tạo. Với việc tối ưu hóa không gian làm việc và dùng công nghệ xanh, dự án hướng đến môi trường làm việc thoải mái và bền vững.",
  "Dự án kiến trúc mang phong cách đương đại với những đường nét tối giản và màu sắc trung tính. Đây là một khu dân cư cao cấp, thể hiện phong cách sống đẳng cấp và tiện nghi. Chủ sở hữu của dự án là một gia đình thế hệ thứ ba trong ngành xây dựng, với tâm huyết và tầm nhìn xa. Dự án nằm ở vị trí ven biển, mang đến không gian yên bình và gần gũi với thiên nhiên. Diện tích khu đất là 15000m², tạo cơ hội cho việc xây dựng không gian sinh thái và tiện ích xanh. Phong thủy được coi trọng để tạo sự hài hòa với môi trường.",
  "Dự án kiến trúc độc đáo kết hợp giữa phong cách công nghiệp và sự sáng tạo đầy bất ngờ. Đây là một khu trung tâm thương mại và giải trí, tạo nên không gian pha trộn giữa mua sắm và giải trí. Chủ sở hữu của dự án là một tập đoàn đa quốc gia, đang mở rộng hoạt động kinh doanh vào lĩnh vực mới. Dự án nằm tại trung tâm thành phố, là điểm hẹn cho cư dân và du khách. Với diện tích 12000m², dự án tạo nên không gian sôi động và linh hoạt, đồng thời mang tính chất thương mại mạnh mẽ.",
  "Mang phong cách kiến trúc cổ điển với những chi tiết tinh tế, dự án là một biệt thự sang trọng. Chủ sở hữu của dự án là một doanh nhân thành đạt trong lĩnh vực nghệ thuật, quyết định xây dựng một không gian riêng tư và độc đáo. Nằm tại vùng ngoại ô yên bình, biệt thự có diện tích 2000m² là nơi anh ta thư giãn và tận hưởng cuộc sống gia đình. Phong thủy và sự cân nhắc về vị trí của các yếu tố tự nhiên được đặt lên hàng đầu, để tạo ra một không gian thư thái và hài hòa.",
];

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
        layout="horizontal"
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
            {categoryOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
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
            {styleOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
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
        <Group style={{ marginBottom: "12px" }}>
          {projectDescriptions.map((value, index)=>{
            return <Tooltip placement="bottom" style={{marginRight: '6px'}} key={index} title={value}>
            <Button
              onClick={() => {
                formProps.form?.setFieldValue("htmlContent", undefined);

                formProps.form?.setFieldValue("description", value);
              }}
            >
              Mẫu mô tả {index + 1}
            </Button>
          </Tooltip>
          })}
          
        </Group>
        {projectData && (
          <Form.Item
            label={translate("projects.fields.thumbnailUrl")}
            name="thumbnailUrl"
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
        )}
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
