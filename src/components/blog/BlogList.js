"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button, Card, Col, Row } from "antd";
import Link from "next/link";
import { fetchBlogs } from "../../lib/api";
import styles from "../../../app/[locale]/page.module.css";

export default function BlogList({ locale }) {
  const t = useTranslations();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlogs = async () => {
      setLoading(true);
      const fetchedBlogs = await fetchBlogs(locale);
      setBlogs(fetchedBlogs);
      setLoading(false);
    };
    loadBlogs();
  }, [locale]);

  return (
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
          <p>{t("loading")}</p>
        ) : blogs.length === 0 ? (
          <p>{t("noBlogsAvailable") || "No blogs available at the moment."}</p>
        ) : (
          <Row gutter={[32, 32]}>
            {blogs
              .filter((blog) => blog.translations && blog.translations.length > 0)
              .map((blog) => {
                const translation =
                  blog.translations.find((t) => t.language === locale) ||
                  blog.translations[0];
                if (!translation || !translation.title) {
    
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
  );
}