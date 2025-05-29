"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button, message, Form, Modal, Select, Input, Switch } from "antd";
import { PlusOutlined, TranslationOutlined } from "@ant-design/icons";
import styles from "./BannerManagement.module.css";
import DataTable from "./Datatable";
import FormModal from "./FormModal";
import {
  createMember,
  deleteMember,
  fetchMembers,
  updateMember,
  addOrUpdateMemberTranslation,
  deleteMemberTranslation,
  fetchMemberSitemap,
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

export default function MemberManagement() {
  const locale = useLocale();
  const t = useTranslations("MemberManagement");
  const router = useRouter();
  const [memberForm] = Form.useForm();
  const [translationForm] = Form.useForm();
  const [members, setMembers] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [isMemberModalVisible, setIsMemberModalVisible] = useState(false);
  const [isTranslationModalVisible, setIsTranslationModalVisible] =
    useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editingTranslation, setEditingTranslation] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showTranslations, setShowTranslations] = useState(false);
  const [loading, setLoading] = useState(false);
  const [translationsLoading, setTranslationsLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 6, total: 0 });
  const [sitemapUrls, setSitemapUrls] = useState([]);

  // Hàm xử lý lỗi Unauthorized
  const handleUnauthorized = () => {
    logoutAdmin();
    message.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    router.push(`/${locale}/admin/login`);
  };

  // Hàm tải danh sách member
  const loadMembers = useCallback(
    async (page = 1, limit = 6) => {
      setLoading(true);
      try {
        const response = await fetchMembers(locale, page, limit);
        console.log("Loaded members:", response);
        setMembers(response.data);
        setPagination({ page, limit, total: response.total });
      } catch (error) {
        const { isUnauthorized, message: errorMessage } = handleErrorResponse(
          error,
          "Không thể tải danh sách member"
        );

        if (isUnauthorized) {
          handleUnauthorized();
        } else {
          message.error(`Không thể tải danh sách member: ${errorMessage}`);
        }
      } finally {
        setLoading(false);
      }
    },
    [locale, router]
  );

  // Tải danh sách member khi component mount hoặc locale thay đổi
  useEffect(() => {
    loadMembers(pagination.page, pagination.limit);
  }, [loadMembers, pagination.page, pagination.limit]);

  // Hàm tải danh sách translation của một member
  const loadMemberTranslations = useCallback(
    async (memberId) => {
      if (!memberId) return;

      setTranslationsLoading(true);
      try {
        const response = await fetchMembers(locale, 1, pagination.limit);
        const selected = response.data.find((m) => m.id === memberId);
        const translations = Array.isArray(selected?.translations)
          ? selected.translations
          : [];
        console.log(
          "Loaded translations for member",
          memberId,
          ":",
          translations
        );
        setTranslations(translations);
      } catch (error) {
        const { isUnauthorized, message: errorMessage } = handleErrorResponse(
          error,
          "Không thể tải danh sách bản dịch"
        );

        if (isUnauthorized) {
          handleUnauthorized();
        } else {
          message.error(`Không thể tải danh sách bản dịch: ${errorMessage}`);
        }
        setTranslations([]);
      } finally {
        setTranslationsLoading(false);
      }
    },
    [locale, pagination.limit, router]
  );

  // Hàm tải sitemap
  const loadSitemap = useCallback(async () => {
    try {
      const data = await fetchMemberSitemap(locale, locale);
      console.log("Loaded sitemap:", data);
      setSitemapUrls(data.urls || []);
    } catch (error) {
      console.error("Error fetching sitemap:", error);
      message.error(`Không thể tải sitemap: ${error.message}`);
    }
  }, [locale]);

  // Tải sitemap khi component mount
  useEffect(() => {
    loadSitemap();
  }, [loadSitemap]);

  // Cấu hình cột cho bảng Member
  const memberColumns = [
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
            alt="Member"
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
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (isActive ? "Yes" : "No"),
    },
    {
      title: "Core",
      dataIndex: "core",
      key: "core",
      render: (core) => (core ? "Yes" : "No"),
    },
  ];

  // Cấu hình cột cho bảng Translation
  const translationColumns = [
    { title: "Language", dataIndex: "language", key: "language" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Meta Title", dataIndex: "metaTitle", key: "metaTitle" },
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
                keywords: record.keywords.join(", "),
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

  // Cấu hình trường cho form Member
  const memberFields = [
    {
      name: "image",
      label: "Image",
      rules: [{ required: true, message: "Vui lòng nhập đường dẫn ảnh" }],
      placeholder: "Nhập đường dẫn ảnh (ví dụ: /images/member.jpg)",
    },
    {
      name: "slug",
      label: "Slug",
      rules: [{ required: true, message: "Vui lòng nhập slug" }],
    },
    {
      name: "isActive",
      label: "Active",
      type: "switch",
      valuePropName: "checked",
      initialValue: true,
    },
    {
      name: "core",
      label: "Core Member",
      type: "switch",
      valuePropName: "checked",
      initialValue: false,
    },
    {
      name: "canonicalUrl",
      label: "Canonical URL",
      rules: [{ type: "url", message: "URL không hợp lệ", required: false }],
      placeholder: "Nhập URL chính thức (tùy chọn)",
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
      name: "name",
      label: "Name",
      rules: [{ required: true, message: "Vui lòng nhập tên" }],
    },
    {
      name: "metaTitle",
      label: "Meta Title",
      rules: [{ required: true, message: "Vui lòng nhập meta title" }],
    },
    {
      name: "metaDescription",
      label: "Meta Description",
      rules: [
        { required: true, message: "Vui lòng nhập meta description" },
        { max: 160, message: "Meta description không được vượt quá 160 ký tự" },
      ],
      type: "textarea",
    },
    {
      name: "keywords",
      label: "Keywords",
      rules: [{ required: true, message: "Vui lòng nhập keywords" }],
      placeholder: "Nhập keywords, cách nhau bằng dấu phẩy",
    },
    {
      name: "description",
      label: "Description",
      rules: [{ required: true, message: "Vui lòng nhập mô tả" }],
      type: "textarea",
    },
  ];

  // Xử lý thêm member mới
  const handleAddMember = () => {
    setEditingMember(null);
    memberForm.resetFields();
    setIsMemberModalVisible(true);
  };

  // Xử lý chỉnh sửa member
  const handleEditMember = (member) => {
    setEditingMember(member);
    memberForm.setFieldsValue({
      image: member.image,
      slug: member.slug,
      isActive: member.isActive,
      core: member.core,
      canonicalUrl: member.canonicalUrl,
    });
    setIsMemberModalVisible(true);
  };

  // Xử lý xóa member với xác nhận
  const handleDeleteMember = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content:
        "Bạn có chắc chắn muốn xóa member này? Tất cả các bản dịch của member này cũng sẽ bị xóa.",
      onOk: async () => {
        try {
          await deleteMember(locale, id);
          setMembers(members.filter((member) => member.id !== id));
          message.success("Xóa member thành công");

          if (selectedMember?.id === id) {
            setShowTranslations(false);
            setSelectedMember(null);
          }
        } catch (error) {
          const { isUnauthorized, message: errorMessage } = handleErrorResponse(
            error,
            "Không thể xóa member"
          );

          if (isUnauthorized) {
            handleUnauthorized();
          } else {
            message.error(`Không thể xóa member: ${errorMessage}`);
          }
        }
      },
    });
  };

  // Xử lý quản lý translations
  const handleManageTranslations = (member) => {
    setSelectedMember(member);
    setShowTranslations(true);
    loadMemberTranslations(member.id);
  };

  // Xử lý thêm translation mới
  const handleAddTranslation = () => {
    setEditingTranslation(null);
    translationForm.setFieldsValue({
      language: undefined,
      name: "",
      metaTitle: "",
      metaDescription: "",
      keywords: "",
      description: "",
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
          await deleteMemberTranslation(
            locale,
            selectedMember.id,
            translationLanguage
          );
          setTranslations(
            translations.filter((t) => t.language !== translationLanguage)
          );
          message.success("Xóa bản dịch thành công");
          if (selectedMember?.id) {
            await loadMemberTranslations(selectedMember.id);
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

  // Xử lý lưu member (thêm hoặc cập nhật)
  const handleMemberModalOk = async () => {
    try {
      const values = await memberForm.validateFields();
      setLoading(true);

      const memberData = {
        image: values.image,
        slug: values.slug,
        isActive: values.isActive,
        core: values.core,
        canonicalUrl: values.canonicalUrl || undefined,
        translations: [],
      };

      if (editingMember) {
        const updatedMember = await updateMember(
          locale,
          editingMember.id,
          memberData
        );
        setMembers(
          members.map((member) =>
            member.id === editingMember.id ? updatedMember : member
          )
        );
        message.success("Cập nhật member thành công");
      } else {
        const newMember = await createMember(locale, memberData);
        setMembers([...members, newMember]);
        message.success("Thêm member thành công");
      }
      setIsMemberModalVisible(false);
      memberForm.resetFields();
      await loadMembers(pagination.page, pagination.limit);
    } catch (error) {
      console.error("Error saving member:", error);
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
      message.error(`Lưu member thất bại: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý lưu translation (thêm hoặc cập nhật)
  const handleTranslationModalOk = async () => {
    try {
      const values = await translationForm.validateFields();
      if (!values.language) {
        message.error("Language is required");
        return;
      }

      setTranslationsLoading(true);

      const keywordValue = values.keywords;
      const keywordArray =
        typeof keywordValue === "string"
          ? keywordValue
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean)
          : Array.isArray(keywordValue)
          ? keywordValue
          : [];

      const translationData = {
        language: values.language,
        name: values.name,
        metaTitle: values.metaTitle,
        metaDescription: values.metaDescription,
        keywords: keywordArray,
        description: values.description,
      };

      console.log("Translation data:", translationData);

      const updatedMember = await addOrUpdateMemberTranslation(
        locale,
        selectedMember.id,
        translationData
      );

      console.log("Updated member response:", updatedMember);

      if (!Array.isArray(updatedMember.translations)) {
        console.warn(
          "Response translations is not an array:",
          updatedMember.translations
        );
        throw new Error("Dữ liệu bản dịch từ server không hợp lệ");
      }

      setTranslations(updatedMember.translations);

      if (selectedMember?.id) {
        await loadMemberTranslations(selectedMember.id);
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

      const { isUnauthorized, message: errorMessage } = handleErrorResponse(
        error,
        "Lưu bản dịch thất bại"
      );

      if (isUnauthorized) {
        handleUnauthorized();
      } else {
        message.error(`Lưu bản dịch thất bại: ${errorMessage}`);
      }
    } finally {
      setTranslationsLoading(false);
    }
  };

  // Xử lý quay lại danh sách member
  const handleBackToMembers = () => {
    setShowTranslations(false);
    setSelectedMember(null);
    setTranslations([]);
  };

  // Xử lý thay đổi pagination
  const handleTableChange = (pagination) => {
    setPagination({ ...pagination, page: pagination.current });
    loadMembers(pagination.current, pagination.pageSize);
  };

  // Cấu hình actions cho bảng Member
  const memberActions = {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <>
        <Button type="link" onClick={() => handleEditMember(record)}>
          Edit
        </Button>
        <Button
          type="link"
          danger
          onClick={() => handleDeleteMember(record.id)}
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

  const memberColumnsWithActions = [...memberColumns, memberActions];

  // Thêm hàm tiện ích xử lý lỗi
  const handleErrorResponse = (error, defaultMessage) => {
    console.error("Error:", error);

    // Kiểm tra nếu error có response từ axios
    if (error.response && error.response.data) {
      const errorData = error.response.data;
      if (errorData.statusCode === 401) {
        return { isUnauthorized: true };
      }
      return { message: errorData.message || defaultMessage };
    }

    // Kiểm tra nếu error.message có thể là JSON
    if (typeof error.message === "string") {
      try {
        // Chỉ parse khi có khả năng là JSON (bắt đầu bằng '{')
        if (error.message.trim().startsWith("{")) {
          const errorData = JSON.parse(error.message);
          if (errorData.statusCode === 401) {
            return { isUnauthorized: true };
          }
          return { message: errorData.message || defaultMessage };
        }
      } catch (parseError) {
        // Lỗi không phải JSON, bỏ qua
      }
    }

    // Trả về message gốc
    return { message: error.message || defaultMessage };
  };

  return (
    <div className={styles.container}>
      {!showTranslations ? (
        <>
          <div className={styles.tableHeader}>
            <h2>Members</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddMember}
            >
              Add Member
            </Button>
          </div>
          <DataTable
            dataSource={members}
            columns={memberColumnsWithActions}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ["6", "12", "24"],
            }}
            onChange={handleTableChange}
          />
          <FormModal
            visible={isMemberModalVisible}
            onOk={handleMemberModalOk}
            onCancel={() => {
              setIsMemberModalVisible(false);
              memberForm.resetFields();
            }}
            form={memberForm}
            title={editingMember ? "Edit Member" : "Add Member"}
            fields={memberFields}
          />
          <div className={styles.sitemap}>
            <h3>Sitemap URLs</h3>
            <ul>
              {sitemapUrls.length > 0 ? (
                sitemapUrls.map((url, index) => <li key={index}>{url}</li>)
              ) : (
                <p>No sitemap URLs available</p>
              )}
            </ul>
          </div>
        </>
      ) : (
        <>
          <div className={styles.tableHeader}>
            <div className={styles.breadcrumb}>
              <Button type="link" onClick={handleBackToMembers}>
                Members
              </Button>
              <span> / </span>
              <span>Translations for Member: {selectedMember?.slug}</span>
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
