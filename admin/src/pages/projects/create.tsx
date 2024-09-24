import React, { useEffect } from "react";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import { Create, useForm, SaveButton } from "@refinedev/antd";
import { Form, Input, InputNumber, Select } from "antd";
import { useLocation } from "react-router-dom";
import { CLIENT_URL, categoryMapping, classificationMapping, statusMapping } from "../../utils/constants";
import RichTextEditor from "../../components/RichTextEditor";
import ImageUploader from "../../components/ImageUploader";
import { provincesAndCities } from "../../utils/vietnam-provinces";

export const ProjectCreate: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { pathname } = useLocation();
  const collectionName = pathname.split("/")[1];
  const isProject = collectionName.includes("du-an");
  const HtmlContent = ({ html }: { html: any }) => <div dangerouslySetInnerHTML={{ __html: html }} />;

  const { formProps, saveButtonProps } = useForm<Sucmanh2000.Post>({
    errorNotification(error) {
      return {
        description: error?.message ?? "Lỗi ở server",
        message: "Error code: " + error?.statusCode,
        type: "error",
      };
    },
    // @ts-ignore
    successNotification: (data: any) => {
      const messageHtml = `<a target="_blank" href="${CLIENT_URL + "/" + data?.category + "/" + data?.slug}">${data?.name}</a>`;
      return {
        description: "Tạo mới thành công",
        message: <HtmlContent html={messageHtml} />,
        type: "success",
      };
    },
  });

  useEffect(() => {
    formProps.form?.setFieldValue("publish_date", new Date().toISOString().substr(0, 10));
    formProps.form?.setFieldValue("category", collectionName);
    formProps.form?.setFieldValue("classification", "truong-hoc");
    formProps.form?.setFieldValue("status", "can-quyen-gop");
  }, []);

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        {/* Above save button */}
        <div style={{ width: "100%", textAlign: "right" }}>
          <SaveButton onClick={formProps.form?.submit} style={{ width: "fit-content" }} />
        </div>

        {/* Name */}
        <Form.Item label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{translate("post.fields.name")}</span>} name={"name"} rules={[{ required: true }]}>
          <Input autoFocus />
        </Form.Item>

        {/* Thumbnail */}
        <Form.Item label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{translate("post.fields.thumbnail")}</span>} name={"thumbnail"} rules={[{ required: true }]}>
          <ImageUploader
            maxCount={1}
            handleChange={(urls) => {
              if (urls && urls.length > 0) {
                formProps.form?.setFieldValue("thumbnail", urls[0].image);
              }
            }}
          />
        </Form.Item>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {/* Publish Date */}
          <Form.Item
            label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{translate("post.fields.publish_date")}</span>}
            name={"publish_date"}
            rules={[{ required: true }]}
            style={{ width: "fit-content", minWidth: "150px" }}
          >
            <Input type="date" />
          </Form.Item>

          {/* Category */}
          <Form.Item
            label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{translate("post.fields.category")}</span>}
            name={"category"}
            rules={[{ required: true }]}
            style={{ width: "fit-content", minWidth: "150px" }}
          >
            <Select disabled onChange={(value) => formProps.form?.setFieldValue("category", value)}>
              {Object.entries(categoryMapping).map(([value, label]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Classification */}
          {isProject && (
            <Form.Item
              label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{translate("post.fields.classification")}</span>}
              name={"classification"}
              rules={[{ required: true }]}
              style={{ width: "fit-content", minWidth: "150px" }}
            >
              <Select>
                {Object.entries(classificationMapping).map(([value, label]) => (
                  <Select.Option key={value} value={value}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* Status */}
          {isProject && (
            <Form.Item
              label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{translate("post.fields.status")}</span>}
              name={"status"}
              rules={[{ required: true }]}
              style={{ width: "fit-content", minWidth: "150px" }}
            >
              <Select>
                {Object.entries(statusMapping).map(([value, label]) => (
                  <Select.Option key={value} value={value}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* TotalFund */}
          {isProject && (
            <Form.Item
              label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{translate("post.fields.totalFund")}</span>}
              name={"totalFund"}
              rules={[{ required: true }]}
              style={{ width: "fit-content", minWidth: "150px" }}
            >
              <InputNumber defaultValue={0} style={{ width: "100%" }} addonAfter={".000.000"} />
            </Form.Item>
          )}

          {/* Location - Province */}
          {isProject && (
            <Form.Item
              label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{translate("post.fields.province")}</span>}
              name={"province"}
              rules={[{ required: true }]}
              style={{ width: "fit-content", minWidth: "150px" }}
            >
              <Select showSearch placeholder="Select">
                {provincesAndCities.map((p) => (
                  <Select.Option key={p.province} value={p.province}>
                    {p.province}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </div>

        {/* Description */}
        {/* {isProject && (
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
        )} */}

        {/* Donor */}
        {isProject && (
          <Form.Item label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{translate("post.fields.donor.name")}</span>}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.donor.description")}</span>} name={"donor.description"}>
                <RichTextEditor initialContent={""} onChange={() => {}} />
              </Form.Item>

              <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.donor.images")}</span>} name={"donor.images"}>
                <ImageUploader
                  handleChange={(urls) => {
                    if (urls && urls.length > 0) {
                      formProps.form?.setFieldValue("donor.images", urls);
                    }
                  }}
                />
              </Form.Item>
            </div>
          </Form.Item>
        )}

        {/* Progress */}
        {isProject && (
          <Form.Item label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{translate("post.fields.progress.name")}</span>}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.progress.images1")}</span>} name={"progress.images1"}>
                <ImageUploader
                  handleChange={(urls) => {
                    if (urls && urls.length > 0) {
                      formProps.form?.setFieldValue("progress.images1", urls);
                    }
                  }}
                />
              </Form.Item>
              <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.progress.images2")}</span>} name={"progress.images2"}>
                <ImageUploader
                  handleChange={(urls) => {
                    if (urls && urls.length > 0) {
                      formProps.form?.setFieldValue("progress.images2", urls);
                    }
                  }}
                />
              </Form.Item>
              <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.progress.images3")}</span>} name={"progress.images3"}>
                <ImageUploader
                  handleChange={(urls) => {
                    if (urls && urls.length > 0) {
                      formProps.form?.setFieldValue("progress.images3", urls);
                    }
                  }}
                />
              </Form.Item>
            </div>
          </Form.Item>
        )}

        {/* Hoàn cảnh */}
        <Form.Item label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{isProject ? translate("post.fields.content.section1") : ""}</span>}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.content.description")}</span>} name={"content.description1"}>
              <RichTextEditor initialContent={""} onChange={() => {}} />
            </Form.Item>

            <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.content.images")}</span>} name={"content.images1"}>
              <ImageUploader
                handleChange={(urls) => {
                  if (urls && urls.length > 0) {
                    formProps.form?.setFieldValue("content.images1", urls);
                  }
                }}
              />
            </Form.Item>
          </div>
        </Form.Item>

        {/* Nhà hảo tâm */}
        {isProject && (
          <Form.Item label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{translate("post.fields.content.section2")}</span>}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.content.description")}</span>} name={"content.description2"}>
                <RichTextEditor initialContent={""} onChange={() => {}} />
              </Form.Item>

              <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.content.images")}</span>} name={"content.images2"}>
                <ImageUploader
                  handleChange={(urls) => {
                    if (urls && urls.length > 0) {
                      formProps.form?.setFieldValue("content.images2", urls);
                    }
                  }}
                />
              </Form.Item>
            </div>
          </Form.Item>
        )}

        {/* Mô hình xây */}
        {isProject && (
          <Form.Item label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{translate("post.fields.content.section3")}</span>}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.content.description")}</span>} name={"content.description3"}>
                <RichTextEditor initialContent={""} onChange={() => {}} />
              </Form.Item>

              <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.content.images")}</span>} name={"content.images3"}>
                <ImageUploader
                  handleChange={(urls) => {
                    if (urls && urls.length > 0) {
                      formProps.form?.setFieldValue("content.images3", urls);
                    }
                  }}
                />
              </Form.Item>
            </div>
          </Form.Item>
        )}
      </Form>
    </Create>
  );
};
