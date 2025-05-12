// app/[locale]/page.js
"use client";
import { Button, Col, Row } from "antd";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  FaLaptopCode,
  FaDatabase,
  FaProjectDiagram,
} from "react-icons/fa";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import BannerCarousel from "../../src/components/Banner";
import BlogList from "../../src/components/blog/BlogList";
import Link from "next/link";
import { about } from "../../src/data/data";
import styles from "./page.module.css";

export default function Home() {
  const { locale } = useParams();
  const t = useTranslations();

  const techPartners = [
    { name: "Microsoft", logo: "/images/microsoft.png" },
    { name: "Google", logo: "/images/google.png" },
    { name: "Amazon", logo: "/images/amazon.png" },
    { name: "IBM", logo: "/images/ibm.png" },
    { name: "Oracle", logo: "/images/oracle.png" },
  ];

  const achievements = [
    { number: "500+", text: "Successful Projects" },
    { number: "50+", text: "Global Clients" },
    { number: "10+", text: "Years Experience" },
    { number: "100+", text: "Expert Developers" },
  ];

  return (
    <div className={styles.container}>
      <Header />
      <BannerCarousel locale={locale} />
      <BlogList locale={locale} />
      
      {/* Các section còn lại giữ nguyên */}
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
                <h2>{t("aboutTitle") || "About XP OutSource"}</h2>
                <p className={styles.aboutDescription}>{about.mission}</p>
                <div className={styles.aboutFeatures}>
                  <div className={styles.featureItem}>
                    <div className={styles.featureIcon}>
                      <FaLaptopCode />
                    </div>
                    <div>
                      <h4>{t("expertTeamTitle") || "Expert Team"}</h4>
                      <p>
                        {t("expertTeamDescription") ||
                          "Skilled developers with cutting-edge expertise"}
                      </p>
                    </div>
                  </div>
                  <div className={styles.featureItem}>
                    <div className={styles.featureIcon}>
                      <FaDatabase />
                    </div>
                    <div>
                      <h4>{t("advancedTechTitle") || "Advanced Technology"}</h4>
                      <p>
                        {t("advancedTechDescription") ||
                          "Using the latest technologies and frameworks"}
                      </p>
                    </div>
                  </div>
                  <div className={styles.featureItem}>
                    <div className={styles.featureIcon}>
                      <FaProjectDiagram />
                    </div>
                    <div>
                      <h4>{t("agileProcessTitle") || "Agile Process"}</h4>
                      <p>
                        {t("agileProcessDescription") ||
                          "Efficient development with transparent communication"}
                      </p>
                    </div>
                  </div>
                </div>
                <Link href="#contact">
                  <Button type="primary" className={styles.aboutButton}>
                    {t("learnMoreAboutUs") || "Learn More About Us"}
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

      <section id="partners" className={styles.partnersSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>{t("partnersTitle") || "Our Technology Partners"}</h2>
            <p>
              {t("partnersDescription") ||
                "We collaborate with industry leaders to deliver exceptional solutions"}
            </p>
          </div>
          <div className={styles.partnerLogos}>
            {techPartners.map((partner, index) => (
              <div key={index} className={styles.partnerLogo}>
                <div className={styles.logoPlaceholder}>{partner.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className={styles.ctaSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.ctaContent}>
            <h2>{t("ctaTitle") || "Ready to Transform Your Business?"}</h2>
            <p>
              {t("ctaDescription") ||
                "Contact us today to discuss your technology needs and solutions"}
            </p>
            <Link href="/contact">
              <Button type="primary" size="large" className={styles.ctaButton}>
                {t("contactUs") || "Contact Us"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}