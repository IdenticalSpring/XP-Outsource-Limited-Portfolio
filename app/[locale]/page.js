// app/[locale]/page.js
"use client";
import { Button, Card, Col, Row } from "antd";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import styles from "./page.module.css";
import {
  FaLaptopCode,
  FaDatabase,
  FaProjectDiagram,
} from "react-icons/fa";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import BannerCarousel from "../../src/components/Banner";
import Link from "next/link";
import { about } from "../../src/data/data";
import { useEffect, useState } from "react";

export default function Home() {
  const { locale } = useParams();
  const t = useTranslations();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // API endpoint từ backend
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Lấy danh sách blog từ API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/blog?page=1&limit=6`, {
          headers: {
            "Accept-Language": locale, // Gửi locale để backend lọc theo ngôn ngữ
          },
        });
        if (!response.ok) throw new Error("Failed to fetch blogs");
        const data = await response.json();
        setBlogs(data.blogs || []);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [locale]);

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

      {/* Blog Section */}
      <section id="blogs" className={styles.servicesSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>{t("blogSectionTitle") || "Our Blogs"}</h2>
            <p>
              {t("blogSectionDescription") ||
                "Discover our latest insights and updates on technology and innovation"}
            </p>
          </div>

          {loading ? (
            <p>Loading blogs...</p>
          ) : blogs.length === 0 ? (
            <p>{t("noBlogsAvailable") || "No blogs available at the moment."}</p>
          ) : (
            <Row gutter={[32, 32]}>
              {blogs
                .filter((blog) => {
                  // Lọc các blog có translations hợp lệ
                  return blog.translations && blog.translations.length > 0;
                })
                .map((blog) => {
                  const translation = blog.translations.find(
                    (t) => t.language === locale
                  ) || blog.translations[0];
                  
                  // Kiểm tra translation có hợp lệ không
                  if (!translation || !translation.title) {
                    console.warn(`Blog ${blog.id} thiếu bản dịch hợp lệ cho locale ${locale}`);
                    return null;
                  }

                  return (
                    <Col xs={24} sm={12} md={8} key={blog.id}>
                      <Card
                        className={styles.serviceCard}
                        variant="borderless"
                        cover={
                          blog.image && (
                            <img
                              src={blog.image}
                              alt={blog.altText || translation.title}
                              style={{ height: 200, objectFit: "cover" }}
                            />
                          )
                        }
                      >
                        <h3>{translation.title}</h3>
                        <p>
                          {translation.metaDescription ||
                            (translation.content
                              ? translation.content.slice(0, 100) + "..."
                              : t("noDescription") || "No description available.")}
                        </p>
                        <Link href={`/${locale}/blog/${blog.slug}`}>
                          <Button type="link" className={styles.learnMoreBtn}>
                            {t("readMore") || "Read More"}
                          </Button>
                        </Link>
                      </Card>
                    </Col>
                  );
                })}
            </Row>
          )}
        </div>
      </section>

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