// src/components/blog/BlogList.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button, Card, Col, Row, Spin } from "antd";
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
      console.log(`[Page ${currentPage}] API Response:`, response);
      if (!response.data || response.data.length === 0) {
        console.warn(`No blogs returned for page ${currentPage}`);
      }
      setBlogs(response.data || []);
      setTotalBlogs(response.total || 0);
    } catch (error) {
      console.error(`[Page ${currentPage}] Failed to load blogs:`, error);
      setError(t("loadError") || "Failed to load blogs. Please try again later.");
      setBlogs([]);
      setTotalBlogs(0);
    } finally {
      setLoading(false);
    }
  }, [locale, currentPage, t]);

  useEffect(() => {
    console.log(`[Effect] Loading blogs for page ${currentPage}`);
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
      console.log(`[Page ${currentPage}] Scrolled to blog section`);
    } else {
      console.warn(`[Page ${currentPage}] Blog section not found`);
    }
  };

  const handlePageChange = (newPage) => {
    console.log(`[HandlePageChange] Changing page from ${currentPage} to ${newPage}`);
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      scrollToBlogSection();
    } else {
      console.warn(`[HandlePageChange] Already on page ${newPage}`);
    }
  };

  const renderPagination = () => {
    if (totalBlogs <= pageSize) return null; // Không hiển thị phân trang nếu chỉ có 1 trang

    const maxVisiblePages = 5; // Số trang tối đa hiển thị cùng lúc
    const totalPages = Math.ceil(totalBlogs / pageSize);
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Điều chỉnh startPage nếu endPage không đủ số trang hiển thị
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
            <Button
              onClick={() => handlePageChange(1)}
              className={styles.paginationButton}
            >
              1
            </Button>
            {startPage > 2 && <span className={styles.ellipsis}>...</span>}
          </>
        )}

        {pageNumbers.map((page) => (
          <Button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`${styles.paginationButton} ${
              currentPage === page ? styles.active : ""
            }`}
          >
            {page}
          </Button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className={styles.ellipsis}>...</span>
            )}
            <Button
              onClick={() => handlePageChange(totalPages)}
              className={styles.paginationButton}
            >
              {totalPages}
            </Button>
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
  console.log(
    `[Render] Current page: ${currentPage}, Page size: ${pageSize}, Total blogs: ${totalBlogs}, Total pages: ${totalPages}`
  );

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
          <div className={styles.loading}>
            <Spin size="large" />
            <p>{t("loading")}</p>
          </div>
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