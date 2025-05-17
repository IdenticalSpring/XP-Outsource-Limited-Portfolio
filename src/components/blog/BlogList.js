// src/components/blog/BlogList.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button, Card, Col, Row, Skeleton } from "antd"; // <== Dùng Skeleton thay vì Spin
import Link from "next/link";
import { fetchBlogs } from "../../lib/api";
import styles from "./BlogList.module.css";

export default function BlogList({ locale }) {
  const t = useTranslations();
  const [blogs, setBlogs] = useState([]);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchBlogs(locale, currentPage, pageSize);
      setBlogs(response.data || []);
      setTotalBlogs(response.total || 0);
    } catch (error) {
      setError(t("loadError") || "Failed to load blogs. Please try again later.");
      setBlogs([]);
      setTotalBlogs(0);
    } finally {
      setLoading(false);
    }
  }, [locale, currentPage, t]);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return `${baseUrl}${imagePath}`;
  };

  const scrollToBlogSection = () => {
    const blogSection = document.getElementById("blog");
    if (blogSection) {
      const headerHeight = document.querySelector(".header")?.offsetHeight || 0;
      const elementPosition = blogSection.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - headerHeight,
        behavior: "smooth",
      });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      scrollToBlogSection();
    }
  };

  const renderPagination = () => {
    if (totalBlogs <= pageSize) return null;
    const maxVisiblePages = 5;
    const totalPages = Math.ceil(totalBlogs / pageSize);
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className={styles.pagination}>
        <Button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className={`${styles.paginationButton} ${styles.arrowButton}`}
        >
          &lt;
        </Button>
        {startPage > 1 && (
          <>
            <Button onClick={() => handlePageChange(1)} className={styles.paginationButton}>1</Button>
            {startPage > 2 && <span className={styles.ellipsis}>...</span>}
          </>
        )}
        {pageNumbers.map((page) => (
          <Button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`${styles.paginationButton} ${currentPage === page ? styles.active : ""}`}
          >
            {page}
          </Button>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className={styles.ellipsis}>...</span>}
            <Button onClick={() => handlePageChange(totalPages)} className={styles.paginationButton}>{totalPages}</Button>
          </>
        )}
        <Button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className={`${styles.paginationButton} ${styles.arrowButton}`}
        >
          &gt;
        </Button>
      </div>
    );
  };

  const totalPages = Math.ceil(totalBlogs / pageSize);

  return (
    <section id="blog" className={styles.servicesSection}>
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h2>{t("blogSectionTitle") || "Our Blogs"}</h2>
          <p>
            {t("blogSectionDescription") ||
              "Discover our latest insights and updates on technology and innovation"}
          </p>
        </div>
        {loading ? (
          <Row gutter={[32, 32]}>
            {[...Array(pageSize)].map((_, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card className={styles.serviceCard} variant="borderless">
                  <Skeleton.Image
                    style={{
                      width: "100%",
                      height: 200,
                      borderRadius: 8,
                      marginBottom: 16,
                      background: "#f0f0f0",
                    }}
                    active
                  />
                  <Skeleton
                    active
                    title={{ width: "80%" }}
                    paragraph={{ rows: 2, width: ["90%", "70%"] }}
                    style={{ padding: "0 16px" }}
                  />
                  <Skeleton.Button
                    active
                    style={{
                      width: 120,
                      height: 32,
                      borderRadius: 4,
                      marginTop: 12,
                      marginLeft: 16,
                    }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : blogs.length === 0 ? (
          <p>{t("noBlogsAvailable") || "No blogs available at the moment."}</p>
        ) : (
          <>
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
                              src={getImageUrl(blog.image)}
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
            {renderPagination()}
          </>
        )}
      </div>
    </section>
  );
}
