"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button, message, Form, Modal, Upload, Input } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import styles from "./BannerManagement.module.css";
import DataTable from "./Datatable";
import FormModal from "./FormModal";
import {
  uploadImage,
  fetchImages,
  deleteImage,
  logoutAdmin,
} from "@/src/lib/api";

export default function ImageManagement() {
  const locale = useLocale();
  const t = useTranslations("ImageManagement");
  const router = useRouter();
  const [imageForm] = Form.useForm();
  const [images, setImages] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Hàm xử lý lỗi Unauthorized
  const handleUnauthorized = () => {
    logoutAdmin();
    message.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    router.push(`/${locale}/admin/login`);
  };

  // Hàm tải danh sách hình ảnh
  const loadImages = useCallback(
    async (page = 1, limit = 10, filename = "") => {
      setLoading(true);
      try {
        const response = await fetchImages(locale, page, limit, filename);
        console.log("Loaded images:", response);
        setImages(response.data);
        setPagination({ page, limit, total: response.total });
      } catch (error) {
        console.error("Error fetching images:", error);
        const errorMessage = error.message;
        try {
          const errorData = JSON.parse(errorMessage);
          if (errorData.statusCode === 401) {
            handleUnauthorized();
            return;
          }
        } catch (parseError) {
          console.error("Error parsing error message:", parseError);
        }
        message.error(`Không thể tải danh sách hình ảnh: ${error.message}`);
      } finally {
        setLoading(false);
      }
    },
    [locale, router]
  );

  // Tải danh sách hình ảnh khi component mount hoặc locale thay đổi
  useEffect(() => {
    loadImages(pagination.page, pagination.limit);
  }, [loadImages, pagination.page, pagination.limit]);

  // Cấu hình cột cho bảng Images
  const imageColumns = [
    { title: "Filename", dataIndex: "filename", key: "filename" },
    {
      title: "Preview",
      dataIndex: "url",
      key: "url",
      render: (url) =>
        url ? (
          <img
            src={url}
            alt="Image"
            style={{ width: 50, height: "auto" }}
            onError={(e) => {
              e.target.src = "/fallback-image.jpg";
            }}
          />
        ) : (
          "No image"
        ),
    },
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      render: (url) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          danger
          onClick={() => handleDeleteImage(record.filename)}
        >
          Delete
        </Button>
      ),
    },
  ];

  // Cấu hình trường cho form Upload
  const uploadFields = [
    {
      name: "file",
      label: "Image File",
      type: "upload",
      rules: [{ required: true, message: "Vui lòng chọn file hình ảnh" }],
      customRender: ({ field }) => (
        <Upload
          {...field}
          accept="image/jpeg,image/png,image/gif"
          beforeUpload={() => false} // Ngăn upload tự động
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Chọn file</Button>
        </Upload>
      ),
    },
  ];

  // Xử lý upload hình ảnh
  const handleUploadImage = () => {
    imageForm.resetFields();
    setIsModalVisible(true);
  };

  // Xử lý xóa hình ảnh với xác nhận
  const handleDeleteImage = (filename) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa hình ảnh này?",
      onOk: async () => {
        try {
          await deleteImage(locale, filename);
          setImages(images.filter((image) => image.filename !== filename));
          message.success("Xóa hình ảnh thành công");
        } catch (error) {
          console.error("Error deleting image:", error);
          const errorMessage = error.message;
          try {
            const errorData = JSON.parse(errorMessage);
            if (errorData.statusCode === 401) {
              handleUnauthorized();
              return;
            }
          } catch (parseError) {
            console.error("Error parsing error message:", parseError);
          }
          message.error(`Không thể xóa hình ảnh: ${error.message}`);
        }
      },
    });
  };

  // Xử lý lưu hình ảnh
  const handleModalOk = async () => {
    try {
      const values = await imageForm.validateFields();
      setLoading(true);

      const file = values.file?.fileList?.[0]?.originFileObj;
      if (!file) {
        throw new Error("No file selected");
      }

      // Kiểm tra kích thước file (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size exceeds 5MB limit");
      }

      // Kiểm tra loại file
      if (!file.type.match(/image\/(jpg|jpeg|png|gif)/)) {
        throw new Error("Only JPG, JPEG, PNG, or GIF files are allowed");
      }

      const uploadedImage = await uploadImage(locale, file);
      setImages([...images, uploadedImage]);
      message.success("Tải lên hình ảnh thành công");
      setIsModalVisible(false);
      imageForm.resetFields();
      await loadImages(pagination.page, pagination.limit);
    } catch (error) {
      console.error("Error uploading image:", error);
      const errorMessage = error.message;
      try {
        const errorData = JSON.parse(errorMessage);
        if (errorData.statusCode === 401) {
          handleUnauthorized();
          return;
        }
      } catch (parseError) {
        console.error("Error parsing error message:", parseError);
      }
      message.error(`Tải lên hình ảnh thất bại: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi pagination
  const handleTableChange = (pagination) => {
    setPagination({ ...pagination, page: pagination.current });
    loadImages(pagination.current, pagination.pageSize);
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableHeader}>
        <h2>Images</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleUploadImage}
        >
          Upload Image
        </Button>
      </div>
      <DataTable
        dataSource={images}
        columns={imageColumns}
        rowKey="filename"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
        }}
        onChange={handleTableChange}
      />
      <FormModal
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          imageForm.resetFields();
        }}
        form={imageForm}
        title="Upload Image"
        fields={uploadFields}
      />
    </div>
  );
}
