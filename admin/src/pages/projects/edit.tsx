import React from "react";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Row, Select } from "antd";
import { useLocation } from "react-router-dom";
import LoadingScreen from "../../components/LoadingScreen";
import { categoryMapping, classificationMapping } from "../../constants";
import RichTextEditor from "../../components/RichTextEditor";
import ImageUploader from "../../components/ImageUploader";

export const ProjectEdit: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { pathname } = useLocation();
  const collectionName = pathname.split("/")[1];
  const isProject = collectionName.includes("du-an");
  const { formProps, saveButtonProps, queryResult } = useForm({
    
    errorNotification(error, values, resource) {
      console.log({ error, values, resource });
      return {
        message: error?.message ?? "Error code: " + error?.statusCode,
        description: "Có lỗi xảy ra khi tạo dữ liệu",
        type: "error",
      };
    },
    
  });
  const projectData = queryResult?.data?.data as Sucmanh2000.Post;
  const isLoading = queryResult?.isFetching || queryResult?.isLoading;
  if (isLoading || !projectData) return <LoadingScreen />;
  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        initialValues={projectData ?? { thumbnailUrl: "14" }}
        layout="vertical"
      >
        {/* Name */}
        <Form.Item
          label={
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>
              {translate("post.fields.name")}
            </span>
          }
          name={"name"}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        {/* Thumbnail */}
        <Form.Item
          label={
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>
              {translate("post.fields.thumbnail")}
            </span>
          }
          name={"thumbnail"}
          rules={[{ required: true }]}
        >
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
            handleChange={([image]) => {
              formProps.form?.setFieldValue("thumbnail", image.image);
            }}
          />
        </Form.Item>

        {/* Category */}
        <Form.Item
          label={
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>
              {translate("post.fields.category")}
            </span>
          }
          name={"category"}
          rules={[{ required: true }]}
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
            label={
              <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                {translate("post.fields.classification")}
              </span>
            }
            name={"classification"}
            rules={[{ required: true }]}
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

        {/* Description */}
        {isProject && (
          <Form.Item
            label={
              <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                {translate("post.fields.description")}
              </span>
            }
            name={"description"}
            rules={[{ required: true }]}
          >
            <RichTextEditor
              initialContent={projectData.description}
              onChange={() => {}}
            />
          </Form.Item>
        )}

        {isProject && (
          <div>
            <Form.Item
              style={{ width: "100%" }}
              label={
                <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                  {translate("Tổng số học sinh")}
                </span>
              }
              name={"metadata.totalStudents"}
            >
              <InputNumber style={{ width: "200px" }} type="number" />
            </Form.Item>
            <Form.Item
              style={{ width: "100%" }}
              label={
                <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                  {translate("Tổng số tiền (VND)")}
                </span>
              }
              name={"metadata.totalMoney"}
            >
              <InputNumber
                onChange={(va) =>
                  formProps.form?.setFieldValue("metadata.totalMoney", va)
                }
                style={{ width: "200px" }}
                type="number"
              />
            <span>
                {" " }VD: {formProps.form?.getFieldValue("metadata.totalMoney")}
            </span>
            </Form.Item>

            <Form.Item
              style={{ width: "100%" }}
              label={
                <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                  {translate("Tổng số phòng (học, công vụ, wc)")}
                </span>
              }
              name={"metadata.totalRooms"}
            >
              <InputNumber style={{ width: "200px" }} type="number" />
            </Form.Item>
          </div>
        )}

        {/* Donor */}
        {isProject && (
          <Form.Item
            label={
              <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                {translate("post.fields.donor.name")}
              </span>
            }
          >
            <div
              style={{
                marginLeft: "24px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Form.Item
                label={
                  <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                    {translate("post.fields.donor.description")}
                  </span>
                }
                name={"donor.description"}
              >
                <RichTextEditor
                  initialContent={projectData.donor?.description}
                  onChange={() => {}}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                    {translate("post.fields.donor.images")}
                  </span>
                }
                name={"donor.images"}
              >
                <ImageUploader
                  initialImages={projectData.donor?.images}
                  handleChange={(urls) =>
                    formProps.form?.setFieldValue("donor.images", urls)
                  }
                />
              </Form.Item>
            </div>
          </Form.Item>
        )}

        {/* Progress */}
        {isProject && (
          <Form.Item
            label={
              <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                {translate("post.fields.progress.name")}
              </span>
            }
          >
            <div
              style={{
                marginLeft: "24px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Form.Item
                label={
                  <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                    {translate("post.fields.progress.images1")}
                  </span>
                }
                name={"progress.images1"}
              >
                <ImageUploader
                  initialImages={
                    projectData.progress?.find(
                      (p) =>
                        p.name === translate("post.fields.progress.images1")
                    )?.images
                  }
                  handleChange={(urls) =>
                    formProps.form?.setFieldValue("progress.images1", urls)
                  }
                />
              </Form.Item>
              <Form.Item
                label={
                  <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                    {translate("post.fields.progress.images2")}
                  </span>
                }
                name={"progress.images2"}
              >
                <ImageUploader
                  initialImages={
                    projectData.progress?.find(
                      (p) =>
                        p.name === translate("post.fields.progress.images2")
                    )?.images
                  }
                  handleChange={(urls) =>
                    formProps.form?.setFieldValue("progress.images2", urls)
                  }
                />
              </Form.Item>
              <Form.Item
                label={
                  <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                    {translate("post.fields.progress.images3")}
                  </span>
                }
                name={"progress.images3"}
              >
                <ImageUploader
                  initialImages={
                    projectData.progress?.find(
                      (p) =>
                        p.name === translate("post.fields.progress.images3")
                    )?.images
                  }
                  handleChange={(urls) =>
                    formProps.form?.setFieldValue("progress.images3", urls)
                  }
                />
              </Form.Item>
            </div>
          </Form.Item>
        )}

        {/* Tabs content */}
        <Form.Item
          label={
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>
              {translate("post.fields.content.name")}
            </span>
          }
        >
          <div style={{ marginLeft: "24px" }}>
            <Form.Item
              label={
                <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                  {isProject ? translate("post.fields.content.section1") : ""}
                </span>
              }
            >
              <div
                style={{
                  marginLeft: "24px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Form.Item
                  label={
                    <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                      {translate("post.fields.content.description")}
                    </span>
                  }
                  name={"content.description1"}
                >
                  <RichTextEditor
                    initialContent={
                      projectData.content.tabs.find(
                        (t) =>
                          t.name ===
                            translate("post.fields.content.section1") ||
                          t.name === "Main content"
                      )?.description
                    }
                    onChange={() => {}}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                      {translate("post.fields.content.images")}
                    </span>
                  }
                  name={"content.images1"}
                >
                  <ImageUploader
                    initialImages={
                      projectData.content.tabs.find(
                        (p) =>
                          p.name === translate("post.fields.content.section1")
                      )?.slide_show
                    }
                    handleChange={(urls) =>
                      formProps.form?.setFieldValue("content.images1", urls)
                    }
                  />
                </Form.Item>
              </div>
            </Form.Item>

            {isProject && (
              <Form.Item
                label={
                  <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                    {translate("post.fields.content.section2")}
                  </span>
                }
              >
                <div
                  style={{
                    marginLeft: "24px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Form.Item
                    label={
                      <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                        {translate("post.fields.content.description")}
                      </span>
                    }
                    name={"content.description2"}
                  >
                    <RichTextEditor
                      initialContent={
                        projectData.content.tabs.find(
                          (t) =>
                            t.name === translate("post.fields.content.section2")
                        )?.description
                      }
                      onChange={() => {}}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                        {translate("post.fields.content.images")}
                      </span>
                    }
                    name={"content.images2"}
                  >
                    <ImageUploader
                      initialImages={
                        projectData.content.tabs.find(
                          (p) =>
                            p.name === translate("post.fields.content.section2")
                        )?.slide_show
                      }
                      handleChange={(urls) =>
                        formProps.form?.setFieldValue("content.images2", urls)
                      }
                    />
                  </Form.Item>
                </div>
              </Form.Item>
            )}

            {isProject && (
              <Form.Item
                label={
                  <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                    {translate("post.fields.content.section3")}
                  </span>
                }
              >
                <div
                  style={{
                    marginLeft: "24px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Form.Item
                    label={
                      <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                        {translate("post.fields.content.description")}
                      </span>
                    }
                    name={"content.description3"}
                  >
                    <RichTextEditor
                      initialContent={
                        projectData.content.tabs.find(
                          (t) =>
                            t.name === translate("post.fields.content.section3")
                        )?.description
                      }
                      onChange={() => {}}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                        {translate("post.fields.content.images")}
                      </span>
                    }
                    name={"content.images3"}
                  >
                    <ImageUploader
                      initialImages={
                        projectData.content.tabs.find(
                          (p) =>
                            p.name === translate("post.fields.content.section3")
                        )?.slide_show
                      }
                      handleChange={(urls) =>
                        formProps.form?.setFieldValue("content.images3", urls)
                      }
                    />
                  </Form.Item>
                </div>
              </Form.Item>
            )}
          </div>
        </Form.Item>
      </Form>
    </Edit>
  );
};
