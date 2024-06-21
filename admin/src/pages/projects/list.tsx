import React, { useEffect } from "react";
import { IResourceComponentsProps, BaseRecord, useTranslate, CrudFilters, HttpError } from "@refinedev/core";
import { useTable, List, EditButton, ShowButton, DeleteButton, SaveButton } from "@refinedev/antd";
import { Table, Space, Input, Form } from "antd";
import { CLIENT_URL, POSTS_PER_PAGE, categoryMapping, classificationMapping, statusMapping } from "../../constants";
// import { debounce } from "lodash";

export const ProjectList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  interface ISearch {
    name: string;
  }

  const { tableProps, searchFormProps } = useTable<Sucmanh2000.Post, HttpError, ISearch>({
    syncWithLocation: true,
    pagination: {
      mode: "server",
      pageSize: POSTS_PER_PAGE,
      current: 1,
    },
    errorNotification: (data, values, resource) => {
      console.log({ data, values, resource });
      return {
        description: `Đã xảy ra lỗi`,
        message: data?.message ?? "Có lỗi xảy ra khi tải dữ liệu",
        type: "error",
      };
    },
    onSearch: (values) => {
      return [
        {
          field: "name",
          operator: "contains",
          value: values.name,
        },
      ];
    },
  });

  // const debouncedSearch = debounce((value: any) => {
  //   searchFormProps.form?.setFieldsValue({ name: value });
  //   searchFormProps.form?.submit();
  // }, 1000);

  return (
    <List>
      <Form {...searchFormProps} layout="inline">
        <Form.Item name="name">
          {/* onChange={(e) => debouncedSearch(e.target.value)} */}
          <Input placeholder="Search by name" />
        </Form.Item>
        <SaveButton onClick={searchFormProps.form?.submit} />
      </Form>
      <Table {...tableProps} rowKey="id">
        <Table.Column title={translate("table.category")} dataIndex="category" render={(_, record: BaseRecord) => <Space>{categoryMapping && categoryMapping[record.category as keyof typeof categoryMapping]}</Space>} />

        <Table.Column title={translate("table.name")} dataIndex="name" render={(_, record: BaseRecord) => <Space>{record.name}</Space>} />

        <Table.Column
          title={translate("post.fields.classification")}
          dataIndex="classification"
          render={(_, record: BaseRecord) => <Space>{classificationMapping[record.classification as keyof typeof classificationMapping] ?? "N/A"}</Space>}
        />

        <Table.Column title={translate("post.fields.status")} dataIndex="status" render={(_, record: BaseRecord) => <Space>{statusMapping[record.status as keyof typeof statusMapping] ?? "N/A"}</Space>} />

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
        <Table.Column
          title={translate("post.fields.publish_date")}
          dataIndex="publish_date"
          render={(_, record: BaseRecord) => (
            <Space>
              {new Date(record.publish_date).toLocaleDateString("vi-VN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Space>
          )}
        />

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
