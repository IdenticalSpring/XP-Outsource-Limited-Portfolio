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
  // States và hooks
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
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 3,
    total: 0,
  });
  const [filterType, setFilterType] = useState("all"); // State cho bộ lọc type

  // Hàm xử lý lỗi Unauthorized
  const handleUnauthorized = useCallback(() => {
    logoutAdmin();
    message.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    router.push(`/${locale}/admin/login`);
  }, [locale, router]);

  // Hàm tiện ích xử lý lỗi
  const handleErrorResponse = useCallback(
    (error, defaultMessage = "Đã xảy ra lỗi") => {
      console.error("Error:", error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.statusCode === 401) {
          handleUnauthorized();
          return { handled: true };
        }
        return { message: errorData.message || defaultMessage };
      }
      if (typeof error.message === "string") {
        try {
          if (error.message.trim().startsHeadWith("{")) {
            const errorData = JSON.parse(error.message);
            if (errorData.statusCode === 401) {
              handleUnauthorized();
              return { handled: true };
            }
            return { message: errorData.message || defaultMessage };
          }
        } catch (parseError) {}
      }
      return { message: error.message || defaultMessage };
    },
    [handleUnauthorized]
  );

  // Hàm tải danh sách blog với phân trang và bộ lọc type
  const loadBlogs = useCallback(
    async (page = 1, pageSize = 3, type = filterType) => {
      setLoading(true);
      try {
        console.log("Fetching blogs with params:", {
          locale,
          page,
          pageSize,
          type,
        }); // NEW: Log để debug
        const result = await fetchBlogs(
          locale,
          page,
          pageSize,
          type === "all" ? undefined : type
        );
        console.log("API response:", result); // NEW: Log dữ liệu trả về

        let filteredBlogs = result.data;
        // Lọc ở client nếu API không hỗ trợ tham số type
        if (type !== "all") {
          filteredBlogs = result.data.filter(
            (blog) => blog.type === parseInt(type)
          );
          console.log("Filtered blogs (client-side):", filteredBlogs); // NEW: Log kết quả lọc
        }

        if (filteredBlogs.length === 0 && type !== "all") {
          message.info("Không có blog nào thuộc loại này."); // NEW: Thông báo khi không có dữ liệu
        }

        setBlogs(filteredBlogs);
        setPagination({
          current: page,
          pageSize,
          total: type === "all" ? result.total : filteredBlogs.length, // Điều chỉnh total khi lọc ở client
        });
      } catch (error) {
        const result = handleErrorResponse(
          error,
          "Không thể tải danh sách blog"
        );
        if (!result.handled) {
          message.error(`Không thể tải danh sách blog: ${result.message}`);
        }
        setBlogs([]);
        setPagination({ current: 1, pageSize: 3, total: 0 });
      } finally {
        setLoading(false);
      }
    },
    [locale, handleErrorResponse, filterType]
  );

  // Tải danh sách blog khi component mount, locale hoặc filterType thay đổi
  useEffect(() => {
    console.log("Triggering loadBlogs with filterType:", filterType); // NEW: Log để debug
    loadBlogs(pagination.current, pagination.pageSize, filterType);
  }, [loadBlogs, locale, filterType, pagination.current, pagination.pageSize]);

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
        const result = handleErrorResponse(
          error,
          "Không thể tải danh sách bản dịch"
        );
        if (!result.handled) {
          message.error(`Không thể tải danh sách bản dịch: ${result.message}`);
        }
        setTranslations([]);
      } finally {
        setTranslationsLoading(false);
      }
    },
    [locale, handleErrorResponse]
  );

  // Xử lý thay đổi phân trang
  const handleTableChange = useCallback(
    (pagination) => {
      const { current, pageSize } = pagination;
      setPagination((prev) => ({
        ...prev,
        current,
        pageSize,
      }));
      loadBlogs(current, pageSize, filterType);
    },
    [loadBlogs, filterType]
  );

  // Xử lý thay đổi bộ lọc type
  const handleFilterTypeChange = (value) => {
    console.log("Filter type changed to:", value); // NEW: Log để debug
    setFilterType(value);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset về trang 1
    loadBlogs(1, pagination.pageSize, value);
  };

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
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        switch (type) {
          case 1:
            return "Project";
          case 2:
            return "Achievements";
          case 3:
            return "Resources";
          default:
            return "Unknown";
        }
      },
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
      name: "type",
      label: "Blog Type",
      rules: [{ required: true, message: "Vui lòng chọn loại blog" }],
      type: "select",
      options: [
        { value: 1, label: "Project" },
        { value: 2, label: "Achievements" },
        { value: 3, label: "Resources" },
      ],
      defaultValue: 1,
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

  // Xử lý xóa blog với xác nhận
  const handleDeleteBlog = useCallback(
    (id) => {
      Modal.confirm({
        title: "Xác nhận xóa",
        content:
          "Bạn có chắc chắn muốn xóa blog này? Tất cả các bản dịch của blog này cũng sẽ bị xóa.",
        onOk: async () => {
          try {
            await deleteBlog(locale, id);
            setBlogs(blogs.filter((blog) => blog.id !== id));
            setPagination((prev) => ({
              ...prev,
              total: prev.total - 1,
              current:
                Math.ceil((prev.total - 1) / prev.pageSize) < prev.current
                  ? Math.max(1, prev.current - 1)
                  : prev.current,
            }));
            message.success("Xóa blog thành công");
            if (selectedBlog?.id === id) {
              setShowTranslations(false);
              setSelectedBlog(null);
            }
          } catch (error) {
            const result = handleErrorResponse(error, "Không thể xóa blog");
            if (!result.handled) {
              message.error(`Không thể xóa blog: ${result.message}`);
            }
          }
        },
      });
    },
    [locale, blogs, selectedBlog, handleErrorResponse]
  );

  // Xử lý xóa translation với xác nhận
  const handleDeleteTranslation = useCallback(
    (translationLanguage) => {
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
            const result = handleErrorResponse(error, "Không thể xóa bản dịch");
            if (!result.handled) {
              message.error(`Không thể xóa bản dịch: ${result.message}`);
            }
          }
        },
      });
    },
    [
      locale,
      selectedBlog,
      translations,
      loadBlogTranslations,
      handleErrorResponse,
    ]
  );

  // Xử lý lưu blog (thêm hoặc cập nhật)
  const handleBlogModalOk = async () => {
    try {
      const values = await blogForm.validateFields();
      if (!values.image) {
        message.error("Image path is required");
        return;
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
        type: values.type,
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
      console.log("Blog data being sent:", blogData);
      if (editingBlog) {
        const updateData = {};
        if (values.slug) updateData.slug = values.slug;
        if (values.image) updateData.image = values.image;
        if (values.altText) updateData.altText = values.altText;
        if (values.canonicalUrl) updateData.canonicalUrl = values.canonicalUrl;
        if (values.date) updateData.date = values.date.toISOString();
        if (values.type) updateData.type = values.type;
        if (
          values.language &&
          values.title &&
          values.metaTitle &&
          values.metaDescription &&
          values.ogTitle &&
          values.ogDescription &&
          values.content
        ) {
          updateData.translations = [
            {
              language: values.language,
              title: values.title,
              metaTitle: values.metaTitle,
              metaDescription: values.metaDescription,
              ogTitle: values.ogTitle,
              ogDescription: values.ogDescription,
              content: values.content,
            },
          ];
        }
        const updatedBlog = await updateBlog(
          locale,
          editingBlog.id,
          updateData
        );
        console.log("Updated blog response:", updatedBlog);
        await loadBlogs(pagination.current, pagination.pageSize, filterType);
        message.success("Cập nhật blog thành công");
      } else {
        const newBlog = await createBlog(locale, blogData);
        console.log("Created blog response:", newBlog);
        setPagination((prev) => ({
          ...prev,
          total: prev.total + 1,
        }));
        await loadBlogs(pagination.current, pagination.pageSize, filterType);
        message.success("Thêm blog thành công");
      }
      setIsBlogModalVisible(false);
      blogForm.resetFields();
    } catch (error) {
      const result = handleErrorResponse(error, "Lưu blog thất bại");
      if (!result.handled) {
        message.error(`Lưu blog thất bại: ${result.message}`);
      }
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
        message.error("Dữ liệu bản dịch từ server không hợp lệ");
        return;
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
      const result = handleErrorResponse(error, "Lưu bản dịch thất bại");
      if (!result.handled) {
        message.error(`Lưu bản dịch thất bại: ${result.message}`);
      }
    } finally {
      setTranslationsLoading(false);
    }
  };

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
      type: 1,
    });
    setIsBlogModalVisible(true);
  };

  // Xử lý chỉnh sửa blog
  const handleEditBlog = async (blog) => {
    setEditingBlog(blog);
    let defaultTranslation = null;
    try {
      const translations = await fetchBlogTranslations(locale, blog.id);
      defaultTranslation =
        translations.find((t) => t.language === locale) || translations[0];
    } catch (error) {
      console.error("Error fetching translations for edit:", error);
    }
    blogForm.setFieldsValue({
      slug: blog.slug,
      image: blog.image,
      altText: blog.altText,
      canonicalUrl: blog.canonicalUrl,
      date: blog.date ? moment(blog.date) : null,
      type: blog.type,
      language: defaultTranslation?.language || "en",
      title: defaultTranslation?.title || "",
      metaTitle: defaultTranslation?.metaTitle || "",
      metaDescription: defaultTranslation?.metaDescription || "",
      ogTitle: defaultTranslation?.ogTitle || "",
      ogDescription: defaultTranslation?.ogDescription || "",
      content: defaultTranslation?.content || "",
    });
    setIsBlogModalVisible(true);
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
            <div className={styles.filterContainer}>
              <Select
                value={filterType}
                onChange={handleFilterTypeChange}
                style={{ width: 200 }}
                className={styles.filterSelect}
              >
                <Option value="all">All Types</Option>
                <Option value="1">Project</Option>
                <Option value="2">Achievements</Option>
                <Option value="3">Resources</Option>
              </Select>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddBlog}
              >
                Add Blog
              </Button>
            </div>
          </div>
          <DataTable
            dataSource={blogs}
            columns={blogColumnsWithActions}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ["3", "5", "10", "20"],
              showTotal: (total) => `Tổng ${total} blog`,
            }}
            onChange={handleTableChange}
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
