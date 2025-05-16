"use client";
import { Col, Row, Input, Button, Divider, Form, message } from "antd";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { fetchContact, fetchBlogs, sendContactEmail } from "../lib/api";
import { socialLinks, footerLinks } from "../config/footerConfig";
import styles from "./Footer.module.css";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaArrowRight } from "react-icons/fa";

export default function Footer() {
  const { locale } = useParams();
  const pathname = usePathname();
  const t = useTranslations();
  const [contact, setContact] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [contactData, blogsData] = await Promise.all([
          fetchContact(locale, "main-contact"),
          fetchBlogs(locale, 1, 5),
        ]);
        setContact(contactData);
        setBlogs(blogsData.data || []);
        setIsLoading(false);
      } catch (error) {
        console.warn(`Failed to load footer data: ${error.message}`);
        setBlogs([]);
        setIsLoading(false);
      }
    };
    loadData();
  }, [locale]);

  const getTranslation = () => {
    if (!contact || !contact.translations) {
      return { address: "N/A", metaDescription: "", keywords: [] };
    }
    const translation = contact.translations.find((t) => t.language === locale) || contact.translations[0];
    return translation || { address: "N/A", metaDescription: "", keywords: [] };
  };

  const translation = getTranslation();
  const getLinkProps = (section) => {
    const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;
    if (isHomePage) {
      return {
        href: `#${section}`,
        onClick: (e) => {
          e.preventDefault();
          const element = document.getElementById(section);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        },
      };
    }
    return { href: `/${locale}#${section}` };
  };

  const getBlogTranslation = (blog) =>
    blog.translations?.find((t) => t.language === locale) || {};

  const companyLinks = footerLinks.company.map(item => ({
    href: `#${item.section}`,
    label: t(item.translationKey),
    section: item.section
  }));

  const onFinish = async (values) => {
    try {
      await sendContactEmail(locale, {
        email: values.email,
        name: "Newsletter Subscriber",
        content: `User subscribed to newsletter with email: ${values.email}`,
      });
      message.success(t("newsletterSubscribed") || "Subscribed successfully!");
      form.resetFields();
    } catch (error) {
      message.error(t("newsletterFailed") || "Failed to subscribe. Please try again.");
      console.error("Error subscribing to newsletter:", error);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <Row gutter={[40, 20]} justify="start" className={styles.logoRow}>
          <Col xs={24} sm={24} md={8} lg={7}>
            <div className={styles.footerLogo}>{t("logo")}</div>
          </Col>
        </Row>
        <Row gutter={[30, 30]} justify="space-between" className={styles.columnsRow}>
          {/* Cột 1: Thông tin liên hệ */}
          <Col xs={24} sm={24} md={8} lg={7}>
            <div className={styles.footerWidget}>
              <h3 className={styles.contactTitle}>{t("addressTitle") || "Address"}</h3>
              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <FaMapMarkerAlt className={styles.contactIcon} />
                  <span>{isLoading ? t("loading") : translation.address}</span>
                </div>
                <div className={styles.contactItem}>
                  <FaPhoneAlt className={styles.contactIcon} />
                  <span>{isLoading ? t("loading") : contact?.phone || "N/A"}</span>
                </div>
                <div className={styles.contactItem}>
                  <FaEnvelope className={styles.contactIcon} />
                  <span>{isLoading ? t("loading") : contact?.mail || "N/A"}</span>
                </div>
              </div>
            </div>
          </Col>

          {/* Cột 2: Company Links */}
          <Col xs={24} sm={12} md={5} lg={5}>
            <div className={styles.footerWidget}>
              <h3 className={styles.widgetTitle}>{t("companyTitle")}</h3>
              <ul className={styles.footerLinks}>
                {companyLinks.map((link) => (
                  <li key={link.section}>
                    <Link {...getLinkProps(link.section)}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Col>

          {/* Cột 3: Recent Blogs */}
          <Col xs={24} sm={12} md={5} lg={5}>
            <div className={styles.footerWidget}>
              <h3 className={styles.widgetTitle}>{t("blogSectionTitle")}</h3>
              <ul className={styles.footerLinks}>
                {isLoading ? (
                  <li>{t("loading")}</li>
                ) : blogs.length > 0 ? (
                  blogs.slice(0, 3).map((blog) => {
                    const translation = getBlogTranslation(blog);
                    return (
                      <li key={blog.slug}>
                        <Link href={`/${locale}/blog/${blog.slug}`}>
                          {translation.title || blog.slug}
                        </Link>
                      </li>
                    );
                  })
                ) : (
                  <li>{t("noBlogsFound")}</li>
                )}
              </ul>
            </div>
          </Col>

          {/* Cột 4: Newsletter */}
          <Col xs={24} sm={24} md={6} lg={7}>
            <div className={styles.footerWidget}>
              <h3 className={styles.widgetTitle}>{t("newsletterTitle")}</h3>
              <p className={styles.newsletterDesc}>
                {t("newsletterDescription")}
              </p>
              <Form
                form={form}
                name="newsletter"
                onFinish={onFinish}
                className={styles.subscribeForm}
              >
                <Form.Item
                  name="email"
                  rules={[
                    {
                      required: true,
                      type: "email",
                      message: t("emailInvalid") || "Please enter a valid email",
                    },
                  ]}
                >
                  <Input
                    placeholder={t("emailPlaceholder")}
                    className={styles.subscribeInput}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className={styles.subscribeBtn}
                  >
                    <FaArrowRight />
                  </Button>
                </Form.Item>
              </Form>
              <div className={styles.socialLinks}>
                {socialLinks.slice(0, 4).map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      aria-label={social.name}
                    >
                      <Icon />
                    </a>
                  );
                })}
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Divider className={styles.footerDivider} />

      <div className={styles.footerBottom}>
        <div className={styles.copyright}>
          <p>© 2025 {t("logo")}. All rights reserved.</p>
        </div>
        <div className={styles.footerNav}>
          {footerLinks.legalLinks.map((link) => (
            <Link key={link.key} href={`/${locale}/${link.path}`}>
              {t(link.translationKey)}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}