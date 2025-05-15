"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import { Button, message, Form, Modal, Select, Input, DatePicker } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import styles from "./BlogsManagement.module.css";
import DataTable from "./Datatable";
import FormModal from "./FormModal";
import { fetchBlogs, createBlog, updateBlog, deleteBlog } from "@/src/lib/api";
import moment from "moment";

const { Option } = Select;
const { TextArea } = Input;

// Hàm xử lý đường dẫn ảnh
const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
};

// Lấy translation theo ngôn ngữ
const getTranslation = (blog, locale) =>
  blog.translations?.find((t) => t.language === locale) || {};

export default function BlogsManagement() {
  const locale = useLocale();
  const [form] = Form.useForm();
  const [blogs, setBlogs] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data: blogsData } = await fetchBlogs(locale);
      const filteredData = blogsData.filter(
        (blog) =>
          blog.translations &&
          blog.translations.some((t) => t.language === locale)
      );
      setBlogs(filteredData);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      message.error(`Không thể tải danh sách blog: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (text) =>
        text ? (
          <img
            src={getImageUrl(text)}
            alt="Blog"
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
      title: "Title",
      key: "title",
      render: (_, record) => getTranslation(record, locale).title || "No title",
    },
    {
      title: "Meta Title",
      key: "metaTitle",
      render: (_, record) => getTranslation(record, locale).metaTitle || "-",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text) => moment(text).format("YYYY-MM-DD"),
    },
    // {
    //   title: "Actions",
    //   key: "actions",
    //   render: (_, record) => (
    //     <>
    //       <Button type="link" onClick={() => handleEdit(record)}>
    //         Edit
    //       </Button>
    //       <Button type="link" danger onClick={() => handleDelete(record.id)}>
    //         Delete
    //       </Button>
    //     </>
    //   ),
    // },
  ];

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
      placeholder: "Nhập đường dẫn ảnh (ví dụ: /images/blog.jpg)",
    },
    {
      name: "altText",
      label: "Alt Text",
      rules: [{ required: true, message: "Vui lòng nhập alt text" }],
    },
    {
      name: "canonicalUrl",
      label: "Canonical URL",
      rules: [{ required: true, message: "Vui lòng nhập canonical URL" }],
      placeholder: "https://example.com/blog/slug",
    },
    {
      name: "date",
      label: "Date",
      rules: [{ required: true, message: "Vui lòng chọn ngày" }],
      render: () => <DatePicker format="YYYY-MM-DD" />,
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
      name: ["translations", 0, "metaTitle"],
      label: "Meta Title",
      rules: [
        { required: true, message: "Vui lòng nhập meta title" },
        { min: 10, message: "Tối thiểu 10 ký tự" },
        { max: 70, message: "Tối đa 70 ký tự" },
      ],
    },
    {
      name: ["translations", 0, "metaDescription"],
      label: "Meta Description",
      rules: [
        { required: true, message: "Vui lòng nhập meta description" },
        { min: 50, message: "Tối thiểu 50 ký tự" },
        { max: 160, message: "Tối đa 160 ký tự" },
      ],
      type: "textarea",
    },
    {
      name: ["translations", 0, "ogTitle"],
      label: "OG Title",
      rules: [{ required: true, message: "Vui lòng nhập OG title" }],
    },
    {
      name: ["translations", 0, "ogDescription"],
      label: "OG Description",
      rules: [{ required: true, message: "Vui lòng nhập OG description" }],
      type: "textarea",
    },
    {
      name: ["translations", 0, "content"],
      label: "Content",
      rules: [{ required: true, message: "Vui lòng nhập nội dung" }],
      type: "textarea",
    },
  ];

  const handleAdd = () => {
    setEditingBlog(null);
    form.resetFields();
    form.setFieldsValue({
      translations: [{ language: locale }],
      date: moment(),
    });
    setIsModalVisible(true);
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    const translation = getTranslation(blog, locale);
    form.setFieldsValue({
      slug: blog.slug,
      image: blog.image,
      altText: blog.altText,
      canonicalUrl: blog.canonicalUrl,
      date: blog.date ? moment(blog.date) : null,
      translations: [
        {
          language: translation.language || locale,
          title: translation.title,
          metaTitle: translation.metaTitle,
          metaDescription: translation.metaDescription,
          ogTitle: translation.ogTitle,
          ogDescription: translation.ogDescription,
          content: translation.content,
        },
      ],
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa blog này?",
      onOk: async () => {
        try {
          await deleteBlog(locale, id);
          setBlogs((prev) => prev.filter((b) => b.id !== id));
          message.success("Xóa blog thành công");
        } catch (error) {
          message.error(`Xóa blog thất bại: ${error.message}`);
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const blogData = {
        slug: values.slug,
        image: values.image,
        altText: values.altText,
        canonicalUrl: values.canonicalUrl,
        date: values.date.toISOString(),
        translations: values.translations,
      };

      setLoading(true);
      if (editingBlog) {
        const updated = await updateBlog(locale, editingBlog.id, blogData);
        setBlogs((prev) =>
          prev.map((b) => (b.id === editingBlog.id ? updated : b))
        );
        message.success("Cập nhật blog thành công");
      } else {
        const created = await createBlog(locale, blogData);
        setBlogs((prev) => [...prev, created]);
        message.success("Thêm blog thành công");
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error(`Lưu blog thất bại: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableHeader}>
        <h2>Blog Management</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Blog
        </Button>
      </div>
      <DataTable
        dataSource={blogs}
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
        title={editingBlog ? "Edit Blog" : "Add Blog"}
        fields={fields}
        initialValues={{
          translations: [{ language: locale }],
          date: moment(),
        }}
      />
    </div>
  );
}
