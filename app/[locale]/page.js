"use client";

import { Button, Col, Row, Skeleton, Spin } from "antd";
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
import { fetchBanners, incrementStatistics } from "../../src/lib/api";
import { SLUGS_CONFIG } from "../../src/config/slugs";

export default function Home() {
  const { locale } = useParams();
  const t = useTranslations();
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    // Kiểm tra xem spinner đã hiển thị trong session này chưa
    const hasShownSpinner = sessionStorage.getItem("hasShownSpinner");

    if (!hasShownSpinner) {
      setShowSpinner(true);
      setInitialLoading(true);

      const timer = setTimeout(() => {
        setInitialLoading(false);
        sessionStorage.setItem("hasShownSpinner", "true");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Gọi API để tăng số liệu thống kê
        await incrementStatistics(locale);

        // Tải dữ liệu banners
        const fetchedBanners = await fetchBanners(locale);
        setBanners(fetchedBanners);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [locale]);

  const mainBanners = banners.filter(
    (banner) => !SLUGS_CONFIG.banners.find((b) => b.slug === banner.slug && !b.isMainBanner)
  );
  const contactBanner = banners.find(
    (banner) => banner.slug === SLUGS_CONFIG.banners.find((b) => b.key === "contactCtaBanner").slug
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
      banner.translations.find((t) => t.language === locale) || banner.translations[0];
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

  if (initialLoading && showSpinner) {
    return (
      <div className={styles.spinnerContainer}>
        <Spin size="large" />
      </div>
    );
  }

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
                {isLoading ? (
                  <Skeleton.Image
                    style={{
                      width: "100%",
                      height: 400,
                      borderRadius: 8,
                      background: "#f0f0f0",
                    }}
                    active
                  />
                ) : (
                  <img
                    src="/images/about-us.jpg"
                    alt={t("aboutImageAlt") || "About Us"}
                    style={{ width: "100%", height: 400, objectFit: "cover", borderRadius: 8 }}
                    onError={(e) => {
                      e.target.src = "/images/fallback-about.jpg";
                    }}
                  />
                )}
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
              <>
                <Skeleton.Input style={{ width: 220, height: 48, margin: "16px 0" }} active />
                <Skeleton paragraph={{ rows: 2 }} active />
                <Skeleton.Button style={{ width: 160, height: 40, marginTop: 16 }} active />
              </>
            ) : contactBanner ? (
              (() => {
                const translation = getTranslation(contactBanner);
                return (
                  <>
                    <h2>{translation.title}</h2>
                    <p>{translation.description}</p>
                    <Link href={translation.buttonLink}>
                      <Button type="primary" size="large" className={styles.ctaButton}>
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