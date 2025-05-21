"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button, message, Form, Modal, Select, Input, DatePicker } from "antd";
import { PlusOutlined, TranslationOutlined } from "@ant-design/icons";
import styles from "./BlogsManagement.module.css";
import DataTable from "./Datatable";
import FormModal from "./FormModal";
import {
  fetchBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  fetchBlogTranslations,
  addOrUpdateBlogTranslation,
  deleteBlogTranslation,
  logoutAdmin,
} from "@/src/lib/api";
import moment from "moment";

const { Option } = Select;

// Hàm xử lý đường dẫn ảnh
const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  const url = `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
  console.log("Generated image URL:", url);
  return url;
};

export default function BlogManagement() {
  const locale = useLocale();
  const t = useTranslations("BlogManagement");
  const router = useRouter();
  const [blogForm] = Form.useForm();
  const [translationForm] = Form.useForm();
  const [blogs, setBlogs] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [isBlogModalVisible, setIsBlogModalVisible] = useState(false);
  const [isTranslationModalVisible, setIsTranslationModalVisible] =
    useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [editingTranslation, setEditingTranslation] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showTranslations, setShowTranslations] = useState(false);
  const [loading, setLoading] = useState(false);
  const [translationsLoading, setTranslationsLoading] = useState(false);

  // Hàm xử lý lỗi Unauthorized
  const handleUnauthorized = () => {
    logoutAdmin();
    message.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    router.push(`/${locale}/admin/login`);
  };

  // Hàm tải danh sách blog
  const loadBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBlogs(locale);
      console.log("Loaded blogs:", data);
      setBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
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
      message.error(`Không thể tải danh sách blog: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [locale, router]);

  // Tải danh sách blog khi component mount hoặc locale thay đổi
  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  // Hàm tải danh sách translation của một blog
  const loadBlogTranslations = useCallback(
    async (blogId) => {
      if (!blogId) return;

      setTranslationsLoading(true);
      try {
        const translations = await fetchBlogTranslations(locale, blogId);
        console.log("Loaded translations for blog", blogId, ":", translations);
        setTranslations(translations);
      } catch (error) {
        console.error("Error fetching blog translations:", error);
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
        message.error(`Không thể tải danh sách bản dịch: ${error.message}`);
        setTranslations([]);
      } finally {
        setTranslationsLoading(false);
      }
    },
    [locale, router]
  );

  // Cấu hình cột cho bảng Blog
  const blogColumns = [
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
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text) => (text ? moment(text).format("YYYY-MM-DD") : "N/A"),
    },
  ];

  // Cấu hình cột cho bảng Translation
  const translationColumns = [
    { title: "Language", dataIndex: "language", key: "language" },
    { title: "Title", dataIndex: "title", key: "title" },
    {
      title: "Meta Description",
      dataIndex: "metaDescription",
      key: "metaDescription",
      ellipsis: true,
      render: (text) =>
        text?.substring(0, 50) + (text?.length > 50 ? "..." : ""),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button
            type="link"
            onClick={() => {
              setEditingTranslation(record);
              setIsTranslationModalVisible(true);
              translationForm.setFieldsValue({
                ...record,
                metaTitle: record.metaTitle || "",
                metaDescription: record.metaDescription || "",
                ogTitle: record.ogTitle || "",
                ogDescription: record.ogDescription || "",
                content: record.content || "",
              });
            }}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDeleteTranslation(record.language)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  // Cấu hình trường cho form Blog
  const blogFields = [
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
      placeholder: "Nhập alt text cho ảnh",
    },
    {
      name: "canonicalUrl",
      label: "Canonical URL",
      rules: [{ required: true, message: "Vui lòng nhập canonical URL" }],
      placeholder: "Nhập canonical URL",
    },
    {
      name: "date",
      label: "Date",
      rules: [{ required: true, message: "Vui lòng chọn ngày" }],
      type: "date",
    },
    {
      name: "title",
      label: "Title",
      rules: [{ required: true, message: "Vui lòng nhập tiêu đề" }],
    },
    {
      name: "metaTitle",
      label: "Meta Title",
      rules: [
        { required: true, message: "Vui lòng nhập meta title" },
        { min: 10, message: "Meta title phải có ít nhất 10 ký tự" },
        { max: 70, message: "Meta title không được vượt quá 70 ký tự" },
      ],
    },
    {
      name: "metaDescription",
      label: "Meta Description",
      rules: [
        { required: true, message: "Vui lòng nhập meta description" },
        { min: 50, message: "Meta description phải có ít nhất 50 ký tự" },
        { max: 160, message: "Meta description không được vượt quá 160 ký tự" },
      ],
      type: "textarea",
    },
    {
      name: "ogTitle",
      label: "Open Graph Title",
      rules: [{ required: true, message: "Vui lòng nhập OG title" }],
    },
    {
      name: "ogDescription",
      label: "Open Graph Description",
      rules: [{ required: true, message: "Vui lòng nhập OG description" }],
      type: "textarea",
    },
    {
      name: "content",
      label: "Content",
      rules: [{ required: true, message: "Vui lòng nhập nội dung" }],
      type: "textarea",
    },
    {
      name: "language",
      label: "Language",
      rules: [{ required: true, message: "Vui lòng chọn ngôn ngữ" }],
      type: "select",
      options: [
        { value: "vi", label: "Tiếng Việt" },
        { value: "en", label: "English" },
      ],
      defaultValue: "en",
    },
  ];

  // Cấu hình trường cho form Translation
  const translationFields = [
    {
      name: "language",
      label: "Language",
      rules: [{ required: true, message: "Vui lòng chọn ngôn ngữ" }],
      type: "select",
      options: [
        { value: "vi", label: "Tiếng Việt" },
        { value: "en", label: "English" },
      ],
      defaultValue: "en",
    },
    {
      name: "title",
      label: "Title",
      rules: [{ required: true, message: "Vui lòng nhập tiêu đề" }],
    },
    {
      name: "metaTitle",
      label: "Meta Title",
      rules: [
        { required: true, message: "Vui lòng nhập meta title" },
        { min: 10, message: "Meta title phải có ít nhất 10 ký tự" },
        { max: 70, message: "Meta title không được vượt quá 70 ký tự" },
      ],
    },
    {
      name: "metaDescription",
      label: "Meta Description",
      rules: [
        { required: true, message: "Vui lòng nhập meta description" },
        { min: 50, message: "Meta description phải có ít nhất 50 ký tự" },
        { max: 160, message: "Meta description không được vượt quá 160 ký tự" },
      ],
      type: "textarea",
    },
    {
      name: "ogTitle",
      label: "Open Graph Title",
      rules: [{ required: true, message: "Vui lòng nhập OG title" }],
    },
    {
      name: "ogDescription",
      label: "Open Graph Description",
      rules: [{ required: true, message: "Vui lòng nhập OG description" }],
      type: "textarea",
    },
    {
      name: "content",
      label: "Content",
      rules: [{ required: true, message: "Vui lòng nhập nội dung" }],
      type: "textarea",
    },
  ];

  // Xử lý thêm blog mới
  const handleAddBlog = () => {
    setEditingBlog(null);
    blogForm.resetFields();
    blogForm.setFieldsValue({
      language: "en",
      title: "",
      metaTitle: "",
      metaDescription: "",
      ogTitle: "",
      ogDescription: "",
      content: "",
    });
    setIsBlogModalVisible(true);
  };

  // Xử lý chỉnh sửa blog
  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    blogForm.setFieldsValue({
      slug: blog.slug,
      image: blog.image,
      altText: blog.altText,
      canonicalUrl: blog.canonicalUrl,
      date: blog.date ? moment(blog.date) : null,
      // Optionally set translation fields if editing includes a default translation
    });
    setIsBlogModalVisible(true);
  };

  // Xử lý xóa blog với xác nhận
  const handleDeleteBlog = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content:
        "Bạn có chắc chắn muốn xóa blog này? Tất cả các bản dịch của blog này cũng sẽ bị xóa.",
      onOk: async () => {
        try {
          await deleteBlog(locale, id);
          setBlogs(blogs.filter((blog) => blog.id !== id));
          message.success("Xóa blog thành công");

          if (selectedBlog?.id === id) {
            setShowTranslations(false);
            setSelectedBlog(null);
          }
        } catch (error) {
          console.error("Error deleting blog:", error);
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
          message.error(`Không thể xóa blog: ${error.message}`);
        }
      },
    });
  };

  // Xử lý quản lý translations
  const handleManageTranslations = (blog) => {
    setSelectedBlog(blog);
    setShowTranslations(true);
    loadBlogTranslations(blog.id);
  };

  // Xử lý thêm translation mới
  const handleAddTranslation = () => {
    setEditingTranslation(null);
    translationForm.resetFields();
    translationForm.setFieldsValue({
      language: "en",
      title: "",
      metaTitle: "",
      metaDescription: "",
      ogTitle: "",
      ogDescription: "",
      content: "",
    });
    setIsTranslationModalVisible(true);
  };

  // Xử lý xóa translation với xác nhận
  const handleDeleteTranslation = (translationLanguage) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa bản dịch này?",
      onOk: async () => {
        try {
          await deleteBlogTranslation(
            locale,
            selectedBlog.id,
            translationLanguage
          );
          setTranslations(
            translations.filter((t) => t.language !== translationLanguage)
          );
          message.success("Xóa bản dịch thành công");
          if (selectedBlog?.id) {
            await loadBlogTranslations(selectedBlog.id);
          }
        } catch (error) {
          console.error("Error deleting translation:", error);
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
          message.error(`Không thể xóa bản dịch: ${error.message}`);
        }
      },
    });
  };

  // Xử lý lưu blog (thêm hoặc cập nhật)
  const handleBlogModalOk = async () => {
    try {
      const values = await blogForm.validateFields();
      if (!values.image) {
        throw new Error("Image path is required");
      }

      setLoading(true);

      const blogData = {
        slug: values.slug,
        image: values.image,
        altText: values.altText,
        canonicalUrl: values.canonicalUrl,
        date: values.date
          ? values.date.toISOString()
          : new Date().toISOString(),
        translations: [
          {
            language: values.language,
            title: values.title,
            metaTitle: values.metaTitle,
            metaDescription: values.metaDescription,
            ogTitle: values.ogTitle,
            ogDescription: values.ogDescription,
            content: values.content,
          },
        ],
      };

      console.log("Blog data being sent:", blogData); // Debug payload

      if (editingBlog) {
        const updatedBlog = await updateBlog(locale, editingBlog.id, blogData);
        console.log("Updated blog response:", updatedBlog);
        await loadBlogs(); // Refresh the blog list from backend
        message.success("Cập nhật blog thành công");
      } else {
        const newBlog = await createBlog(locale, blogData);
        console.log("Created blog response:", newBlog);
        await loadBlogs(); // Refresh the blog list from backend
        message.success("Thêm blog thành công");
      }
      setIsBlogModalVisible(false);
      blogForm.resetFields();
    } catch (error) {
      console.error("Error saving blog:", error);
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
      message.error(`Lưu blog thất bại: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý lưu translation (thêm hoặc cập nhật)
  const handleTranslationModalOk = async () => {
    try {
      const values = await translationForm.validateFields();
      console.log("Translation form values:", values);

      setTranslationsLoading(true);

      const translationData = {
        language: values.language,
        title: values.title,
        metaTitle: values.metaTitle,
        metaDescription: values.metaDescription,
        ogTitle: values.ogTitle,
        ogDescription: values.ogDescription,
        content: values.content,
      };

      console.log("Translation data:", translationData);

      const updatedBlog = await addOrUpdateBlogTranslation(
        locale,
        selectedBlog.id,
        translationData
      );

      console.log("Updated blog response:", updatedBlog);

      if (!Array.isArray(updatedBlog.translations)) {
        console.warn(
          "Response translations is not an array:",
          updatedBlog.translations
        );
        throw new Error("Dữ liệu bản dịch từ server không hợp lệ");
      }

      setTranslations(updatedBlog.translations);

      if (selectedBlog?.id) {
        await loadBlogTranslations(selectedBlog.id);
      }

      message.success(
        editingTranslation
          ? "Cập nhật bản dịch thành công"
          : "Thêm bản dịch thành công"
      );

      setIsTranslationModalVisible(false);
      translationForm.resetFields();
    } catch (error) {
      console.error("Error saving translation:", error);
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
      message.error(`Lưu bản dịch thất bại: ${error.message}`);
    } finally {
      setTranslationsLoading(false);
    }
  };

  // Xử lý quay lại danh sách blog
  const handleBackToBlogs = () => {
    setShowTranslations(false);
    setSelectedBlog(null);
    setTranslations([]);
  };

  // Cấu hình actions cho bảng Blog
  const blogActions = {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <>
        <Button type="link" onClick={() => handleEditBlog(record)}>
          Edit
        </Button>
        <Button type="link" danger onClick={() => handleDeleteBlog(record.id)}>
          Delete
        </Button>
        <Button
          type="link"
          icon={<TranslationOutlined />}
          onClick={() => handleManageTranslations(record)}
        >
          Translations
        </Button>
      </>
    ),
  };

  const blogColumnsWithActions = [...blogColumns, blogActions];

  return (
    <div className={styles.container}>
      {!showTranslations ? (
        <>
          <div className={styles.tableHeader}>
            <h2>Blogs</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddBlog}
            >
              Add Blog
            </Button>
          </div>
          <DataTable
            dataSource={blogs}
            columns={blogColumnsWithActions}
            rowKey="id"
            loading={loading}
          />
          <FormModal
            visible={isBlogModalVisible}
            onOk={handleBlogModalOk}
            onCancel={() => {
              setIsBlogModalVisible(false);
              blogForm.resetFields();
            }}
            form={blogForm}
            title={editingBlog ? "Edit Blog" : "Add Blog"}
            fields={blogFields}
          />
        </>
      ) : (
        <>
          <div className={styles.tableHeader}>
            <div className={styles.breadcrumb}>
              <Button type="link" onClick={handleBackToBlogs}>
                Blogs
              </Button>
              <span> / </span>
              <span>Translations for Blog: {selectedBlog?.slug}</span>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddTranslation}
            >
              Add Translation
            </Button>
          </div>
          <DataTable
            dataSource={translations}
            columns={translationColumns}
            rowKey="language"
            loading={translationsLoading}
          />
          <FormModal
            visible={isTranslationModalVisible}
            onOk={handleTranslationModalOk}
            onCancel={() => {
              setIsTranslationModalVisible(false);
              translationForm.resetFields();
            }}
            form={translationForm}
            title={editingTranslation ? "Edit Translation" : "Add Translation"}
            fields={translationFields}
          />
        </>
      )}
    </div>
  );
}
