"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Card, Col, Row, Skeleton } from "antd";
import Link from "next/link";
import { fetchBlogs } from "../../lib/api";
import styles from "./BlogList.module.css";

export default function BlogList({ locale }) {
  const t = useTranslations();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const autoPlayInterval = 3000; // 3 seconds for smoother flow
  const intervalRef = useRef(null);

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchBlogs(locale, 1, 10); // Fetch more blogs
      setBlogs(response.data || []);
    } catch (error) {
      setError(
        t("loadError") || "Failed to load blogs. Please try again later."
      );
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [locale, t]);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  // Auto-play with seamless looping
  useEffect(() => {
    if (loading || blogs.length <= 0) return;

    const container = document.querySelector(`.${styles.blogContainer}`);
    if (!container) return;

    const cardWidth =
      container.querySelector(`.${styles.serviceCard}`)?.offsetWidth + 20; // Including gap
    if (!cardWidth) return;

    const totalWidth = blogs.length * cardWidth;
    const scrollStep = cardWidth;
    let scrollPosition = 0;

    intervalRef.current = setInterval(() => {
      scrollPosition += scrollStep;
      container.scrollLeft = scrollPosition;

      // Seamless loop: Reset to start when nearing the end
      if (scrollPosition >= totalWidth - container.offsetWidth) {
        setTimeout(() => {
          container.scrollLeft = 0;
          scrollPosition = 0;
        }, 100); // Short delay for smooth transition
      }
    }, autoPlayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loading, blogs, autoPlayInterval]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return `${baseUrl}${imagePath}`;
  };

  // Render cloned items for seamless looping
  const renderBlogs = () => {
    if (loading || error || blogs.length === 0) return null;
    const cloneCount = 2; // Number of cloned items for smooth transition
    const clonedBlogs = [...blogs, ...blogs.slice(0, cloneCount)];
    return clonedBlogs.map((blog, index) => {
      const translation =
        blog.translations.find((t) => t.language === locale) ||
        blog.translations[0];
      if (!translation || !translation.title) return null;
      return (
        <div key={`${blog.id}-${index}`} className={styles.serviceCard}>
          {blog.image && (
            <img
              src={getImageUrl(blog.image)}
              alt={blog.altText || translation.title}
              style={{
                width: "100%",
                height: 150,
                objectFit: "cover",
                borderRadius: "8px 8px 0 0",
              }}
            />
          )}
          <h3>{translation.title}</h3>
          <p>
            {translation.metaDescription ||
              (translation.content
                ? translation.content.slice(0, 50) + "..."
                : t("noDescription") || "No description available.")}
          </p>
          <Link href={`/${locale}/blog/${blog.slug}`}>
            <span className={styles.learnMoreBtn}>
              {t("readMore") || "Read More"}
            </span>
          </Link>
        </div>
      );
    });
  };

  return (
    <section id="blog" className={styles.servicesSection}>
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h2>{t("blogSectionTitle") || "Core Members"}</h2>
          <p>
            {t("blogSectionDescription") ||
              "Discover our latest insights and updates on technology and innovation"}
          </p>
        </div>
        {loading ? (
          <div className={styles.blogContainer}>
            {[...Array(5)].map((_, index) => (
              <div key={index} className={styles.serviceCard}>
                <Skeleton.Image
                  style={{
                    width: "100%",
                    height: 150,
                    borderRadius: "8px 8px 0 0",
                    marginBottom: 16,
                    background: "#f0f0f0",
                  }}
                  active
                />
                <Skeleton
                  active
                  title={{ width: "80%" }}
                  paragraph={{ rows: 1, width: ["90%"] }}
                />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : blogs.length === 0 ? (
          <p>{t("noBlogsAvailable") || "No blogs available at the moment."}</p>
        ) : (
          <div className={styles.blogContainer}>{renderBlogs()}</div>
        )}
      </div>
    </section>
  );
}
