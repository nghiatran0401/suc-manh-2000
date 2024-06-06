import React, { useRef, useEffect } from "react";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
import { useLocation } from "react-router-dom";
import { categoryMapping, classificationMapping } from "../../constants";
import RichTextEditor from "../../components/RichTextEditor";
import ImageUploader from "../../components/ImageUploader";
import { generateNewDocumentId } from "../../helpers";

export const ProjectCreate: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { pathname } = useLocation();
  const collectionName = pathname.split("/")[1];

  const ref = useRef(generateNewDocumentId({ collection: collectionName }));
  const { formProps, saveButtonProps } = useForm<Sucmanh2000.Post>({
    redirect: "create",
  });

  useEffect(() => {
    formProps.form?.setFieldValue("id", ref.current);
    formProps.form?.setFieldValue("category", collectionName);
    formProps.form?.setFieldValue("classification", "Trường học");
  }, []);

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="horizontal"
        style={{ display: "flex", flexDirection: "column", gap: "24px" }}
      >
       
        {/* Name */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              width: "20%",
              fontWeight: "bold",
              fontSize: "16px",
              paddingRight: "10px",
            }}
          >
            {translate("post.fields.name")}
          </div>
          <Form.Item
            name={"name"}
            rules={[{ required: true }]}
            style={{ width: "80%" }}
          >
            <Input autoFocus />
          </Form.Item>
        </div>

        {/* Thumbnail */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              width: "20%",
              fontWeight: "bold",
              fontSize: "16px",
              paddingRight: "10px",
            }}
          >
            {translate("post.fields.thumbnail")}
          </div>
          <Form.Item
            name={"thumbnail"}
            rules={[{ required: true }]}
          >
            <ImageUploader
              maxCount={1}
              initialImages={[]}
              handleChange={([image]) => {
                formProps.form?.setFieldValue("thumbnail", image.image);
              }}
            />
          </Form.Item>
        </div>

        {/* Category */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              width: "20%",
              fontWeight: "bold",
              fontSize: "16px",
              paddingRight: "10px",
            }}
          >
            {translate("post.fields.category")}
          </div>
          <Form.Item
            name={"category"}
            rules={[{ required: true }]}
            style={{ width: "80%" }}
          >
            <Select
              disabled
              onChange={(value) =>
                formProps.form?.setFieldValue("category", value)
              }
            >
              {Object.entries(categoryMapping).map(([value, label]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* Classification */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              width: "20%",
              fontWeight: "bold",
              fontSize: "16px",
              paddingRight: "10px",
            }}
          >
            {translate("post.fields.classification")}
          </div>
          <Form.Item
            name={"classification"}
            rules={[{ required: true }]}
            style={{ width: "80%" }}
          >
            <Select>
              {Object.entries(classificationMapping).map(([value, label]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* Description */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              width: "20%",
              fontWeight: "bold",
              fontSize: "16px",
              paddingRight: "10px",
            }}
          >
            {translate("post.fields.description")}
          </div>
          <Form.Item name={"description"} style={{ width: "80%" }}>
            <RichTextEditor initialContent={""} onChange={() => {}} />
          </Form.Item>
        </div>

        {/* Donor */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              width: "20%",
              fontWeight: "bold",
              fontSize: "16px",
              paddingRight: "10px",
            }}
          >
            {translate("post.fields.donor.name")}
          </div>

          <div
            style={{
              display: "flex",
              width: "80%",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                {translate("post.fields.donor.description")}
              </div>
              <Form.Item name={"donor.description"}>
                <RichTextEditor initialContent={""} onChange={() => {}} />
              </Form.Item>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                {translate("post.fields.donor.images")}
              </div>
              <Form.Item name={"donor.images"}>
                <ImageUploader
                  handleChange={(urls) =>
                    formProps.form?.setFieldValue("donor.images", urls)
                  }
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: "flex" }}>
          <div style={{ width: "20%", fontWeight: "bold", fontSize: "16px" }}>
            {translate("post.fields.progress.name")}
          </div>

          <div
            style={{
              display: "flex",
              width: "80%",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                {translate("post.fields.progress.images1")}
              </div>
              <Form.Item name={"progress.images1"}>
                <ImageUploader
                  handleChange={(urls) =>
                    formProps.form?.setFieldValue("progress.images1", urls)
                  }
                />
              </Form.Item>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                {translate("post.fields.progress.images2")}
              </div>
              <Form.Item name={"progress.images2"}>
                <ImageUploader
                  handleChange={(urls) =>
                    formProps.form?.setFieldValue("progress.images2", urls)
                  }
                />
              </Form.Item>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                {translate("post.fields.progress.images3")}
              </div>
              <Form.Item name={"progress.images3"}>
                <ImageUploader
                  handleChange={(urls) =>
                    formProps.form?.setFieldValue("progress.images3", urls)
                  }
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Tabs content */}
        <div>
          <div style={{ display: "flex" }}>
            <div style={{ width: "20%", fontWeight: "bold", fontSize: "16px" }}>
              {translate("post.fields.content.name")} (
              {translate("post.fields.content.section1")})
            </div>

            <div
              style={{
                display: "flex",
                width: "80%",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                  {translate("post.fields.content.description")}
                </div>
                <Form.Item name={"content.description1"}>
                  <RichTextEditor initialContent={""} onChange={() => {}} />
                </Form.Item>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                  {translate("post.fields.content.images")}
                </div>
                <Form.Item name={"content.images1"}>
                  <ImageUploader
                    handleChange={(urls) =>
                      formProps.form?.setFieldValue("content.images1", urls)
                    }
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          <div style={{ display: "flex" }}>
            <div style={{ width: "20%", fontWeight: "bold", fontSize: "16px" }}>
              {translate("post.fields.content.name")} (
              {translate("post.fields.content.section2")})
            </div>

            <div
              style={{
                display: "flex",
                width: "80%",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                  {translate("post.fields.content.description")}
                </div>
                <Form.Item name={"content.description2"}>
                  <RichTextEditor initialContent={""} onChange={() => {}} />
                </Form.Item>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                  {translate("post.fields.content.images")}
                </div>
                <Form.Item name={"content.images2"}>
                  <ImageUploader
                    handleChange={(urls) =>
                      formProps.form?.setFieldValue("content.images2", urls)
                    }
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          <div style={{ display: "flex" }}>
            <div style={{ width: "20%", fontWeight: "bold", fontSize: "16px" }}>
              {translate("post.fields.content.name")} (
              {translate("post.fields.content.section3")})
            </div>

            <div
              style={{
                display: "flex",
                width: "80%",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                  {translate("post.fields.content.description")}
                </div>
                <Form.Item name={"content.description3"}>
                  <RichTextEditor initialContent={""} onChange={() => {}} />
                </Form.Item>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                  {translate("post.fields.content.images")}
                </div>
                <Form.Item name={"content.images3"}>
                  <ImageUploader
                    handleChange={(urls) =>
                      formProps.form?.setFieldValue("content.images3", urls)
                    }
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </Create>
  );
};
