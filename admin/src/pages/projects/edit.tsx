import React, { useState } from "react";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import { Edit, useForm } from "@refinedev/antd";
import { Button, Dropdown, Form, Input, Select, Space, Upload, UploadFile, UploadProps } from "antd";
import { DownOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import LoadingScreen from "../components/LoadingScreen";
import { uploadFileToFirebaseStorage } from "../../firebase/storage";
import TextArea from "antd/es/input/TextArea";
import { ProjectCategories, categoryMapping, classificationMapping } from "../../constants";
import RichTextEditor from "../../components/RichTextEditor";
import ImageUploader from "../../components/ImageUploader";

export const ProjectEdit: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { formProps, saveButtonProps, queryResult } = useForm();

  const projectData = queryResult?.data?.data as Sucmanh2000.Post;
  const isLoading = queryResult?.isFetching || queryResult?.isLoading;

  if (isLoading || !projectData) return <LoadingScreen />;
  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} initialValues={projectData ?? { thumbnailUrl: "14" }} layout="vertical">
        <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.name")}</span>} name={"name"} rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.category")}</span>} name={"category"} rules={[{ required: true }]}>
          <Select>
            {Object.entries(categoryMapping).map(([value, label]) => (
              <Select.Option key={value} value={value}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.classification")}</span>} name={"classification"} rules={[{ required: true }]}>
          <Select>
            {Object.entries(classificationMapping).map(([value, label]) => (
              <Select.Option key={value} value={value}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.description")}</span>} name={"description"} rules={[{ required: true }]}>
          <RichTextEditor initialContent={projectData.description} onChange={() => {}} />
        </Form.Item>

        <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.donor.name")}</span>} name={"donor.name"} rules={[{ required: true }]}>
          <div style={{ marginLeft: "24px", display: "flex", justifyContent: "space-between" }}>
            <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.donor.description")}</span>} name={"donor.description"} rules={[{ required: true }]}>
              <RichTextEditor initialContent={projectData.donor?.description} onChange={() => {}} />
            </Form.Item>

            <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.donor.image")}</span>} name={"donor.image"} rules={[{ required: false }]}>
              <ImageUploader docId={formProps.form?.getFieldValue("id")} handleChange={(url) => formProps.form?.setFieldValue("thumbnailUrl", url)} />
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.progress.name")}</span>} name={"progress.name"} rules={[{ required: true }]}>
          <div style={{ marginLeft: "24px", display: "flex", justifyContent: "space-between" }}>
            <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.progress.section1")}</span>} name={"progress.section1"} rules={[{ required: false }]}>
              <ImageUploader docId={formProps.form?.getFieldValue("id")} handleChange={(url) => formProps.form?.setFieldValue("thumbnailUrl", url)} />
            </Form.Item>
            <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.progress.section2")}</span>} name={"progress.section2"} rules={[{ required: false }]}>
              <ImageUploader docId={formProps.form?.getFieldValue("id")} handleChange={(url) => formProps.form?.setFieldValue("thumbnailUrl", url)} />
            </Form.Item>
            <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.progress.section3")}</span>} name={"progress.section3"} rules={[{ required: false }]}>
              <ImageUploader docId={formProps.form?.getFieldValue("id")} handleChange={(url) => formProps.form?.setFieldValue("thumbnailUrl", url)} />
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.content.name")}</span>} name={"content.name"} rules={[{ required: true }]}>
          <div style={{ marginLeft: "24px" }}>
            <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.content.section1")}</span>} name={"content.section1"} rules={[{ required: false }]}>
              <div style={{ marginLeft: "24px", display: "flex", justifyContent: "space-between" }}>
                <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.content.description")}</span>} name={"content.description"} rules={[{ required: false }]}>
                  <RichTextEditor initialContent={projectData.donor?.description} onChange={() => {}} />
                </Form.Item>

                <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.content.slide_show.image")}</span>} name={"content.slide_show.image"} rules={[{ required: false }]}>
                  <ImageUploader docId={formProps.form?.getFieldValue("id")} handleChange={(url) => formProps.form?.setFieldValue("thumbnailUrl", url)} />
                </Form.Item>
              </div>
            </Form.Item>

            <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.content.section2")}</span>} name={"content.section2"} rules={[{ required: false }]}>
              <div style={{ marginLeft: "24px", display: "flex", justifyContent: "space-between" }}>
                <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.content.description")}</span>} name={"content.description"} rules={[{ required: false }]}>
                  <RichTextEditor initialContent={projectData.donor?.description} onChange={() => {}} />
                </Form.Item>

                <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.content.slide_show.image")}</span>} name={"content.slide_show.image"} rules={[{ required: false }]}>
                  <ImageUploader docId={formProps.form?.getFieldValue("id")} handleChange={(url, caption) => formProps.form?.setFieldValue("thumbnailUrl", url)} />
                </Form.Item>
              </div>
            </Form.Item>

            <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.content.section3")}</span>} name={"content.section3"} rules={[{ required: false }]}>
              <div style={{ marginLeft: "24px", display: "flex", justifyContent: "space-between" }}>
                <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.content.description")}</span>} name={"content.description"} rules={[{ required: false }]}>
                  <RichTextEditor initialContent={projectData.donor?.description} onChange={() => {}} />
                </Form.Item>

                <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("projects.fields.content.slide_show.image")}</span>} name={"content.slide_show.image"} rules={[{ required: false }]}>
                  <ImageUploader docId={formProps.form?.getFieldValue("id")} handleChange={(url) => formProps.form?.setFieldValue("thumbnailUrl", url)} />
                </Form.Item>
              </div>
            </Form.Item>
          </div>
        </Form.Item>
      </Form>
    </Edit>
  );
};
