// src/components/Footer.js
"use client";
import { Col, Row, Input, Button, Divider } from "antd";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl"; // Import useTranslations
import { fetchContact } from "../lib/api";
import styles from "./Footer.module.css";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaArrowRight,
} from "react-icons/fa";

export default function Footer() {
  const { locale } = useParams();
  const t = useTranslations(); // Khởi tạo hook để lấy bản dịch
  const [contact, setContact] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContact = async () => {
      setIsLoading(true);
      const contactData = await fetchContact(locale, "main-contact");
      setContact(contactData);
      setIsLoading(false);
    };
    loadContact();
  }, [locale]);

  const getTranslation = () => {
    if (!contact || !contact.translations) {
      return { address: "N/A", metaDescription: "", keywords: [] };
    }
    const translation = contact.translations.find((t) => t.language === locale) || contact.translations[0];
    return translation || { address: "N/A", metaDescription: "", keywords: [] };
  };

  const translation = getTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <Row gutter={[48, 48]} justify="space-between">
          <Col xs={24} sm={24} md={8} lg={7}>
            <div className={styles.footerWidget}>
              <div className={styles.footerLogo}>{t("logo")}</div> 
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

          <Col xs={24} sm={12} md={5} lg={4}>
            <div className={styles.footerWidget}>
              <h3 className={styles.widgetTitle}>{t("companyTitle") || "Company"}</h3> 
              <ul className={styles.footerLinks}>
                <li>
                  <Link href="/about">{t("about")}</Link>
                </li>
                <li>
                  <Link href="/team">{t("teamTitle") || "Our Team"}</Link>
                </li>
                <li>
                  <Link href="/careers">{t("careersTitle") || "Careers"}</Link>
                </li>
                <li>
                  <Link href="/news">{t("newsTitle") || "News"}</Link>
                </li>
                <li>
                  <Link href="/contact">{t("contact")}</Link>
                </li>
              </ul>
            </div>
          </Col>

          <Col xs={24} sm={12} md={5} lg={4}>
            <div className={styles.footerWidget}>
              <h3 className={styles.widgetTitle}>{t("servicesSectionTitle")}</h3>
              <ul className={styles.footerLinks}>
                <li>
                  <Link href="/services/web">{t("webDevelopmentTitle") || "Web Development"}</Link>
                </li>
                <li>
                  <Link href="/services/mobile">{t("mobileDevelopmentTitle") || "Mobile App Development"}</Link>
                </li>
                <li>
                  <Link href="/services/cloud">{t("cloudSolutionsTitle") || "Cloud Solutions"}</Link>
                </li>
                <li>
                  <Link href="/services/consulting">{t("itConsultingTitle") || "IT Consulting"}</Link>
                </li>
                <li>
                  <Link href="/services/support">{t("techSupportTitle") || "Tech Support"}</Link>
                </li>
              </ul>
            </div>
          </Col>

          <Col xs={24} sm={24} md={6} lg={7}>
            <div className={styles.footerWidget}>
              <h3 className={styles.widgetTitle}>{t("newsletterTitle") || "Newsletter"}</h3>
              <p className={styles.newsletterDesc}>
                {t("newsletterDescription") || "Subscribe to our newsletter for the latest updates and insights"}
              </p>
              <div className={styles.subscribeForm}>
                <Input
                  placeholder={t("emailPlaceholder") || "Your email address"}
                  className={styles.subscribeInput}
                />
                <Button type="primary" className={styles.subscribeBtn}>
                  <FaArrowRight />
                </Button>
              </div>
              <div className={styles.socialLinks}>
                <a href="https://facebook.com" className={styles.socialLink}>
                  <FaFacebookF />
                </a>
                <a href="https://twitter.com" className={styles.socialLink}>
                  <FaTwitter />
                </a>
                <a href="https://linkedin.com" className={styles.socialLink}>
                  <FaLinkedinIn />
                </a>
                <a href="https://youtube.com" className={styles.socialLink}>
                  <FaYoutube />
                </a>
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
          <Link href="/privacy-policy">{t("privacyPolicyTitle") || "Privacy Policy"}</Link>
          <Link href="/terms-of-service">{t("termsOfServiceTitle") || "Terms of Service"}</Link>
          <Link href="/sitemap">{t("sitemapTitle") || "Sitemap"}</Link>
        </div>
      </div>
    </footer>
  );
}