"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
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

  // Hàm tải danh sách banner
  const loadBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBanners(locale);
      console.log("Loaded banners:", data);
      setBanners(data);
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

  // Hàm tải danh sách translation của một banner
  const loadBannerTranslations = useCallback(
    async (bannerId) => {
      if (!bannerId) return;

      setTranslationsLoading(true);
      try {
        const data = await fetchBannerTranslations(locale, bannerId);
        console.log("Loaded translations:", data);

        // Kiểm tra cấu trúc dữ liệu từ API và trích xuất đúng mảng translations
        // Nếu API trả về mảng translations trực tiếp hoặc nằm trong một thuộc tính nào đó
        const translationsArray = Array.isArray(data)
          ? data
          : data.translations || [];

        // Hoặc nếu translations nằm trong banner hiện tại
        const selectedBannerWithTranslations = banners.find(
          (b) => b.id === bannerId
        );
        if (
          !translationsArray.length &&
          selectedBannerWithTranslations?.translations?.length
        ) {
          setTranslations(selectedBannerWithTranslations.translations);
        } else {
          setTranslations(translationsArray);
        }
      } catch (error) {
        console.error("Error fetching banner translations:", error);
        message.error(`Không thể tải danh sách bản dịch: ${error.message}`);

        // Fallback: thử lấy translations từ banner trong state nếu có
        const selectedBannerWithTranslations = banners.find(
          (b) => b.id === bannerId
        );
        if (selectedBannerWithTranslations?.translations?.length) {
          setTranslations(selectedBannerWithTranslations.translations);
        }
      } finally {
        setTranslationsLoading(false);
      }
    },
    [locale, banners]
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
              e.target.src = "/fallback-image.jpg"; // Hiển thị ảnh dự phòng nếu lỗi
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

          // Nếu đang hiển thị translations của banner bị xóa, quay về danh sách banner
          if (selectedBanner?.id === id) {
            setShowTranslations(false);
            setSelectedBanner(null);
          }
        } catch (error) {
          console.error("Error deleting banner:", error);
          message.error(`Không thể xóa banner: ${error.message}`);
        }
      },
    });
  };

  // Xử lý quản lý translations
  const handleManageTranslations = (banner) => {
    setSelectedBanner(banner);
    setShowTranslations(true);

    // Log thông tin banner để debug
    console.log("Selected banner for translations:", banner);

    // Kiểm tra xem banner có chứa translations không
    if (banner.translations && banner.translations.length > 0) {
      console.log(
        "Using translations from banner object:",
        banner.translations
      );
      setTranslations(banner.translations);
      setTranslationsLoading(false);
    } else {
      // Nếu không, tải từ API
      console.log("Fetching translations from API for banner ID:", banner.id);
      loadBannerTranslations(banner.id);
    }
  };

  // Xử lý thêm translation mới
  const handleAddTranslation = () => {
    setEditingTranslation(null);
    translationForm.setFieldsValue({
      language: undefined,
      title: "",
      description: "",
      metaDescription: "",
      keywords: "", // ⚠️ luôn là chuỗi
      buttonText: "",
      buttonLink: "",
    });
    setIsTranslationModalVisible(true);
  };

  // Xử lý chỉnh sửa translation
  const handleEditTranslation = (translation) => {
    setEditingTranslation(translation);

    const formData = {
      language: translation.language,
      title: translation.title,
      description: translation.description,
      metaDescription: translation.metaDescription,
      keywords: Array.isArray(translation.keywords)
        ? translation.keywords.join(", ")
        : translation.keywords || "",
      buttonText: translation.buttonText,
      buttonLink: translation.buttonLink,
    };

    translationForm.setFieldsValue(formData);
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
        } catch (error) {
          console.error("Error deleting translation:", error);
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
        throw new Error("Image path is required");
      }

      setLoading(true);

      const bannerData = {
        slug: values.slug,
        image: values.image,
        translations: [], // Thêm dòng này để tránh lỗi phía backend
      };

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
      setIsBannerModalVisible(false);
      bannerForm.resetFields();
    } catch (error) {
      console.error("Error saving banner:", error);
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
        throw new Error("Language is required");
      }

      setTranslationsLoading(true);

      const keywordValue = values.keywords;

      // Ép kiểu an toàn:
      const keywordArray = Array.isArray(keywordValue)
        ? keywordValue
        : typeof keywordValue === "string"
        ? keywordValue
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
        : [];

      const translationData = {
        ...values,
        keywords: keywordArray,
      };
      if (editingTranslation) {
        // Cập nhật translation
        const updatedTranslation = await updateBannerTranslation(
          locale,
          selectedBanner.id,
          editingTranslation.language,
          translationData
        );

        setTranslations(
          translations.map((t) =>
            t.language === editingTranslation.language ? updatedTranslation : t
          )
        );
        message.success("Cập nhật bản dịch thành công");
      } else {
        // Tạo mới translation
        const newTranslation = await createBannerTranslation(
          locale,
          selectedBanner.id,
          translationData
        );

        setTranslations([...translations, newTranslation]);
        message.success("Thêm bản dịch thành công");
      }

      setIsTranslationModalVisible(false);
      translationForm.resetFields();
    } catch (error) {
      console.error("Error saving translation:", error);
      message.error(`Lưu bản dịch thất bại: ${error.message}`);
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

  // Thêm cột actions vào bảng Banner
  const bannerColumnsWithActions = [...bannerColumns, bannerActions];

  return (
    <div className={styles.container}>
      {!showTranslations ? (
        // Hiển thị danh sách Banner
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
        // Hiển thị danh sách Translation của Banner đang chọn
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
            onEdit={handleEditTranslation}
            onDelete={(language) => handleDeleteTranslation(language)}
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
