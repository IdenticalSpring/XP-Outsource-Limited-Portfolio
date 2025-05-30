"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button, message, Form, Modal, Select, Input } from "antd";
import { PlusOutlined, TranslationOutlined } from "@ant-design/icons";
import styles from "./BannerManagement.module.css";
import DataTable from "./Datatable";
import FormModal from "./FormModal";
import {
  createBanner,
  deleteBanner,
  fetchBanners,
  updateBanner,
  fetchBannerTranslations,
  createBannerTranslation,
  updateBannerTranslation,
  deleteBannerTranslation,
  logoutAdmin,
} from "@/src/lib/api";

const { Option } = Select;

// Hàm xử lý đường dẫn ảnh
const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  const url = `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
  console.log("Generated image URL:", url);
  return url;
};

export default function BannerManagement() {
  const locale = useLocale();
  const t = useTranslations("BannerManagement");
  const router = useRouter();
  const [bannerForm] = Form.useForm();
  const [translationForm] = Form.useForm();
  const [banners, setBanners] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [isBannerModalVisible, setIsBannerModalVisible] = useState(false);
  const [isTranslationModalVisible, setIsTranslationModalVisible] =
    useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [editingTranslation, setEditingTranslation] = useState(null);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [showTranslations, setShowTranslations] = useState(false);
  const [loading, setLoading] = useState(false);
  const [translationsLoading, setTranslationsLoading] = useState(false);

  // Hàm xử lý lỗi Unauthorized
  const handleUnauthorized = () => {
    logoutAdmin();
    message.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    router.push(`/${locale}/admin/login`);
  };

  // Hàm tải danh sách banner
  const loadBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBanners(locale);
      console.log("Loaded banners:", data);
      setBanners(data);
    } catch (error) {
      console.error("Error fetching banners:", error);
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
      message.error(`Không thể tải danh sách banner: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [locale, router]);

  // Tải danh sách banner khi component mount hoặc locale thay đổi
  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  // Hàm tải danh sách translation của một banner
  const loadBannerTranslations = useCallback(
    async (bannerId) => {
      if (!bannerId) return;

      setTranslationsLoading(true);
      try {
        const translations = await fetchBannerTranslations(locale, bannerId);
        console.log(
          "Loaded translations for banner",
          bannerId,
          ":",
          translations
        );
        setTranslations(translations);
      } catch (error) {
        console.error("Error fetching banner translations:", error);
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

  // Cấu hình cột cho bảng Banner
  const bannerColumns = [
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
            alt="Banner"
            style={{ width: 50, height: "auto" }}
            onError={(e) => {
              e.target.src = "/fallback-image.jpg";
            }}
          />
        ) : (
          "No image"
        ),
    },
  ];

  // Cấu hình cột cho bảng Translation
  const translationColumns = [
    { title: "Language", dataIndex: "language", key: "language" },
    { title: "Title", dataIndex: "title", key: "title" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) =>
        text?.substring(0, 50) + (text?.length > 50 ? "..." : ""),
    },
    { title: "Button Text", dataIndex: "buttonText", key: "buttonText" },
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
              translationForm.setFieldsValue(record);
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

  // Cấu hình trường cho form Banner
  const bannerFields = [
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
    },
    {
      name: "title",
      label: "Title",
      rules: [{ required: true, message: "Vui lòng nhập tiêu đề" }],
    },
    {
      name: "description",
      label: "Description",
      rules: [{ required: true, message: "Vui lòng nhập mô tả" }],
      type: "textarea",
    },
    {
      name: "metaDescription",
      label: "Meta Description",
      rules: [{ required: true, message: "Vui lòng nhập meta description" }],
      type: "textarea",
    },
    {
      name: "keywords",
      label: "Keywords",
      rules: [{ required: true, message: "Vui lòng nhập keywords" }],
      placeholder: "Nhập keywords, cách nhau bằng dấu phẩy",
    },
    {
      name: "buttonText",
      label: "Button Text",
      rules: [{ required: true, message: "Vui lòng nhập text cho nút" }],
    },
    {
      name: "buttonLink",
      label: "Button Link",
      rules: [{ required: true, message: "Vui lòng nhập link cho nút" }],
    },
  ];

  // Xử lý thêm banner mới
  const handleAddBanner = () => {
    setEditingBanner(null);
    bannerForm.resetFields();
    setIsBannerModalVisible(true);
  };

  // Xử lý chỉnh sửa banner
  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    bannerForm.setFieldsValue({
      slug: banner.slug,
      image: banner.image,
    });
    setIsBannerModalVisible(true);
  };

  // Xử lý xóa banner với xác nhận
  const handleDeleteBanner = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content:
        "Bạn có chắc chắn muốn xóa banner này? Tất cả các bản dịch của banner này cũng sẽ bị xóa.",
      onOk: async () => {
        try {
          await deleteBanner(locale, id);
          setBanners(banners.filter((banner) => banner.id !== id));
          message.success("Xóa banner thành công");

          if (selectedBanner?.id === id) {
            setShowTranslations(false);
            setSelectedBanner(null);
          }
        } catch (error) {
          console.error("Error deleting banner:", error);
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
          message.error(`Không thể xóa banner: ${error.message}`);
        }
      },
    });
  };

  // Xử lý quản lý translations
  const handleManageTranslations = (banner) => {
    setSelectedBanner(banner);
    setShowTranslations(true);
    loadBannerTranslations(banner.id);
  };

  // Xử lý thêm translation mới
  const handleAddTranslation = () => {
    setEditingTranslation(null);
    translationForm.setFieldsValue({
      language: undefined,
      title: "",
      description: "",
      metaDescription: "",
      keywords: "",
      buttonText: "",
      buttonLink: "",
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
          await deleteBannerTranslation(
            locale,
            selectedBanner.id,
            translationLanguage
          );
          setTranslations(
            translations.filter((t) => t.language !== translationLanguage)
          );
          message.success("Xóa bản dịch thành công");
          if (selectedBanner?.id) {
            await loadBannerTranslations(selectedBanner.id);
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

  // Xử lý lưu banner (thêm hoặc cập nhật)
  const handleBannerModalOk = async () => {
    try {
      const values = await bannerForm.validateFields();
      if (!values.image) {
        throw new Error("Đường dẫn ảnh là bắt buộc");
      }

      setLoading(true);

      let bannerData = {
        slug: values.slug,
        image: values.image,
        translations: [],
      };

      if (editingBanner) {
        // Lấy các bản dịch hiện có của banner đang chỉnh sửa
        const existingTranslations = await fetchBannerTranslations(
          locale,
          editingBanner.id
        );
        bannerData = {
          ...bannerData,
          translations: existingTranslations || [], // Giữ lại các bản dịch hiện có
        };

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
      setIsBannerModalVisible(false);
      bannerForm.resetFields();
    } catch (error) {
      console.error("Lỗi khi lưu banner:", error);
      const errorMessage = error.message;
      try {
        const errorData = JSON.parse(errorMessage);
        if (errorData.statusCode === 401) {
          handleUnauthorized();
          return;
        }
      } catch (parseError) {
        console.error("Lỗi phân tích thông báo lỗi:", parseError);
      }
      message.error(`Lưu banner thất bại: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý lưu translation (thêm hoặc cập nhật)
  const handleTranslationModalOk = async () => {
    try {
      const values = await translationForm.validateFields();
      if (!values.language) {
        // Không cần throw error, form validation sẽ xử lý
        message.error("Language is required");
        return;
      }

      setTranslationsLoading(true);

      const keywordValue = values.keywords;
      const keywordArray = Array.isArray(keywordValue)
        ? keywordValue
        : typeof keywordValue === "string"
        ? keywordValue
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
        : [];

      const translationData = {
        language: values.language,
        title: values.title,
        description: values.description,
        metaDescription: values.metaDescription,
        keywords: keywordArray,
        buttonText: values.buttonText,
        buttonLink: values.buttonLink,
      };

      console.log("Translation data:", translationData);

      const updatedBanner = editingTranslation
        ? await updateBannerTranslation(
            locale,
            selectedBanner.id,
            translationData
          )
        : await createBannerTranslation(
            locale,
            selectedBanner.id,
            translationData
          );

      console.log("Updated banner response:", updatedBanner);

      if (!Array.isArray(updatedBanner.translations)) {
        console.warn(
          "Response translations is not an array:",
          updatedBanner.translations
        );
        throw new Error("Dữ liệu bản dịch từ server không hợp lệ");
      }

      setTranslations(updatedBanner.translations);

      if (selectedBanner?.id) {
        await loadBannerTranslations(selectedBanner.id);
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

      // Kiểm tra nếu error có thuộc tính response hoặc là chuỗi JSON
      if (error.response && error.response.data) {
        // Trường hợp error từ axios
        const errorData = error.response.data;
        if (errorData.statusCode === 401) {
          handleUnauthorized();
          return;
        }
        message.error(
          `Lưu bản dịch thất bại: ${errorData.message || "Unknown error"}`
        );
      } else {
        // Trường hợp error là string thông thường
        // Kiểm tra xem có phải JSON không
        try {
          // Chỉ parse khi error.message có khả năng là JSON (bắt đầu bằng '{')
          if (
            typeof error.message === "string" &&
            error.message.trim().startsWith("{")
          ) {
            const errorData = JSON.parse(error.message);
            if (errorData.statusCode === 401) {
              handleUnauthorized();
              return;
            }
            message.error(`Lưu bản dịch thất bại: ${errorData.message}`);
          } else {
            // Error message thông thường không phải JSON
            message.error(`Lưu bản dịch thất bại: ${error.message}`);
          }
        } catch (parseError) {
          // Nếu không parse được, hiển thị message nguyên bản
          message.error(`Lưu bản dịch thất bại: ${error.message}`);
        }
      }
    } finally {
      setTranslationsLoading(false);
    }
  };

  // Xử lý quay lại danh sách banner
  const handleBackToBanners = () => {
    setShowTranslations(false);
    setSelectedBanner(null);
    setTranslations([]);
  };

  // Cấu hình actions cho bảng Banner
  const bannerActions = {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <>
        <Button type="link" onClick={() => handleEditBanner(record)}>
          Edit
        </Button>
        <Button
          type="link"
          danger
          onClick={() => handleDeleteBanner(record.id)}
        >
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

  const bannerColumnsWithActions = [...bannerColumns, bannerActions];

  return (
    <div className={styles.container}>
      {!showTranslations ? (
        <>
          <div className={styles.tableHeader}>
            <h2>Banners</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddBanner}
            >
              Add Banner
            </Button>
          </div>
          <DataTable
            dataSource={banners}
            columns={bannerColumnsWithActions}
            rowKey="id"
            loading={loading}
          />
          <FormModal
            visible={isBannerModalVisible}
            onOk={handleBannerModalOk}
            onCancel={() => {
              setIsBannerModalVisible(false);
              bannerForm.resetFields();
            }}
            form={bannerForm}
            title={editingBanner ? "Edit Banner" : "Add Banner"}
            fields={bannerFields}
          />
        </>
      ) : (
        <>
          <div className={styles.tableHeader}>
            <div className={styles.breadcrumb}>
              <Button type="link" onClick={handleBackToBanners}>
                Banners
              </Button>
              <span> / </span>
              <span>Translations for Banner: {selectedBanner?.slug}</span>
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
