// src/components/admin/DataTable.js
import { Table, Button } from "antd";

export default function DataTable({
  dataSource,
  columns,
  rowKey,
  onEdit,
  onDelete,
  pagination = { pageSize: 5 },
  loading,
}) {
  const actionColumn = {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <>
        <Button type="link" onClick={() => onEdit(record)}>
          Edit
        </Button>
        <Button type="link" danger onClick={() => onDelete(record[rowKey])}>
          Delete
        </Button>
      </>
    ),
  };

  return (
    <Table
      columns={[...columns]}
      dataSource={dataSource}
      rowKey={rowKey}
      pagination={pagination}
      loading={loading}
    />
  );
}
