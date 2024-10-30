import React, { useEffect, useState, useRef } from "react";
import { IResourceComponentsProps, BaseRecord, useTranslate, HttpError } from "@refinedev/core";
import { useTable, List, EditButton, DeleteButton, SaveButton, useEditableTable } from "@refinedev/antd";
import { Table, Space, Input, Form, Modal, Checkbox, Steps } from "antd";
import { useLocation } from "react-router-dom";
import { CLIENT_URL, POSTS_PER_PAGE, SERVER_URL, categoryMapping, classificationMapping, statusMapping } from "../../utils/constants";
import { SearchOutlined, SketchOutlined, BulbOutlined, RadarChartOutlined, ProfileOutlined, AlertOutlined } from "@ant-design/icons";
import { capitalizeEachWord } from "../../utils/helpers";
import axios from "axios";
import RichTextEditor from "../../components/RichTextEditor";
import { ProjectPost } from "../../../../index";

interface ISearch {
  name: string;
}

function CustomFieldsCheckbox(props: { onChange: any }) {
  const [checkedValues, setCheckedValues] = useState<string[]>([]);

  useEffect(() => {
    props.onChange(checkedValues);
  }, [checkedValues]);

  return (
    <Checkbox.Group value={checkedValues} onChange={(checkedList: any) => setCheckedValues(checkedList)} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <Checkbox value="1">Dự án mới</Checkbox>
      </div>
      <div>
        <Checkbox value="2">Dự án thay đổi trạng thái</Checkbox>
      </div>
      <div>
        <Checkbox value="3">Dự án cập nhật thêm ảnh</Checkbox>
      </div>
      <div>
        <Checkbox value="4">Dự án cập nhật ảnh đại diện</Checkbox>
      </div>
      <div>
        <Checkbox value="5">Dự án cập nhật phiếu khảo sát</Checkbox>
      </div>
      <div>
        <Checkbox value="6">Dự án hủy → xóa trên web</Checkbox>
      </div>
    </Checkbox.Group>
  );
}

function standardizePostTitle(str: string) {
  return str
    .split(" ")
    .map((word, index, arr) => {
      if (word.includes("DA")) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ")
    .replace(/,/g, " -");
}

export const ProjectList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { pathname } = useLocation();
  const collectionName = pathname.split("/")[1];
  const isProject = collectionName.includes("du-an");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const checkedValuesRef = useRef<string[]>([]);

  const handleCheckedValuesChange = (updatedValues: string[]) => {
    checkedValuesRef.current = updatedValues;
  };

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
      title: service,
      content: (
        <div>
          <strong>Lưu ý:</strong>
          <br />
          - Check kĩ data trên Airtable trước khi chạy
          <br />- Chỉ chạy báo cáo định kì vào mỗi chủ nhật hằng tuần, nếu không báo cáo sẽ bị thiếu/sai so với lần báo cáo trước
        </div>
      ),
      onOk: async () => {
        setConfirmLoading(true);

        try {
          switch (service) {
            case "Tạo báo cáo lỗi Airtable":
              console.time("findAirtableErrors");
              const resAirErrors = await axios.post(SERVER_URL + "/script/findAirtableErrors");
              console.timeEnd("findAirtableErrors");

              if (resAirErrors.status === 200) {
                Modal.success({
                  width: 900,
                  title: resAirErrors.data.name,
                  content: (
                    <div>
                      {Object.entries(resAirErrors.data.errors as Record<string, { projectInitName: string; projectId: string; web?: string; air?: string }[]>).map(
                        ([key, value]) =>
                          value.length > 0 && (
                            <div key={key}>
                              <p>
                                <strong>{key}</strong>
                              </p>
                              <ul>
                                {value.map((v) => (
                                  <div key={v.projectId}>
                                    <li>{standardizePostTitle(`${v.projectId} - ${v.projectInitName}`)}</li>
                                    {v.web && v.air && (
                                      <ul>
                                        <li>Web: {v.web}</li>
                                        <li>Air: {v.air}</li>
                                      </ul>
                                    )}
                                  </div>
                                ))}
                              </ul>
                            </div>
                          )
                      )}
                    </div>
                  ),
                });
              }
              break;

            case "Tạo báo cáo tiến độ Zalo":
              console.time("tienDoZalo");
              const resZalo = await axios.post(SERVER_URL + "/script/createProjectProgressReportZalo");
              console.timeEnd("tienDoZalo");

              if (resZalo.status === 200) {
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
              Modal.success({
                title: "Chọn các fields cần đồng bộ",
                content: (
                  <div>
                    <CustomFieldsCheckbox onChange={handleCheckedValuesChange} />
                  </div>
                ),
                onOk: async () => {
                  if (checkedValuesRef.current.length === 0) {
                    window.alert("Phải chọn ít nhất 1 field để update");
                    return;
                  }

                  console.time("syncAirAndWeb");
                  const resSync = await axios.post(SERVER_URL + "/script/syncAirtableAndWeb", { checkedValues: checkedValuesRef.current });
                  console.timeEnd("syncAirAndWeb");

                  if (resSync.status === 200) {
                    Modal.success({
                      title: "Done!!!",
                      onOk: () => window.location.reload(),
                    });
                  }
                },
                onCancel: () => {},
              });
              break;

            default:
              throw new Error("Wrong service!!!");
          }
        } catch (error: any) {
          console.error(error);
          Modal.error({ content: `Lỗi: ${error.mesage}` });
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

      {collectionName === "thong-bao" && (
        <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
          {/* @ts-ignore */}
          {import.meta.env.VITE_CURRENT_ENV === "Development" && (
            <SaveButton
              icon={<AlertOutlined />}
              loading={confirmLoading}
              disabled={confirmLoading}
              onClick={() => handleButtonClick("Tạo báo cáo lỗi Airtable")}
              style={{ backgroundColor: "#6666FF", borderColor: "#6666FF", color: "white" }}
            >
              Tạo báo cáo lỗi Airtable
            </SaveButton>
          )}

          <SaveButton
            icon={<SketchOutlined />}
            loading={confirmLoading}
            disabled={confirmLoading}
            onClick={() => handleButtonClick("Tạo báo cáo tiến độ Zalo")}
            style={{ backgroundColor: "#FFBF00", borderColor: "#FFBF00", color: "white" }}
          >
            Tạo báo cáo tiến độ Zalo
          </SaveButton>
          <SaveButton
            icon={<BulbOutlined />}
            loading={confirmLoading}
            disabled={confirmLoading}
            onClick={() => handleButtonClick("Tạo báo cáo tiến độ Web")}
            style={{ backgroundColor: "#B4C424", borderColor: "#B4C424", color: "white" }}
          >
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
            onClick={() => handleButtonClick("Tạo báo cáo up web Zalo")}
            style={{ backgroundColor: "#00CCCC", borderColor: "#00CCCC", color: "white" }}
          >
            Tạo báo cáo up web Zalo
          </SaveButton>
          <SaveButton
            icon={<ProfileOutlined />}
            loading={confirmLoading}
            disabled={confirmLoading}
            onClick={() => handleButtonClick("Đồng bộ Airtable và Web")}
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
