// src/components/admin/DataTable.js
import { Table, Button } from "antd";

export default function DataTable({
  dataSource = [],
  columns,
  rowKey,
  onEdit,
  onDelete,
  pagination = true,
  loading,
}) {
  // Cột actions mặc định
  const actionColumn = {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <>
        {onEdit && (
          <Button type="link" onClick={() => onEdit(record)}>
            Edit
          </Button>
        )}
        {onDelete && (
          <Button type="link" danger onClick={() => onDelete(record[rowKey])}>
            Delete
          </Button>
        )}
      </>
    ),
  };

  // Chỉ thêm cột actions nếu không có cột actions trong columns và (onEdit hoặc onDelete được cung cấp)
  const hasActionColumn = columns.some((col) => col.key === "actions");
  const finalColumns =
    hasActionColumn || (!onEdit && !onDelete)
      ? columns
      : [...columns, actionColumn];

  // Cấu hình phân trang mặc định
  const defaultPagination = {
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50"],
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
  };

  // Kết hợp cấu hình phân trang
  const finalPagination =
    pagination === false
      ? false
      : {
          ...defaultPagination,
          ...(typeof pagination === "object" ? pagination : {}),
          ...(dataSource.length === 0 ? { total: 0 } : {}),
        };

  return (
    <Table
      columns={finalColumns}
      dataSource={dataSource}
      rowKey={rowKey}
      pagination={finalPagination}
      loading={loading}
    />
  );
}
