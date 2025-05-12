"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import { Button, message, Form, Modal, Select, Input } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import styles from "./BannerManagement.module.css";
import DataTable from "./Datatable";
import FormModal from "./FormModal";
import {
  createBanner,
  deleteBanner,
  fetchBanners,
  updateBanner,
} from "@/src/lib/api";

const { Option } = Select;

export default function BannerManagement() {
  const locale = useLocale();
  const [form] = Form.useForm();
  const [banners, setBanners] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  // Hàm tải danh sách banner
  const loadBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBanners(locale);
      const filteredData = data.filter(
        (banner) =>
          banner.translations &&
          banner.translations.some((t) => t.language === locale)
      );
      setBanners(filteredData);
    } catch (error) {
      console.error("Error fetching banners:", error);
      message.error(`Không thể tải danh sách banner: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  // Tải danh sách banner khi component mount hoặc locale thay đổi
  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  // Cấu hình cột cho DataTable
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (text) =>
        text ? (
          <img src={text} alt="Banner" style={{ width: 50, height: "auto" }} />
        ) : (
          "No image"
        ),
    },
    {
      title: "Title",
      key: "title",
      render: (_, record) => {
        const translation = record.translations?.find(
          (t) => t.language === locale
        );
        return translation?.title || "No translation";
      },
    },
  ];

  // Cấu hình trường cho FormModal
  const fields = [
    {
      name: "slug",
      label: "Slug",
      rules: [{ required: true, message: "Vui lòng nhập slug" }],
    },
    {
      name: "image",
      label: "Image",
      rules: [{ required: true, message: "Vui lòng nhập đường dẫn ảnh" }],
      placeholder: "Nhập đường dẫn ảnh (ví dụ: /images/banner.jpg)",
    },
    {
      name: ["translations", 0, "language"],
      label: "Language",
      rules: [{ required: true, message: "Vui lòng chọn ngôn ngữ" }],
      render: () => (
        <Select placeholder="Chọn ngôn ngữ">
          <Option value="vi">Tiếng Việt</Option>
          <Option value="en">English</Option>
        </Select>
      ),
    },
    {
      name: ["translations", 0, "title"],
      label: "Title",
      rules: [{ required: true, message: "Vui lòng nhập tiêu đề" }],
    },
    {
      name: ["translations", 0, "description"],
      label: "Description",
      rules: [{ required: true, message: "Vui lòng nhập mô tả" }],
      type: "textarea",
    },
    {
      name: ["translations", 0, "metaDescription"],
      label: "Meta Description",
      rules: [{ required: true, message: "Vui lòng nhập meta description" }],
      type: "textarea",
    },
    {
      name: ["translations", 0, "keywords"],
      label: "Keywords",
      rules: [{ required: true, message: "Vui lòng nhập keywords" }],
      placeholder: "Nhập keywords, cách nhau bằng dấu phẩy",
    },
    {
      name: ["translations", 0, "buttonText"],
      label: "Button Text",
      rules: [{ required: true, message: "Vui lòng nhập text cho nút" }],
    },
    {
      name: ["translations", 0, "buttonLink"],
      label: "Button Link",
      rules: [{ required: true, message: "Vui lòng nhập link cho nút" }],
    },
  ];

  // Xử lý thêm banner mới
  const handleAdd = () => {
    setEditingBanner(null);
    form.resetFields();
    form.setFieldsValue({
      translations: [{ language: locale }],
    });
    setIsModalVisible(true);
  };

  // Xử lý chỉnh sửa banner
  const handleEdit = (banner) => {
    setEditingBanner(banner);
    const translation =
      banner.translations?.find((t) => t.language === locale) || {};
    form.setFieldsValue({
      slug: banner.slug,
      image: banner.image,
      translations: [
        {
          language: translation.language || locale,
          title: translation.title,
          description: translation.description,
          metaDescription: translation.metaDescription,
          keywords: translation.keywords?.join(", "),
          buttonText: translation.buttonText,
          buttonLink: translation.buttonLink,
        },
      ],
    });
    setIsModalVisible(true);
  };

  // Xử lý xóa banner với xác nhận
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa banner này?",
      onOk: async () => {
        try {
          await deleteBanner(locale, id);
          setBanners(banners.filter((banner) => banner.id !== id));
          message.success("Xóa banner thành công");
        } catch (error) {
          console.error("Error deleting banner:", error);
          message.error(`Không thể xóa banner: ${error.message}`);
        }
      },
    });
  };

  // Xử lý lưu banner (thêm hoặc cập nhật)
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (!values.translations[0].language) {
        throw new Error("Language is missing in translation data");
      }
      if (!values.image) {
        throw new Error("Image path is required");
      }

      let bannerData;
      if (editingBanner) {
        // Khi chỉnh sửa, chỉ gửi các trường đã thay đổi, giữ nguyên các trường không đổi
        const currentTranslation =
          editingBanner.translations?.find((t) => t.language === locale) || {};
        const newTranslation = values.translations[0];

        // So sánh và giữ nguyên dữ liệu cũ nếu không thay đổi
        bannerData = {
          slug:
            values.slug !== editingBanner.slug
              ? values.slug
              : editingBanner.slug,
          image:
            values.image !== editingBanner.image
              ? values.image
              : editingBanner.image,
          translations: [
            {
              language:
                newTranslation.language ||
                currentTranslation.language ||
                locale,
              title:
                newTranslation.title !== currentTranslation.title
                  ? newTranslation.title
                  : currentTranslation.title,
              description:
                newTranslation.description !== currentTranslation.description
                  ? newTranslation.description
                  : currentTranslation.description,
              metaDescription:
                newTranslation.metaDescription !==
                currentTranslation.metaDescription
                  ? newTranslation.metaDescription
                  : currentTranslation.metaDescription,
              keywords:
                newTranslation.keywords !==
                (currentTranslation.keywords?.join(", ") || "")
                  ? newTranslation.keywords
                      .split(",")
                      .map((k) => k.trim())
                      .filter((k) => k)
                  : currentTranslation.keywords || [],
              buttonText:
                newTranslation.buttonText !== currentTranslation.buttonText
                  ? newTranslation.buttonText
                  : currentTranslation.buttonText,
              buttonLink:
                newTranslation.buttonLink !== currentTranslation.buttonLink
                  ? newTranslation.buttonLink
                  : currentTranslation.buttonLink,
            },
          ],
        };
      } else {
        // Khi thêm mới, sử dụng toàn bộ dữ liệu từ form
        bannerData = {
          slug: values.slug,
          image: values.image,
          translations: [
            {
              ...values.translations[0],
              keywords: values.translations[0].keywords
                .split(",")
                .map((k) => k.trim())
                .filter((k) => k),
            },
          ],
        };
      }

      setLoading(true);
      if (editingBanner) {
        const updatedBanner = await updateBanner(
          locale,
          editingBanner.id,
          bannerData
        );
        setBanners(
          banners.map((banner) =>
            banner.id === editingBanner.id ? updatedBanner : banner
          )
        );
        message.success("Cập nhật banner thành công");
      } else {
        const newBanner = await createBanner(locale, bannerData);
        setBanners([...banners, newBanner]);
        message.success("Thêm banner thành công");
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error saving banner:", error);
      message.error(`Lưu banner thất bại: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableHeader}>
        <h2>Banners</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Banner
        </Button>
      </div>
      <DataTable
        dataSource={banners}
        columns={columns}
        rowKey="id"
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />
      <FormModal
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        form={form}
        title={editingBanner ? "Edit Banner" : "Add Banner"}
        fields={fields}
        initialValues={{ translations: [{ language: locale }] }}
      />
    </div>
  );
}
