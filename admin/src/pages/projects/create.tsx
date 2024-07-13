import React, { useRef, useEffect } from "react";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import { Create, useForm, SaveButton } from "@refinedev/antd";
import { Form, Input, InputNumber, Select } from "antd";
import { useLocation } from "react-router-dom";
import { CLIENT_URL, categoryMapping, classificationMapping, statusMapping } from "../../constants";
import RichTextEditor from "../../components/RichTextEditor";
import ImageUploader from "../../components/ImageUploader";
import { generateNewDocumentId } from "../../helpers";

export const ProjectCreate: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { pathname } = useLocation();
  const collectionName = pathname.split("/")[1];
  const isProject = collectionName.includes("du-an") || collectionName.includes("phong-tin-hoc");
  const ref = useRef(generateNewDocumentId({ collection: collectionName }));
  const HtmlContent = ({ html }: { html: any }) => <div dangerouslySetInnerHTML={{ __html: html }} />;

  const { formProps, saveButtonProps } = useForm<Sucmanh2000.Post>({
    // redirect: "edit",
    errorNotification(error, values, resource) {
      return {
        description: error?.message ?? "Lỗi ở server",
        message: "Error code: " + error?.statusCode,
        type: "error",
      };
    },
    // @ts-ignore
    successNotification: (data: any, values: any) => {
      const messageHtml = `<a target="_blank" href="${CLIENT_URL + "/" + data?.data?.category + "/" + data?.data?.slug}">${data?.data?.name}</a>`;
      return {
        description: "Tạo mới thành công",
        message: <HtmlContent html={messageHtml} />,
        type: "success",
      };
    },
    // onMutationSuccess: (data) => {
    //   window.location.href = `/${collectionName}/edit/${data.data.slug}`;
    // },
  });

  useEffect(() => {
    formProps.form?.setFieldValue("id", ref.current);
    formProps.form?.setFieldValue("publish_date", new Date().toISOString().substr(0, 10));
    formProps.form?.setFieldValue("category", collectionName);
    formProps.form?.setFieldValue("classification", "truong-hoc");
    formProps.form?.setFieldValue("status", "can-quyen-gop");
  }, []);

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="horizontal" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Above save button */}
        <div style={{ width: "100%", textAlign: "right" }}>
          <SaveButton onClick={formProps.form?.submit} style={{ width: "fit-content" }} />
        </div>

        {/* ID */}
        <div style={{ display: "none" }}>
          <div
            style={{
              width: "20%",
              fontWeight: "bold",
              fontSize: "16px",
              paddingRight: "10px",
            }}
          >
            {translate("post.fields.id")}
          </div>
          <Form.Item name={"id"} rules={[{ required: true }]} style={{ width: "80%" }}>
            <Input disabled />
          </Form.Item>
        </div>

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
            <span style={{ color: "red" }}>*</span> {translate("post.fields.name")}
          </div>
          <Form.Item name={"name"} rules={[{ required: true }]} style={{ width: "80%" }}>
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
            <span style={{ color: "red" }}>*</span> {translate("post.fields.thumbnail")}
          </div>
          <Form.Item name={"thumbnail"} rules={[{ required: true }]}>
            <ImageUploader
              maxCount={1}
              handleChange={(urls) => {
                if (urls && urls.length > 0) {
                  console.log("here4", urls[0].image);
                  formProps.form?.setFieldValue("thumbnail", urls[0].image);
                }
              }}
            />
          </Form.Item>
        </div>

        {/* Publish Date */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              width: "20%",
              fontWeight: "bold",
              fontSize: "16px",
              paddingRight: "10px",
            }}
          >
            <span style={{ color: "red" }}>*</span> {translate("post.fields.publish_date")}
          </div>
          <Form.Item name={"publish_date"} style={{ width: "40%" }} rules={[{ required: true }]}>
            <Input type="date" />
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
            <span style={{ color: "red" }}>*</span> {translate("post.fields.category")}
          </div>
          <Form.Item name={"category"} rules={[{ required: true }]} style={{ width: "40%" }}>
            <Select disabled onChange={(value) => formProps.form?.setFieldValue("category", value)}>
              {Object.entries(categoryMapping).map(([value, label]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* Classification */}
        {isProject && (
          <div style={{ display: "flex" }}>
            <div
              style={{
                width: "20%",
                fontWeight: "bold",
                fontSize: "16px",
                paddingRight: "10px",
              }}
            >
              <span style={{ color: "red" }}>*</span> {translate("post.fields.classification")}
            </div>
            <Form.Item name={"classification"} rules={[{ required: true }]} style={{ width: "40%" }}>
              <Select>
                {Object.entries(classificationMapping).map(([value, label]) => (
                  <Select.Option key={value} value={value}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        )}

        {/* Status */}
        {isProject && (
          <div style={{ display: "flex" }}>
            <div
              style={{
                width: "20%",
                fontWeight: "bold",
                fontSize: "16px",
                paddingRight: "10px",
              }}
            >
              <span style={{ color: "red" }}>*</span> {translate("post.fields.status")}
            </div>
            <Form.Item name={"status"} rules={[{ required: true }]} style={{ width: "40%" }}>
              <Select>
                {Object.entries(statusMapping).map(([value, label]) => (
                  <Select.Option key={value} value={value}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        )}

        {/* TotalFund */}
        {isProject && (
          <div style={{ display: "flex" }}>
            <div
              style={{
                width: "20%",
                fontWeight: "bold",
                fontSize: "16px",
                paddingRight: "10px",
              }}
            >
              <span style={{ color: "red" }}>*</span> {translate("post.fields.totalFund")}
            </div>
            <Form.Item name={"totalFund"} rules={[{ required: true }]} style={{ width: "40%" }}>
              <InputNumber defaultValue={0} style={{ width: "100%" }} addonAfter={".000.000"} />
            </Form.Item>
          </div>
        )}

        {/* Start Date */}
        {isProject && (
          <div style={{ display: "flex" }}>
            <div
              style={{
                width: "20%",
                fontWeight: "bold",
                fontSize: "16px",
                paddingRight: "10px",
              }}
            >
              {translate("post.fields.start_date")}
            </div>
            <Form.Item name={"start_date"} style={{ width: "40%" }}>
              <Input type="date" />
            </Form.Item>
          </div>
        )}

        {/* End Date */}
        {isProject && (
          <div style={{ display: "flex" }}>
            <div
              style={{
                width: "20%",
                fontWeight: "bold",
                fontSize: "16px",
                paddingRight: "10px",
              }}
            >
              {translate("post.fields.end_date")}
            </div>
            <Form.Item name={"end_date"} style={{ width: "40%" }}>
              <Input type="date" />
            </Form.Item>
          </div>
        )}

        {/* Description */}
        {isProject && (
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
        )}

        {/* Donor */}
        {isProject && (
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
              <div style={{ display: "flex", flexDirection: "column", width: "70%" }}>
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>{translate("post.fields.donor.description")}</div>
                <Form.Item name={"donor.description"}>
                  <RichTextEditor initialContent={""} onChange={() => {}} />
                </Form.Item>
              </div>

              <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>{translate("post.fields.donor.images")}</div>
                <Form.Item name={"donor.images"}>
                  <ImageUploader
                    handleChange={(urls) => {
                      if (urls && urls.length > 0) {
                        formProps.form?.setFieldValue("donor.images", urls);
                      }
                    }}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        {isProject && (
          <div style={{ display: "flex" }}>
            <div style={{ width: "20%", fontWeight: "bold", fontSize: "16px" }}>{translate("post.fields.progress.name")}</div>

            <div
              style={{
                display: "flex",
                width: "80%",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>{translate("post.fields.progress.images1")}</div>
                <Form.Item name={"progress.images1"}>
                  <ImageUploader
                    handleChange={(urls) => {
                      if (urls && urls.length > 0) {
                        formProps.form?.setFieldValue("progress.images1", urls);
                      }
                    }}
                  />
                </Form.Item>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>{translate("post.fields.progress.images2")}</div>
                <Form.Item name={"progress.images2"}>
                  <ImageUploader
                    handleChange={(urls) => {
                      if (urls && urls.length > 0) {
                        formProps.form?.setFieldValue("progress.images2", urls);
                      }
                    }}
                  />
                </Form.Item>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>{translate("post.fields.progress.images3")}</div>
                <Form.Item name={"progress.images3"}>
                  <ImageUploader
                    handleChange={(urls) => {
                      if (urls && urls.length > 0) {
                        formProps.form?.setFieldValue("progress.images3", urls);
                      }
                    }}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        )}

        {/* Tabs content */}
        <div>
          <div style={{ display: "flex" }}>
            <div style={{ width: "20%", fontWeight: "bold", fontSize: "16px" }}>{isProject ? `${translate("post.fields.content.name")} (${translate("post.fields.content.section1")})` : "Nội dung"}</div>

            <div
              style={{
                display: "flex",
                width: "80%",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", width: "70%" }}>
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>{translate("post.fields.content.description")}</div>
                <Form.Item name={"content.description1"}>
                  <RichTextEditor initialContent={""} onChange={() => {}} />
                </Form.Item>
              </div>

              <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>{translate("post.fields.content.images")}</div>
                <Form.Item name={"content.images1"}>
                  <ImageUploader
                    handleChange={(urls) => {
                      if (urls && urls.length > 0) {
                        formProps.form?.setFieldValue("content.images1", urls);
                      }
                    }}
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {isProject && (
            <div style={{ display: "flex" }}>
              <div style={{ width: "20%", fontWeight: "bold", fontSize: "16px" }}>
                {translate("post.fields.content.name")} ({translate("post.fields.content.section2")})
              </div>

              <div
                style={{
                  display: "flex",
                  width: "80%",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", width: "70%" }}>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>{translate("post.fields.content.description")}</div>
                  <Form.Item name={"content.description2"}>
                    <RichTextEditor initialContent={""} onChange={() => {}} />
                  </Form.Item>
                </div>

                <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>{translate("post.fields.content.images")}</div>
                  <Form.Item name={"content.images2"}>
                    <ImageUploader
                      handleChange={(urls) => {
                        if (urls && urls.length > 0) {
                          formProps.form?.setFieldValue("content.images2", urls);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          )}

          {isProject && (
            <div style={{ display: "flex" }}>
              <div style={{ width: "20%", fontWeight: "bold", fontSize: "16px" }}>
                {translate("post.fields.content.name")} ({translate("post.fields.content.section3")})
              </div>

              <div
                style={{
                  display: "flex",
                  width: "80%",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", width: "70%" }}>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>{translate("post.fields.content.description")}</div>
                  <Form.Item name={"content.description3"}>
                    <RichTextEditor initialContent={""} onChange={() => {}} />
                  </Form.Item>
                </div>

                <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>{translate("post.fields.content.images")}</div>
                  <Form.Item name={"content.images3"}>
                    <ImageUploader
                      handleChange={(urls) => {
                        if (urls && urls.length > 0) {
                          formProps.form?.setFieldValue("content.images3", urls);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          )}
        </div>
      </Form>
    </Create>
  );
};
