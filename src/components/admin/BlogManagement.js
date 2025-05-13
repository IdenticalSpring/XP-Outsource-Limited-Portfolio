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
  const url = `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
  console.log("Generated image URL:", url);
  return url;
};

export default function BlogsManagement() {
  const locale = useLocale();
  const [form] = Form.useForm();
  const [blogs, setBlogs] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [loading, setLoading] = useState(false);

  // Hàm tải danh sách blog
  const loadBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBlogs(locale);
      const filteredData = data.filter(
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

  // Tải danh sách blog khi component mount hoặc locale thay đổi
  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

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
      placeholder: "Nhập canonical URL (ví dụ: https://example.com/blog/slug)",
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
        { min: 10, message: "Meta title phải có ít nhất 10 ký tự" },
        { max: 70, message: "Meta title không được vượt quá 70 ký tự" },
      ],
    },
    {
      name: ["translations", 0, "metaDescription"],
      label: "Meta Description",
      rules: [
        { required: true, message: "Vui lòng nhập meta description" },
        { min: 50, message: "Meta description phải có ít nhất 50 ký tự" },
        { max: 160, message: "Meta description không được vượt quá 160 ký tự" },
      ],
      type: "textarea",
    },
    {
      name: ["translations", 0, "ogTitle"],
      label: "Open Graph Title",
      rules: [{ required: true, message: "Vui lòng nhập OG title" }],
    },
    {
      name: ["translations", 0, "ogDescription"],
      label: "Open Graph Description",
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

  // Xử lý thêm blog mới
  const handleAdd = useCallback(() => {
    setEditingBlog(null);
    form.resetFields();
    form.setFieldsValue({
      translations: [{ language: locale }],
      date: moment(),
    });
    setIsModalVisible(true);
  }, [form, locale]);

  // Xử lý chỉnh sửa blog
  const handleEdit = useCallback(
    (blog) => {
      setEditingBlog(blog);
      const translation =
        blog.translations?.find((t) => t.language === locale) || {};
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
    },
    [form, locale]
  );

  // Xử lý xóa blog với xác nhận
  const handleDelete = useCallback(
    (id) => {
      Modal.confirm({
        title: "Xác nhận xóa",
        content: "Bạn có chắc chắn muốn xóa blog này?",
        onOk: async () => {
          try {
            await deleteBlog(locale, id);
            setBlogs(blogs.filter((blog) => blog.id !== id));
            message.success("Xóa blog thành công");
          } catch (error) {
            console.error("Error deleting blog:", error);
            message.error(`Không thể xóa blog: ${error.message}`);
          }
        },
      });
    },
    [blogs, locale]
  );

  // Xử lý lưu blog (thêm hoặc cập nhật)
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (!values.translations[0].language) {
        throw new Error("Language is missing in translation data");
      }
      if (!values.image) {
        throw new Error("Image path is required");
      }

      const blogData = {
        slug: values.slug,
        image: values.image,
        altText: values.altText,
        canonicalUrl: values.canonicalUrl,
        date: values.date.toISOString(),
        translations: [
          {
            language: values.translations[0].language,
            title: values.translations[0].title,
            metaTitle: values.translations[0].metaTitle,
            metaDescription: values.translations[0].metaDescription,
            ogTitle: values.translations[0].ogTitle,
            ogDescription: values.translations[0].ogDescription,
            content: values.translations[0].content,
          },
        ],
      };

      setLoading(true);
      if (editingBlog) {
        const updatedBlog = await updateBlog(locale, editingBlog.id, blogData);
        setBlogs(
          blogs.map((blog) => (blog.id === editingBlog.id ? updatedBlog : blog))
        );
        message.success("Cập nhật blog thành công");
      } else {
        const newBlog = await createBlog(locale, blogData);
        setBlogs([...blogs, newBlog]);
        message.success("Thêm blog thành công");
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error saving blog:", error);
      message.error(`Lưu blog thất bại: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableHeader}>
        <h2>Blogs</h2>
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
        initialValues={{ translations: [{ language: locale }], date: moment() }}
      />
    </div>
  );
}
