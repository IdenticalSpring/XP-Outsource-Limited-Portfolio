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
  createContact,
  deleteContact,
  fetchAllContacts,
  updateContact,
  addOrUpdateContactTranslation,
  deleteContactTranslation,
  logoutAdmin,
} from "@/src/lib/api";

const { Option } = Select;

export default function ContactManagement() {
  const locale = useLocale();
  const t = useTranslations("ContactManagement");
  const router = useRouter();
  const [contactForm] = Form.useForm();
  const [translationForm] = Form.useForm();
  const [contacts, setContacts] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const [isTranslationModalVisible, setIsTranslationModalVisible] =
    useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [editingTranslation, setEditingTranslation] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showTranslations, setShowTranslations] = useState(false);
  const [loading, setLoading] = useState(false);
  const [translationsLoading, setTranslationsLoading] = useState(false);

  // Hàm xử lý lỗi Unauthorized
  const handleUnauthorized = () => {
    logoutAdmin();
    message.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    router.push(`/${locale}/admin/login`);
  };

  // Hàm tải danh sách contact
  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllContacts(locale);
      console.log("Loaded contacts:", data);
      setContacts(data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
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
      message.error(`Không thể tải danh sách contact: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [locale, router]);

  // Tải danh sách contact khi component mount hoặc locale thay đổi
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Hàm tải danh sách translation của một contact
  const loadContactTranslations = useCallback(
    async (contactId) => {
      if (!contactId) return;

      setTranslationsLoading(true);
      try {
        const contact = await fetchAllContacts(locale);
        const selected = contact.find((c) => c.id === contactId);
        const translations = Array.isArray(selected?.translations)
          ? selected.translations
          : [];
        console.log(
          "Loaded translations for contact",
          contactId,
          ":",
          translations
        );
        setTranslations(translations);
      } catch (error) {
        console.error("Error fetching contact translations:", error);
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

  // Cấu hình cột cho bảng Contact
  const contactColumns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Email", dataIndex: "mail", key: "mail" },
  ];

  // Cấu hình cột cho bảng Translation
  const translationColumns = [
    { title: "Language", dataIndex: "language", key: "language" },
    { title: "Address", dataIndex: "address", key: "address" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
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

  // Cấu hình trường cho form Contact
  const contactFields = [
    {
      name: "phone",
      label: "Phone",
      rules: [{ required: true, message: "Vui lòng nhập số điện thoại" }],
    },
    {
      name: "mail",
      label: "Email",
      rules: [
        { required: true, message: "Vui lòng nhập email" },
        { type: "email", message: "Email không hợp lệ" },
      ],
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
      name: "address",
      label: "Address",
      rules: [{ required: true, message: "Vui lòng nhập địa chỉ" }],
      type: "textarea",
    },
    {
      name: "slug",
      label: "Slug",
      rules: [{ required: true, message: "Vui lòng nhập slug" }],
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
  ];

  // Xử lý thêm contact mới
  const handleAddContact = () => {
    setEditingContact(null);
    contactForm.resetFields();
    setIsContactModalVisible(true);
  };

  // Xử lý chỉnh sửa contact
  const handleEditContact = (contact) => {
    setEditingContact(contact);
    contactForm.setFieldsValue({
      phone: contact.phone,
      mail: contact.mail,
    });
    setIsContactModalVisible(true);
  };

  // Xử lý xóa contact với xác nhận
  const handleDeleteContact = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content:
        "Bạn có chắc chắn muốn xóa contact này? Tất cả các bản dịch của contact này cũng sẽ bị xóa.",
      onOk: async () => {
        try {
          await deleteContact(locale, id);
          setContacts(contacts.filter((contact) => contact.id !== id));
          message.success("Xóa contact thành công");

          if (selectedContact?.id === id) {
            setShowTranslations(false);
            setSelectedContact(null);
          }
        } catch (error) {
          console.error("Error deleting contact:", error);
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
          message.error(`Không thể xóa contact: ${error.message}`);
        }
      },
    });
  };

  // Xử lý quản lý translations
  const handleManageTranslations = (contact) => {
    setSelectedContact(contact);
    setShowTranslations(true);
    loadContactTranslations(contact.id);
  };

  // Xử lý thêm translation mới
  const handleAddTranslation = () => {
    setEditingTranslation(null);
    translationForm.setFieldsValue({
      language: undefined,
      address: "",
      slug: "",
      metaDescription: "",
      keywords: "",
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
          await deleteContactTranslation(
            locale,
            selectedContact.id,
            translationLanguage
          );
          setTranslations(
            translations.filter((t) => t.language !== translationLanguage)
          );
          message.success("Xóa bản dịch thành công");
          if (selectedContact?.id) {
            await loadContactTranslations(selectedContact.id);
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

  // Xử lý lưu contact (thêm hoặc cập nhật)
  const handleContactModalOk = async () => {
    try {
      const values = await contactForm.validateFields();
      setLoading(true);

      const contactData = {
        phone: values.phone,
        mail: values.mail,
        translations: [],
      };

      if (editingContact) {
        const updatedContact = await updateContact(
          locale,
          editingContact.id,
          contactData
        );
        setContacts(
          contacts.map((contact) =>
            contact.id === editingContact.id ? updatedContact : contact
          )
        );
        message.success("Cập nhật contact thành công");
      } else {
        const newContact = await createContact(locale, contactData);
        setContacts([...contacts, newContact]);
        message.success("Thêm contact thành công");
      }
      setIsContactModalVisible(false);
      contactForm.resetFields();
    } catch (error) {
      console.error("Error saving contact:", error);
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
      message.error(`Lưu contact thất bại: ${error.message}`);
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
        address: values.address,
        slug: values.slug,
        metaDescription: values.metaDescription,
        keywords: keywordArray,
      };

      console.log("Translation data:", translationData);

      const updatedContact = await addOrUpdateContactTranslation(
        locale,
        selectedContact.id,
        translationData
      );

      console.log("Updated contact response:", updatedContact);

      if (!Array.isArray(updatedContact.translations)) {
        console.warn(
          "Response translations is not an array:",
          updatedContact.translations
        );
        throw new Error("Dữ liệu bản dịch từ server không hợp lệ");
      }

      setTranslations(updatedContact.translations);

      if (selectedContact?.id) {
        await loadContactTranslations(selectedContact.id);
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

  // Xử lý quay lại danh sách contact
  const handleBackToContacts = () => {
    setShowTranslations(false);
    setSelectedContact(null);
    setTranslations([]);
  };

  // Cấu hình actions cho bảng Contact
  const contactActions = {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <>
        <Button type="link" onClick={() => handleEditContact(record)}>
          Edit
        </Button>
        <Button
          type="link"
          danger
          onClick={() => handleDeleteContact(record.id)}
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

  const contactColumnsWithActions = [...contactColumns, contactActions];

  return (
    <div className={styles.container}>
      {!showTranslations ? (
        <>
          <div className={styles.tableHeader}>
            <h2>Contacts</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddContact}
            >
              Add Contact
            </Button>
          </div>
          <DataTable
            dataSource={contacts}
            columns={contactColumnsWithActions}
            rowKey="id"
            loading={loading}
          />
          <FormModal
            visible={isContactModalVisible}
            onOk={handleContactModalOk}
            onCancel={() => {
              setIsContactModalVisible(false);
              contactForm.resetFields();
            }}
            form={contactForm}
            title={editingContact ? "Edit Contact" : "Add Contact"}
            fields={contactFields}
          />
        </>
      ) : (
        <>
          <div className={styles.tableHeader}>
            <div className={styles.breadcrumb}>
              <Button type="link" onClick={handleBackToContacts}>
                Contacts
              </Button>
              <span> / </span>
              <span>Translations for Contact: {selectedContact?.mail}</span>
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
