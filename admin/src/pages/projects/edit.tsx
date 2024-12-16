import React, { useEffect } from "react";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import { Edit, SaveButton, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Select } from "antd";
import { useLocation } from "react-router-dom";
import LoadingScreen from "../../components/LoadingScreen";
import { CLIENT_URL, categoryMapping, classificationMapping, statusMapping } from "../../utils/constants";
import RichTextEditor from "../../components/RichTextEditor";
import ImageUploader from "../../components/ImageUploader";
import { provincesAndCities } from "../../utils/vietnam-provinces";
import { ProjectPost } from "../../../../index";

const progressNewCollection = ["du-an-2024", "du-an-2023", "du-an-2022"];

export const ProjectEdit: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { pathname } = useLocation();
  const collectionName = pathname.split("/")[1];
  const isProject = collectionName.includes("du-an");
  const HtmlContent = ({ html }: { html: any }) => <div dangerouslySetInnerHTML={{ __html: html }} />;

  const { formProps, saveButtonProps, queryResult } = useForm({
    errorNotification(error) {
      return {
        description: error?.message ?? "Lỗi ở server",
        message: "Error code: " + error?.statusCode,
        type: "error",
      };
    },
    // @ts-ignore
    successNotification(data: any) {
      const messageHtml = `<a target="_blank" href="${CLIENT_URL + "/" + data?.category + "/" + data?.slug}">${data?.name}</a>`;
      return {
        description: "Cập nhật thành công",
        message: <HtmlContent html={messageHtml} />,
        type: "success",
      };
    },
  });

  const projectData = queryResult?.data?.data as ProjectPost;
  const isLoading = queryResult?.isFetching || queryResult?.isLoading;

  useEffect(() => {
    if (projectData) {
      formProps.form?.setFieldValue("totalFund", projectData.totalFund ? projectData.totalFund / 1000000 : 0);
      formProps.form?.setFieldValue("province", projectData.location?.province);
    }
  }, [projectData]);

  if (isLoading || !projectData) return <LoadingScreen />;
  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} initialValues={projectData} layout="vertical">
        {/* Above save button */}
        <div style={{ width: "100%", textAlign: "right" }}>
          <SaveButton onClick={formProps.form?.submit} style={{ width: "fit-content" }} />
        </div>

        {/* Name */}
        <Form.Item label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{translate("post.fields.name")}</span>} name={"name"} rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        {/* Thumbnail */}
        <Form.Item label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{translate("post.fields.thumbnail")}</span>} name={"thumbnail"} rules={[{ required: true }]}>
          <ImageUploader
            maxCount={1}
            initialImages={
              projectData.thumbnail
                ? [
                    {
                      image: projectData.thumbnail,
                      caption: "Thumbnail",
                    },
                  ]
                : []
            }
            handleChange={(urls) => {
              if (urls && urls.length > 0) {
                formProps.form?.setFieldValue("thumbnail", urls[0].image);
              }
            }}
          />
        </Form.Item>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {/* Category */}
          <Form.Item
            label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{translate("post.fields.category")}</span>}
            name={"category"}
            rules={[{ required: true }]}
            style={{ width: "fit-content", minWidth: "150px" }}
          >
            <Select disabled>
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
              <InputNumber style={{ width: "100%" }} addonAfter={".000.000"} />
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
              <Select showSearch placeholder="Select or enter a new province">
                {provincesAndCities.map((p) => (
                  <Select.Option key={p.province} value={p.province}>
                    {p.province}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </div>

        {/* Donor */}
        {/* {isProject && (
          <Form.Item label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{translate("post.fields.donor.name")}</span>}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.donor.description")}</span>} name={"donor.description"}>
                <RichTextEditor initialContent={projectData.donor?.description ?? ""} onChange={() => {}} />
              </Form.Item>

              <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.donor.images")}</span>} name={"donor.images"}>
                <ImageUploader
                  initialImages={projectData.donor?.images}
                  handleChange={(urls) => {
                    if (urls && urls.length > 0) {
                      formProps.form?.setFieldValue("donor.images", urls);
                    }
                  }}
                />
              </Form.Item>
            </div>
          </Form.Item>
        )} */}

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
              <Form.Item
                label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.progress.images1")}</span>}
                name={progressNewCollection.includes(collectionName) ? "progressNew.images1" : "progress.images1"}
              >
                <ImageUploader
                  initialImages={projectData[progressNewCollection.includes(collectionName) ? "progressNew" : "progress"]?.find((p: any) => p.name === translate("post.fields.progress.images1"))?.images}
                  handleChange={(urls) => {
                    if (urls && urls.length > 0) {
                      formProps.form?.setFieldValue(progressNewCollection.includes(collectionName) ? "progressNew.images1" : "progress.images1", urls);
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.progress.images2")}</span>}
                name={progressNewCollection.includes(collectionName) ? "progressNew.images2" : "progress.images2"}
              >
                <ImageUploader
                  initialImages={projectData[progressNewCollection.includes(collectionName) ? "progressNew" : "progress"]?.find((p: any) => p.name === translate("post.fields.progress.images2"))?.images}
                  handleChange={(urls) => {
                    if (urls && urls.length > 0) {
                      formProps.form?.setFieldValue(progressNewCollection.includes(collectionName) ? "progressNew.images2" : "progress.images2", urls);
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.progress.images3")}</span>}
                name={progressNewCollection.includes(collectionName) ? "progressNew.images3" : "progress.images3"}
              >
                <ImageUploader
                  initialImages={projectData[progressNewCollection.includes(collectionName) ? "progressNew" : "progress"]?.find((p: any) => p.name === translate("post.fields.progress.images3"))?.images}
                  handleChange={(urls) => {
                    if (urls && urls.length > 0) {
                      formProps.form?.setFieldValue(progressNewCollection.includes(collectionName) ? "progressNew.images3" : "progress.images3", urls);
                    }
                  }}
                />
              </Form.Item>
            </div>
          </Form.Item>
        )}

        {/* Tabs content */}
        <Form.Item label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{isProject ? translate("post.fields.content.section1") : ""}</span>}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.content.description")}</span>} name={"content.description1"}>
              <RichTextEditor initialContent={projectData.content.tabs.find((t) => t.name === translate("post.fields.content.section1") || t.name === "Main content")?.description ?? ""} onChange={() => {}} />
            </Form.Item>

            <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.content.images")}</span>} name={"content.images1"}>
              <ImageUploader
                initialImages={projectData.content.tabs.find((p) => p.name === translate("post.fields.content.section1"))?.slide_show}
                handleChange={(urls) => {
                  if (urls && urls.length > 0) {
                    formProps.form?.setFieldValue("content.images1", urls);
                  }
                }}
              />
            </Form.Item>
          </div>
        </Form.Item>

        {/* 
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
                <RichTextEditor initialContent={projectData.content.tabs.find((t) => t.name === translate("post.fields.content.section2"))?.description ?? ""} onChange={() => {}} />
              </Form.Item>

              <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.content.images")}</span>} name={"content.images2"}>
                <ImageUploader
                  initialImages={projectData.content.tabs.find((p) => p.name === translate("post.fields.content.section2"))?.slide_show}
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
                <RichTextEditor initialContent={projectData.content.tabs.find((t) => t.name === translate("post.fields.content.section3"))?.description ?? ""} onChange={() => {}} />
              </Form.Item>

              <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.content.images")}</span>} name={"content.images3"}>
                <ImageUploader
                  initialImages={projectData.content.tabs.find((p) => p.name === translate("post.fields.content.section3"))?.slide_show}
                  handleChange={(urls) => {
                    if (urls && urls.length > 0) {
                      formProps.form?.setFieldValue("content.images3", urls);
                    }
                  }}
                />
              </Form.Item>
            </div>
          </Form.Item>
        )} */}
      </Form>
    </Edit>
  );
};
