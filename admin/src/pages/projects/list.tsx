import React from "react";
import { IResourceComponentsProps, BaseRecord, useTranslate } from "@refinedev/core";
import { useTable, List, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Space } from "antd";
import { categoryMapping } from "../../constants";

export const ProjectList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();

  const { tableProps } = useTable<Sucmanh2000.Post>({
    syncWithLocation: true,
    pagination: {
      mode: "server",
      pageSize: 12,
      current: 1,
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column title={translate("table.category")} dataIndex="category" render={(_, record: BaseRecord) => <Space>{categoryMapping && categoryMapping[record.category as keyof typeof categoryMapping]}</Space>} />

        <Table.Column title={translate("post.fields.name")} dataIndex="name" render={(_, record: BaseRecord) => <Space>{record.name}</Space>} />

        <Table.Column
          title={translate("post.fields.publish_date")}
          dataIndex="publish_date"
          render={(_, record: BaseRecord) => <Space>{new Date(record.publish_date).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })}</Space>}
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
