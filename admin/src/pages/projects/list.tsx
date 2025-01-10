import React, { useState, useEffect } from "react";
import { IResourceComponentsProps, BaseRecord, useTranslate, HttpError } from "@refinedev/core";
import { useTable, List, EditButton, DeleteButton, SaveButton } from "@refinedev/antd";
import { Table, Space, Input, Form, Modal, Alert } from "antd";
import { useLocation } from "react-router-dom";
import { CLIENT_URL, POSTS_PER_PAGE, SERVER_URL, categoryMapping, classificationMapping, statusMapping } from "../../utils/constants";
import { SearchOutlined, SketchOutlined, BulbOutlined, RadarChartOutlined, ProfileOutlined, AlertOutlined } from "@ant-design/icons";
import { capitalizeEachWord } from "../../utils/helpers";
import axios from "axios";
import RichTextEditor from "../../components/RichTextEditor";
import { ProjectPost } from "../../../../index";
import { provincesAndCitiesObj } from "../../utils/vietnam-provinces";
import CSVReader from "react-csv-reader";
import { listAll, getMetadata, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../../firebase/client";
import Papa from "papaparse";

interface ISearch {
  name: string;
}

export const ProjectList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const location = useLocation();
  const { pathname } = useLocation();
  const collectionName = pathname.split("/")[1];
  const isProject = collectionName.includes("du-an");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [recentUpload, setRecentUpload] = useState<boolean>(false);

  useEffect(() => {
    const checkRecentUploads = async () => {
      try {
        const storageRef = ref(storage, "projects_csv/");
        const listResult = await listAll(storageRef);

        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        for (const itemRef of listResult.items) {
          const metadata = await getMetadata(itemRef);
          const lastModified = new Date(metadata.updated);

          if (lastModified > threeDaysAgo) {
            setRecentUpload(true);
            break;
          }
        }
      } catch (error) {
        console.error("Error checking recent uploads:", error);
      }
    };

    checkRecentUploads();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const googleOauthSuccess = queryParams.get("googleOauthSuccess");
    if (googleOauthSuccess === "true") {
      const baseUrl = window.location.origin + window.location.pathname;
      window.location.href = baseUrl;
    }
  }, []);

  const { tableProps, searchFormProps } = useTable<ProjectPost, HttpError, ISearch>({
    syncWithLocation: true,
    pagination: {
      mode: "server",
      pageSize: POSTS_PER_PAGE,
      current: 1,
    },
    errorNotification: (data, values, resource) => {
      return {
        description: `Đã xảy ra lỗi`,
        message: data?.message ?? "Có lỗi xảy ra khi tải dữ liệu",
        type: "error",
      };
    },
    onSearch: (data) => {
      if (!data.name) {
        const baseUrl = window.location.origin + window.location.pathname;
        window.history.pushState({}, "", baseUrl);
      }
      return [
        {
          field: "name",
          operator: "contains",
          value: data.name,
        },
      ];
    },
  });

  const handleButtonClick = (service: any) => {
    Modal.confirm({
      title: service,
      content: (
        <div>
          <strong>Lưu ý:</strong>
          <br />
          - Check kĩ data trên Lark trước khi chạy
          <br />- Chỉ chạy báo cáo định kì vào mỗi chủ nhật hằng tuần, nếu không báo cáo sẽ bị thiếu/sai so với lần báo cáo trước
        </div>
      ),
      onOk: async () => {
        setConfirmLoading(true);

        try {
          switch (service) {
            case "Tạo báo cáo tiến độ Zalo":
              console.time("tienDoZalo");
              const resZalo = await axios.post(SERVER_URL + "/script/createProjectProgressReportZalo");
              console.timeEnd("tienDoZalo");

              if (resZalo.status === 200) {
                if (resZalo.data.authUrl) {
                  window.location.href = resZalo.data.authUrl;
                }

                Modal.success({
                  width: 900,
                  title: resZalo.data.name,
                  content: (
                    <div>
                      <RichTextEditor initialContent={resZalo.data.content} onChange={() => {}} />
                    </div>
                  ),
                });
              }
              break;

            case "Tạo báo cáo tiến độ Web":
              console.time("tienDoweb");
              const resWeb = await axios.post(SERVER_URL + "/script/createProjectProgressReportWeb");
              console.timeEnd("tienDoweb");

              if (resWeb.status === 200) {
                if (resWeb.data.authUrl) {
                  window.location.href = resWeb.data.authUrl;
                }

                Modal.success({
                  title: "Done!!!",
                  onOk: () => window.location.reload(),
                });
              }
              break;

            case "Tạo báo cáo up web Zalo":
              console.time("webReport");
              const resWebReport = await axios.post(SERVER_URL + "/script/createWebUpdateReport");
              console.timeEnd("webReport");

              if (resWebReport.status === 200) {
                if (resWebReport.data.authUrl) {
                  window.location.href = resWebReport.data.authUrl;
                }

                Modal.success({
                  width: 900,
                  title: resWebReport.data.name,
                  content: (
                    <div>
                      <RichTextEditor initialContent={resWebReport.data.content} onChange={() => {}} />
                    </div>
                  ),
                });
              }
              break;

            case "Đồng bộ Airtable và Web":
              console.time("syncAirAndWeb");
              const resSync = await axios.post(SERVER_URL + "/script/syncAirtableAndWeb");
              console.timeEnd("syncAirAndWeb");

              if (resSync.status === 200) {
                if (resSync.data.authUrl) {
                  window.location.href = resSync.data.authUrl;
                }

                Modal.success({
                  title: "Done!!!",
                  onOk: () => window.location.reload(),
                });
              }
              break;

            default:
              throw new Error("Wrong service!!!");
          }
        } catch (error: any) {
          console.error(error);
          Modal.error({ content: `Lỗi: ${error}` });
        } finally {
          setConfirmLoading(false);
        }
      },
      onCancel: () => {},
    });
  };

  return (
    <List>
      <Form {...searchFormProps} layout="inline" style={{ marginBottom: "24px" }}>
        <Form.Item name="name">
          <Input placeholder="Search by name" />
        </Form.Item>
        <SaveButton icon={<SearchOutlined />} onClick={searchFormProps.form?.submit}>
          Search
        </SaveButton>
      </Form>

      {["thong-bao", "du-an-2025"].includes(collectionName) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "16px" }}>
          {recentUpload ? (
            <Alert
              message={
                <div>
                  <p>A CSV file has been uploaded within the last 3 days. Go ahead and create the reports!</p>
                  <a
                    onClick={async () => {
                      try {
                        const storageRef = ref(storage, "projects_csv/");
                        const listResult = await listAll(storageRef);

                        const threeDaysAgo = new Date();
                        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

                        for (const itemRef of listResult.items) {
                          const metadata = await getMetadata(itemRef);
                          const lastModified = new Date(metadata.updated);

                          if (lastModified > threeDaysAgo) {
                            await deleteObject(itemRef);
                            setRecentUpload(false);
                            break;
                          }
                        }
                      } catch (error) {
                        console.error("Error deleting recent file:", error);
                      }
                    }}
                  >
                    Delete and Upload new file
                  </a>
                </div>
              }
              type="success"
            />
          ) : (
            <>
              <Alert message="No CSV files uploaded in the last 3 days. Upload new file again" type="warning" />{" "}
              <CSVReader
                onFileLoaded={async (data, fileInfo) => {
                  console.log("File loaded:", fileInfo);
                  console.log("Data:", data);

                  try {
                    // Use Papa.unparse to convert JSON data back to CSV format
                    const csvContent = Papa.unparse(data);

                    const file = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
                    const storageRef = ref(storage, `projects_csv/${fileInfo.name}`);
                    const uploadTask = uploadBytesResumable(storageRef, file);

                    uploadTask.on(
                      "state_changed",
                      (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log("Upload is " + progress + "% done");
                      },
                      (error) => {
                        console.error("Error uploading file:", error);
                      },
                      () => {
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                          console.log("File available at", downloadURL);
                        });
                      }
                    );
                    setRecentUpload(true);
                  } catch (error) {
                    console.error("Error uploading file:", error);
                  }
                }}
              />
            </>
          )}
        </div>
      )}

      {collectionName === "thong-bao" && (
        <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
          <SaveButton
            icon={<SketchOutlined />}
            loading={confirmLoading}
            disabled={confirmLoading || !recentUpload}
            onClick={() => handleButtonClick("Tạo báo cáo tiến độ Zalo")}
            style={{ backgroundColor: "#FFBF00", borderColor: "#FFBF00", color: "white" }}
          >
            Tạo báo cáo tiến độ Zalo
          </SaveButton>
          <SaveButton
            icon={<BulbOutlined />}
            loading={confirmLoading}
            disabled={confirmLoading || !recentUpload}
            onClick={() => handleButtonClick("Tạo báo cáo tiến độ Web")}
            style={{ backgroundColor: "#B4C424", borderColor: "#B4C424", color: "white" }}
          >
            Tạo báo cáo tiến độ Web
          </SaveButton>
        </div>
      )}

      {collectionName === "du-an-2025" && (
        <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
          <SaveButton
            icon={<RadarChartOutlined />}
            loading={confirmLoading}
            disabled={confirmLoading || !recentUpload}
            onClick={() => handleButtonClick("Tạo báo cáo up web Zalo")}
            style={{ backgroundColor: "#00CCCC", borderColor: "#00CCCC", color: "white" }}
          >
            Tạo báo cáo up web Zalo
          </SaveButton>
          <SaveButton
            icon={<ProfileOutlined />}
            loading={confirmLoading}
            disabled={confirmLoading || !recentUpload}
            onClick={() => handleButtonClick("Đồng bộ Airtable và Web")}
            style={{ backgroundColor: "#CC0066", borderColor: "#CC0066", color: "white" }}
          >
            Đồng bộ Web
          </SaveButton>
        </div>
      )}

      <Table {...tableProps} rowKey="id">
        <Table.Column title={translate("table.category")} dataIndex="category" render={(_, record: BaseRecord) => <Space>{categoryMapping && categoryMapping[record.category as keyof typeof categoryMapping]}</Space>} />

        <Table.Column title={translate("table.name")} dataIndex="name" render={(_, record: BaseRecord) => <Space>{capitalizeEachWord(record.name)}</Space>} />

        {isProject && (
          <Table.Column
            title={translate("post.fields.classification")}
            dataIndex="classification"
            render={(_, record: BaseRecord) => <Space>{classificationMapping[record.classification as keyof typeof classificationMapping] ?? "N/A"}</Space>}
          />
        )}
        {isProject && <Table.Column title={translate("post.fields.status")} dataIndex="status" render={(_, record: BaseRecord) => <Space>{statusMapping[record.status as keyof typeof statusMapping] ?? "N/A"}</Space>} />}

        {isProject && (
          <Table.Column
            title={translate("post.fields.province")}
            dataIndex="province"
            render={(_, record: BaseRecord) => <Space>{provincesAndCitiesObj[record?.province] ? provincesAndCitiesObj[record?.province] : <span style={{ color: "red" }}>N/A</span>}</Space>}
          />
        )}

        <Table.Column
          title={translate("post.fields.url")}
          dataIndex="url"
          render={(_, record: BaseRecord) => (
            <Space>
              <a href={`${CLIENT_URL}/${record.category}/${record.slug}`} target="_blank" rel="noopener noreferrer">
                Link
              </a>
            </Space>
          )}
        />
        <Table.Column title={translate("post.fields.createdAt")} dataIndex="createdAt" render={(_, record: BaseRecord) => <Space>{new Date(record.createdAt).toLocaleDateString("vi-VN")}</Space>} />

        <Table.Column
          title={translate("table.actions")}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.slug} />
              <DeleteButton hideText size="small" recordItemId={record.slug} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
