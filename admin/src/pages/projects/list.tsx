import React, { useState } from "react";
import { IResourceComponentsProps, BaseRecord, useTranslate, HttpError } from "@refinedev/core";
import { useTable, List, EditButton, DeleteButton, SaveButton } from "@refinedev/antd";
import { Table, Space, Input, Form, Modal } from "antd";
import { useLocation } from "react-router-dom";
import { CLIENT_URL, POSTS_PER_PAGE, SERVER_URL, categoryMapping, classificationMapping, statusMapping } from "../../utils/constants";
import { SearchOutlined, SketchOutlined, BulbOutlined, RadarChartOutlined, ProfileOutlined } from "@ant-design/icons";
import { capitalizeEachWord } from "../../utils/helpers";
import axios from "axios";
import RichTextEditor from "../../components/RichTextEditor";

interface ISearch {
  name: string;
}

export const ProjectList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { pathname } = useLocation();
  const collectionName = pathname.split("/")[1];
  const isProject = collectionName.includes("du-an");
  const [confirmLoading, setConfirmLoading] = useState(false);

  const { tableProps, searchFormProps } = useTable<Sucmanh2000.Post, HttpError, ISearch>({
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
        // window.location.replace(baseUrl);
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
      title: "Nhớ check kĩ data trên Airtable trước khi nhấn nút nhé!",
      content: "Code chạy hơi lâu ta cùng đứng lên tập thể dục xíu nào...",
      onOk: async () => {
        setConfirmLoading(true);

        try {
          if (service === "zalo") {
            const res = await axios.post(SERVER_URL + "/script/createProjectProgressReportZalo");
            if (res.status === 200) {
              Modal.success({
                width: 900,
                title: res.data.name,
                content: (
                  <div>
                    {Object.entries(res.data.errors as Record<any, any>).map(([key, value]) => (
                      <div key={key}>
                        <p>
                          <strong>{key}:</strong> {value.length === 0 && "Không có"}
                        </p>
                        {value.length > 0 && (
                          <ul>
                            {value.map((v: any) => (
                              <li>{v}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                    <br />
                    <RichTextEditor initialContent={res.data.content} onChange={() => {}} />
                  </div>
                ),
              });
            }
          } else if (service === "web") {
            const res = await axios.post(SERVER_URL + "/script/createProjectProgressReportWeb");
            if (res.status === 200) {
              Modal.success({
                title: "Xong ròi bạn ơi!!",
                onOk: () => window.location.reload(),
              });
            }
          } else if (service === "report") {
            const res = await axios.post(SERVER_URL + "/script/createWebUpdateReport");
            if (res.status === 200) {
              Modal.success({
                width: 900,
                title: res.data.name,
                content: (
                  <div>
                    {Object.entries(res.data.errors as Record<any, any>).map(([key, value]) => (
                      <div key={key}>
                        <p>
                          <strong>{key}:</strong> {value.length === 0 && "Không có"}
                        </p>
                        {value.length > 0 && (
                          <ul>
                            {value.map((v: any) => (
                              <li>{v}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                    <br />
                    <RichTextEditor initialContent={res.data.content} onChange={() => {}} />
                  </div>
                ),
              });
            }
          } else if (service === "sync") {
            const res = await axios.post(SERVER_URL + "/script/syncAirtableAndWeb");
            if (res.status === 200) {
              Modal.success({
                title: "Xong ròi bạn ơi!!",
                onOk: () => window.location.reload(),
              });
            }
          }
        } catch (error) {
          console.error(error);
          Modal.error({ content: "Móa nó bị lỗi gì rồi. Nhắn Nghĩa gấpp!!" });
        } finally {
          setConfirmLoading(false);
        }
      },
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

      {collectionName === "thong-bao" && (
        <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
          <SaveButton icon={<SketchOutlined />} loading={confirmLoading} disabled={confirmLoading} onClick={() => handleButtonClick("zalo")} style={{ backgroundColor: "#FFBF00", borderColor: "#FFBF00", color: "white" }}>
            Tạo báo cáo tiến độ Zalo
          </SaveButton>
          <SaveButton icon={<BulbOutlined />} loading={confirmLoading} disabled={confirmLoading} onClick={() => handleButtonClick("web")} style={{ backgroundColor: "#B4C424", borderColor: "#B4C424", color: "white" }}>
            Tạo báo cáo tiến độ Web
          </SaveButton>
        </div>
      )}

      {collectionName === "du-an-2024" && (
        <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
          <SaveButton
            icon={<RadarChartOutlined />}
            loading={confirmLoading}
            disabled={confirmLoading}
            onClick={() => handleButtonClick("report")}
            style={{ backgroundColor: "#00CCCC", borderColor: "#00CCCC", color: "white" }}
          >
            Tạo báo cáo up web
          </SaveButton>
          <SaveButton
            icon={<ProfileOutlined />}
            loading={confirmLoading}
            disabled={confirmLoading}
            onClick={() => handleButtonClick("sync")}
            style={{ backgroundColor: "#CC0066", borderColor: "#CC0066", color: "white" }}
          >
            Đồng bộ Airtable và Web
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
          <Table.Column title={translate("post.fields.province")} dataIndex="province" render={(_, record: BaseRecord) => <Space>{record.province ? record.province : <span style={{ color: "red" }}>N/A</span>}</Space>} />
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
        <Table.Column title={translate("post.fields.publish_date")} dataIndex="publish_date" render={(_, record: BaseRecord) => <Space>{new Date(record.publishDate).toLocaleDateString("vi-VN")}</Space>} />

        <Table.Column
          title={translate("table.actions")}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.slug} />
              {/* <ShowButton hideText size="small" recordItemId={record.slug} /> */}
              <DeleteButton hideText size="small" recordItemId={record.slug} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
