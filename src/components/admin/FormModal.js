// src/components/admin/FormModal.js
import { Modal, Form, Input, Select } from "antd";

const { Option } = Select;

export default function FormModal({
  visible,
  onOk,
  onCancel,
  form,
  title,
  fields,
  initialValues,
}) {
  return (
    <Modal title={title} open={visible} onOk={onOk} onCancel={onCancel}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        {fields.map((field) => (
          <Form.Item
            key={Array.isArray(field.name) ? field.name.join(".") : field.name}
            name={field.name}
            label={field.label}
            rules={field.rules}
          >
            {field.render ? (
              field.render()
            ) : field.type === "textarea" ? (
              <Input.TextArea rows={4} placeholder={field.placeholder} />
            ) : (
              <Input placeholder={field.placeholder} />
            )}
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
}
