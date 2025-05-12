// src/components/admin/BannerManagement.js
"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Button, message, Form } from "antd";
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

export default function BannerManagement() {
  const locale = useLocale();
  const [form] = Form.useForm();
  const [banners, setBanners] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách banner khi tải component
  useEffect(() => {
    const loadBanners = async () => {
      setLoading(true);
      try {
        const data = await fetchBanners(locale);
        setBanners(data);
      } catch (error) {
        message.error("Không thể tải danh sách banner");
      } finally {
        setLoading(false);
      }
    };
    loadBanners();
  }, [locale]);

  // Cấu hình cột cho DataTable
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (text) => (
        <img src={text} alt="Banner" style={{ width: 50, height: "auto" }} />
      ),
    },
    {
      title: "Title",
      key: "title",
      render: (_, record) => {
        const translation = record.translations.find(
          (t) => t.language === locale
        );
        return translation ? translation.title : "N/A";
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
      label: "Image URL",
      rules: [{ required: true, message: "Vui lòng nhập URL hình ảnh" }],
    },
    {
      name: ["translations", 0, "title"],
      label: `Title (${locale})`,
      rules: [{ required: true, message: "Vui lòng nhập tiêu đề" }],
    },
    {
      name: ["translations", 0, "description"],
      label: `Description (${locale})`,
      rules: [{ required: true, message: "Vui lòng nhập mô tả" }],
      type: "textarea",
    },
    {
      name: ["translations", 0, "metaDescription"],
      label: `Meta Description (${locale})`,
      rules: [{ required: true, message: "Vui lòng nhập meta description" }],
      type: "textarea",
    },
    {
      name: ["translations", 0, "keywords"],
      label: `Keywords (${locale})`,
      rules: [{ required: true, message: "Vui lòng nhập keywords" }],
      placeholder: "Nhập keywords, cách nhau bằng dấu phẩy",
    },
    {
      name: ["translations", 0, "buttonText"],
      label: `Button Text (${locale})`,
      rules: [{ required: true, message: "Vui lòng nhập text cho nút" }],
    },
    {
      name: ["translations", 0, "buttonLink"],
      label: `Button Link (${locale})`,
      rules: [{ required: true, message: "Vui lòng nhập link cho nút" }],
    },
  ];

  const handleAdd = () => {
    setEditingBanner(null);
    form.resetFields();
    form.setFieldsValue({
      translations: [{ language: locale }],
    });
    setIsModalVisible(true);
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    const translation =
      banner.translations.find((t) => t.language === locale) || {};
    form.setFieldsValue({
      slug: banner.slug,
      image: banner.image,
      translations: [{ ...translation, language: locale }],
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteBanner(locale, id);
      setBanners(banners.filter((banner) => banner.id !== id));
      message.success("Xóa banner thành công");
    } catch (error) {
      message.error("Không thể xóa banner");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const bannerData = {
        slug: values.slug,
        image: values.image,
        translations: [
          {
            ...values.translations[0],
            keywords: values.translations[0].keywords
              .split(",")
              .map((k) => k.trim()),
          },
        ],
      };

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
      message.error("Lưu banner thất bại");
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
        onCancel={() => setIsModalVisible(false)}
        form={form}
        title={editingBanner ? "Edit Banner" : "Add Banner"}
        fields={fields}
        initialValues={{ translations: [{ language: locale }] }}
      />
    </div>
  );
}
