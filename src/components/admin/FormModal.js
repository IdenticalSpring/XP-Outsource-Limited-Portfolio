import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Checkbox,
  Button,
  Radio,
  Switch,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

// Ánh xạ loại input với component tương ứng
const inputTypeMap = {
  input: Input,
  textarea: TextArea,
  select: Select,
  date: DatePicker,
  upload: Upload,
  checkbox: Checkbox,
  radio: Radio.Group,
  switch: Switch, // Thêm ánh xạ cho switch
};

export default function FormModal({
  visible,
  onOk,
  onCancel,
  form,
  title,
  fields,
  initialValues,
  layout = "vertical", // Mặc định là vertical
  modalProps = {}, // Thuộc tính tùy chỉnh cho Modal
  formProps = {}, // Thuộc tính tùy chỉnh cho Form
}) {
  // Hàm render input dựa trên field.type hoặc field.render
  const renderInput = (field) => {
    // Nếu có render tùy chỉnh, sử dụng nó
    if (field.render) {
      return field.render();
    }

    // Lấy component từ inputTypeMap
    const InputComponent = inputTypeMap[field.type || "input"];
    if (!InputComponent) {
      console.warn(`Unsupported field type: ${field.type}`);
      return <Input {...(field.props || {})} />;
    }

    // Xử lý các trường hợp đặc biệt
    if (field.type === "select") {
      return (
        <InputComponent {...(field.props || {})}>
          {(field.options || []).map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </InputComponent>
      );
    }

    if (field.type === "radio") {
      return (
        <InputComponent {...(field.props || {})}>
          {(field.options || []).map((option) => (
            <Radio key={option.value} value={option.value}>
              {option.label}
            </Radio>
          ))}
        </InputComponent>
      );
    }

    if (field.type === "upload") {
      return (
        <InputComponent
          {...(field.props || {})}
          customRequest={({ onSuccess }) => onSuccess("ok")} // Giả lập upload
          showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
        >
          <Button icon={<UploadOutlined />}>Upload</Button>
        </InputComponent>
      );
    }

    // Các loại input khác (input, textarea, date, checkbox, switch)
    return <InputComponent {...(field.props || {})} />;
  };

  return (
    <Modal
      title={title}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      {...modalProps}
    >
      <Form
        form={form}
        layout={layout}
        initialValues={initialValues}
        {...formProps}
      >
        {fields.map((field) => (
          <Form.Item
            key={Array.isArray(field.name) ? field.name.join(".") : field.name}
            name={field.name}
            label={field.label}
            rules={field.rules}
            valuePropName={
              field.type === "checkbox" || field.type === "switch"
                ? "checked"
                : undefined
            }
            initialValue={field.initialValue}
          >
            {renderInput(field)}
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
}
