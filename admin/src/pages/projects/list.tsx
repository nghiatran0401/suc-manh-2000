import React, { useEffect } from "react";
import { IResourceComponentsProps, BaseRecord, useTranslate, HttpError } from "@refinedev/core";
import { useTable, List, EditButton, DeleteButton, SaveButton } from "@refinedev/antd";
import { Table, Space, Input, Form } from "antd";
import { useLocation } from "react-router-dom";
import { CLIENT_URL, POSTS_PER_PAGE, categoryMapping, classificationMapping, statusMapping } from "../../utils/constants";
import { SearchOutlined } from "@ant-design/icons";
import { capitalizeEachWord } from "../../utils/helpers";

interface ISearch {
  name: string;
}

export const ProjectList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { pathname } = useLocation();
  const collectionName = pathname.split("/")[1];
  const isProject = collectionName.includes("du-an");

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

  console.log("here", tableProps);

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
