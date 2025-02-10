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

const progressNewCollection = ["du-an-2025", "du-an-2024", "du-an-2023", "du-an-2022"];

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
      projectData.donors?.forEach((donor: any, index) => {
        formProps.form?.setFieldValue(["donors", index, "donation", "amount"], donor?.donation?.amount / 1000000);
      });
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
        {isProject && ["du-an-2024", "du-an-2025"].includes(collectionName) && (
          <Form.Item label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{translate("post.fields.donor.section")}</span>}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                flexDirection: "column",
              }}
            >
              {projectData.donors?.map((donor: any, index) => (
                <div key={index} style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
                  <Form.Item label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{translate("post.fields.donor.id")}</span>} name={["donors", index, "donor", "id"]}>
                    <Input defaultValue={donor?.donor?.id} disabled />
                  </Form.Item>

                  <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.donor.totalProjects")}</span>} name={["donors", index, "donor", "totalProjects"]}>
                    <Input defaultValue={donor?.donor?.totalProjects} disabled />
                  </Form.Item>

                  <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.donor.name") + ` ${index + 1}`}</span>} name={["donors", index, "donor", "name"]}>
                    <Input defaultValue={donor?.donor?.name} />
                  </Form.Item>

                  <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.donor.type")}</span>} name={["donors", index, "donor", "type"]}>
                    <Input defaultValue={donor?.donor?.type} />
                  </Form.Item>

                  <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.donor.description")}</span>} name={["donors", index, "donor", "intro"]}>
                    <Input.TextArea defaultValue={donor?.donor?.intro ?? ""} rows={8} />
                  </Form.Item>

                  <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.donor.logo")}</span>} name={["donors", index, "donor", "logo"]}>
                    <ImageUploader
                      maxCount={1}
                      initialImages={[{ image: donor?.donor?.logo, caption: "Logo" }]}
                      handleChange={(urls) => {
                        if (urls && urls.length > 0) {
                          formProps.form?.setFieldValue(["donors", index, "donor", "logo"], urls[0].image);
                        }
                      }}
                    />
                  </Form.Item>

                  <Form.Item label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>{translate("post.fields.donation.id")}</span>} name={["donors", index, "donation", "id"]}>
                    <Input defaultValue={donor?.donation?.donationId} disabled />
                  </Form.Item>

                  <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{translate("post.fields.donation.amount")}</span>} name={["donors", index, "donation", "amount"]}>
                    <InputNumber defaultValue={donor?.donation?.amount} style={{ width: "100%" }} addonAfter={".000.000"} />
                  </Form.Item>
                </div>
              ))}
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
        {!isProject && (
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
        )}
      </Form>
    </Edit>
  );
};
