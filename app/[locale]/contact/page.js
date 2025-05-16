"use client";
import { Button, Form, Input, message } from "antd";
import Header from "../../../src/components/Header";
import Footer from "../../../src/components/Footer";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { fetchContact, sendContactEmail } from "../../../src/lib/api";
import { SLUGS_CONFIG } from "../../../src/config/slugs";
import styles from "./page.module.css";

export default function Contact() {
  const { locale } = useParams();
  const t = useTranslations();
  const [contacts, setContacts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    const loadContacts = async () => {
      setIsLoading(true);
      const contactPromises = SLUGS_CONFIG.contacts.map((config) =>
        fetchContact(locale, config.slug)
          .then((data) => ({ key: config.key, data }))
          .catch((error) => {
            console.warn(`Failed to fetch contact ${config.slug}: ${error.message}`);
            return { key: config.key, data: null };
          }),
      );
      const results = await Promise.all(contactPromises);
      const contactsData = results.reduce((acc, { key, data }) => {
        if (data) acc[key] = data;
        return acc;
      }, {});
      setContacts(contactsData);
      setIsLoading(false);
    };
    loadContacts();
  }, [locale]);

  const getTranslation = (contact) => {
    if (!contact || !contact.translations) {
      return { address: t("notAvailable"), metaDescription: "", keywords: [] };
    }
    const translation = contact.translations.find((t) => t.language === locale) || contact.translations[0];
    return translation || { address: t("notAvailable"), metaDescription: "", keywords: [] };
  };

  const onFinish = async (values) => {
    try {
      await sendContactEmail(locale, {
        email: values.email,
        name: values.name,
        content: values.message,
      });
      message.success(t("emailSentSuccess") || "Your message has been sent successfully!");
      form.resetFields();
    } catch (error) {
      message.error(t("emailSendFailed") || "Failed to send your message. Please try again later.");
      console.error("Error sending contact email:", error);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <section className={styles.ctaSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.ctaContent}>
            <h2>{t("contact")}</h2>
            <p>{t("ctaDescription")}</p>
            <div className={styles.contactLayout}>
              {/* Form liên hệ */}
              <div className={styles.formContainer}>
                <Form
                  form={form}
                  name="contact"
                  layout="vertical"
                  onFinish={onFinish}
                  className={styles.form}
                >
                  <Form.Item
                    label={t("nameLabel")}
                    name="name"
                    rules={[{ required: true, message: t("nameRequired") }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label={t("emailLabel")}
                    name="email"
                    rules={[
                      {
                        required: true,
                        type: "email",
                        message: t("emailInvalid"),
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label={t("messageLabel")}
                    name="message"
                    rules={[{ required: true, message: t("messageRequired") }]}
                  >
                    <Input.TextArea rows={4} />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className={styles.ctaButton}
                    >
                      {t("sendMessage")}
                    </Button>
                  </Form.Item>
                </Form>
              </div>
              {/* Thông tin liên hệ chính */}
              {contacts.mainContact && (
                <div className={styles.contactInfo}>
                  <h3>{t(SLUGS_CONFIG.contacts.find((c) => c.key === "mainContact").titleKey)}</h3>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>{t("addressLabel")}:</span>
                    <span>
                      {isLoading ? t("loading") : getTranslation(contacts.mainContact).address}
                    </span>
                  </div>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>{t("phoneLabel")}:</span>
                    <span>
                      {isLoading ? t("loading") : contacts.mainContact?.phone || t("notAvailable")}
                    </span>
                  </div>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>{t("emailLabel")}:</span>
                    <span>
                      {isLoading ? t("loading") : contacts.mainContact?.mail || t("notAvailable")}
                    </span>
                  </div>
                </div>
              )}
            </div>
            {/* Danh sách liên hệ phụ */}
            <div className={styles.secondaryContactsGrid}>
              <h3>{t("additionalContactsTitle")}</h3>
              <div className={styles.gridContainer}>
                {SLUGS_CONFIG.contacts.filter((config) => !config.isPrimary).map((config) =>
                  contacts[config.key] ? (
                    <div key={config.key} className={styles.secondaryContact}>
                      <h4>{t(config.titleKey)}</h4>
                      <div className={styles.contactItem}>
                        <span className={styles.contactLabel}>{t("addressLabel")}:</span>
                        <span>
                          {isLoading ? t("loading") : getTranslation(contacts[config.key]).address}
                        </span>
                      </div>
                      <div className={styles.contactItem}>
                        <span className={styles.contactLabel}>{t("phoneLabel")}:</span>
                        <span>
                          {isLoading ? t("loading") : contacts[config.key]?.phone || t("notAvailable")}
                        </span>
                      </div>
                      <div className={styles.contactItem}>
                        <span className={styles.contactLabel}>{t("emailLabel")}:</span>
                        <span>
                          {isLoading ? t("loading") : contacts[config.key]?.mail || t("notAvailable")}
                        </span>
                      </div>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}