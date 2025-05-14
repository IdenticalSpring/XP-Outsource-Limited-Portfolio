// src/pages/index.js
"use client";
import { Button, Col, Row } from "antd";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FaLaptopCode, FaDatabase, FaProjectDiagram } from "react-icons/fa";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import BannerCarousel from "../../src/components/Banner";
import BlogList from "../../src/components/blog/BlogList";
import MemberList from "../../src/components/member/MemberList";
import Link from "next/link";
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { fetchBanners } from "../../src/lib/api";
import { SLUGS_CONFIG } from "../../src/config/slugs";

export default function Home() {
  const { locale } = useParams();
  const t = useTranslations();
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBanners = async () => {
      setIsLoading(true);
      const fetchedBanners = await fetchBanners(locale);
      setBanners(fetchedBanners);
      setIsLoading(false);
    };
    loadBanners();
  }, [locale]);

  const mainBanners = banners.filter(
    (banner) => !SLUGS_CONFIG.banners.find((b) => b.slug === banner.slug && !b.isMainBanner),
  );
  const contactBanner = banners.find(
    (banner) => banner.slug === SLUGS_CONFIG.banners.find((b) => b.key === "contactCtaBanner").slug,
  );

  const achievements = [
    { number: "500+", text: t("achievements.projects") },
    { number: "50+", text: t("achievements.clients") },
    { number: "10+", text: t("achievements.experience") },
    { number: "100+", text: t("achievements.developers") },
  ];

  const getTranslation = (banner) => {
    if (!banner || !banner.translations || banner.translations.length === 0) {
      console.warn("Invalid banner or translations:", banner);
      return {
        title: t("errorNoTranslation"),
        description: t("checkBannerData"),
        buttonText: t("contactUs"),
        buttonLink: `/${locale}/contact`,
      };
    }
    const translation =
      banner.translations.find((t) => t.language === locale) ||
      banner.translations[0];
    console.log("Selected translation for locale", locale, ":", translation);
    return translation;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const url = `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
    console.log("Generated image URL:", url);
    return url;
  };

  return (
    <div className={styles.container}>
      <Header />
      <BannerCarousel locale={locale} banners={mainBanners} isLoading={isLoading} />
      <BlogList locale={locale} />
     

      <section id="about" className={styles.aboutSection}>
        <div className={styles.sectionContainer}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12}>
              <div className={styles.aboutImage}>
                <div className={styles.placeholderImage}></div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className={styles.aboutContent}>
                <h2>{t("aboutTitle")}</h2>
                <p className={styles.aboutDescription}>{t("aboutMission")}</p>
                <div className={styles.aboutFeatures}>
                  <div className={styles.featureItem}>
                    <div className={styles.featureIcon}>
                      <FaLaptopCode />
                    </div>
                    <div>
                      <h4>{t("expertTeamTitle")}</h4>
                      <p>{t("expertTeamDescription")}</p>
                    </div>
                  </div>
                  <div className={styles.featureItem}>
                    <div className={styles.featureIcon}>
                      <FaDatabase />
                    </div>
                    <div>
                      <h4>{t("advancedTechTitle")}</h4>
                      <p>{t("advancedTechDescription")}</p>
                    </div>
                  </div>
                  <div className={styles.featureItem}>
                    <div className={styles.featureIcon}>
                      <FaProjectDiagram />
                    </div>
                    <div>
                      <h4>{t("agileProcessTitle")}</h4>
                      <p>{t("agileProcessDescription")}</p>
                    </div>
                  </div>
                </div>
                <Link href="#contact">
                  <Button type="primary" className={styles.aboutButton}>
                    {t("learnMoreAboutUs")}
                  </Button>
                </Link>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      <section id="achievements" className={styles.achievementsSection}>
        <div className={styles.sectionContainer}>
          <Row gutter={[24, 24]}>
            {achievements.map((item, index) => (
              <Col xs={12} md={6} key={index}>
                <div className={styles.achievementItem}>
                  <h3>{item.number}</h3>
                  <p>{item.text}</p>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>
      <MemberList locale={locale} />
      <section id="contact" className={styles.ctaSection}>
        {contactBanner && !isLoading && (
          <div
            className={styles.ctaBackground}
            style={{
              backgroundImage: `url(${getImageUrl(contactBanner.image)})`,
            }}
          />
        )}
        <div className={styles.sectionContainer}>
          <div className={styles.ctaContent}>
            {isLoading ? (
              <div>
                <h2>{t("loading")}</h2>
                <p>{t("loading")}</p>
              </div>
            ) : contactBanner ? (
              (() => {
                const translation = getTranslation(contactBanner);
                return (
                  <>
                    <h2>{translation.title}</h2>
                    <p>{translation.description}</p>
                    <Link href={translation.buttonLink}>
                      <Button
                        type="primary"
                        size="large"
                        className={styles.ctaButton}
                      >
                        {translation.buttonText}
                      </Button>
                    </Link>
                  </>
                );
              })()
            ) : (
              <div>
                <h2>{t("errorBannerNotFound")}</h2>
                <p>{t("checkBannerData")}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}