import React from "react";
import {
  IResourceComponentsProps,
  BaseRecord,
  useTranslate,
} from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
} from "@refinedev/antd";
import { Table, Space } from "antd";

export const ProjectList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { tableProps } = useTable<Sucmanh2000.Project>({
    syncWithLocation: true,
    pagination: {
      mode: "server",
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          title={translate("table.actions")}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
        <Table.Column
          title={translate("table.id")}
          dataIndex="id"
          render={(_, record: BaseRecord) => <Space>{record.id}</Space>}
        />

        <Table.Column
          title={translate("table.category")}
          dataIndex="category"
          render={(_, record: BaseRecord) => <Space>{record.category}</Space>}
        />

        <Table.Column
          title={translate("table.style")}
          dataIndex="style"
          render={(_, record: BaseRecord) => <Space>{record.style}</Space>}
        />

        <Table.Column
          title={translate("table.name")}
          dataIndex="name"
          render={(_, record: BaseRecord) => <Space>{record.name}</Space>}
        />
      </Table>
    </List>
  );
};
