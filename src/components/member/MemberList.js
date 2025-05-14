// src/components/member/MemberList.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button, Card, Col, Row, Spin, Skeleton } from "antd";
import Link from "next/link";
import { fetchMembers } from "../../lib/api";
import styles from "./MemberList.module.css";

export default function MemberList({ locale }) {
  const t = useTranslations();
  const [members, setMembers] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, total } = await fetchMembers(locale, currentPage, pageSize);
      console.log(`[Page ${currentPage}] API Response:`, data);
      if (!data || data.length === 0) {
        console.warn(`No members returned for page ${currentPage}`);
      }
      setMembers(data || []);
      setTotalMembers(total || 0);
    } catch (error) {
      console.error(`[Page ${currentPage}] Failed to load members:`, error);
      setError(t("loadError") || "Failed to load members. Please try again later.");
      setMembers([]);
      setTotalMembers(0);
    } finally {
      setLoading(false);
    }
  }, [locale, currentPage, t]);

  useEffect(() => {
    console.log(`[Effect] Loading members for page ${currentPage}`);
    loadMembers();
  }, [loadMembers]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return `${baseUrl}${imagePath}`;
  };

  const scrollToMemberSection = () => {
    const memberSection = document.getElementById("members");
    if (memberSection) {
      const headerHeight = document.querySelector(".header")?.offsetHeight || 0;
      window.scrollTo({
        top: memberSection.getBoundingClientRect().top + window.pageYOffset - headerHeight,
        behavior: "smooth",
      });
      console.log(`[Page ${currentPage}] Scrolled to members section`);
    } else {
      console.warn(`[Page ${currentPage}] Members section not found`);
    }
  };

  const handlePageChange = (newPage) => {
    console.log(`[HandlePageChange] Changing page from ${currentPage} to ${newPage}`);
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      scrollToMemberSection();
    } else {
      console.warn(`[HandlePageChange] Already on page ${newPage}`);
    }
  };

  const renderPagination = () => {
    if (totalMembers <= pageSize) return null;
    const maxVisiblePages = 5;
    const totalPages = Math.ceil(totalMembers / pageSize);
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
            <Button onClick={() => handlePageChange(1)} className={styles.paginationButton}>
              1
            </Button>
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
            <Button onClick={() => handlePageChange(totalPages)} className={styles.paginationButton}>
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

  return (
    <section id="members" className={styles.membersSection}>
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h2>{t("membersSectionTitle") || "Our Members"}</h2>
          <p>{t("membersSectionDescription") || "Meet our talented team members"}</p>
        </div>
        {loading ? (
          <div className={styles.loading}>
            <Row gutter={[32, 32]}>
              {[...Array(pageSize)].map((_, index) => (
                <Col xs={24} sm={12} md={8} key={index}>
                  <Card className={styles.memberCard}>
                    <Skeleton.Image style={{ width: "100%", height: 200 }} />
                    <Skeleton active paragraph={{ rows: 2 }} />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : members.length === 0 ? (
          <p>{t("noMembersAvailable") || "No members available at the moment."}</p>
        ) : (
          <>
            <Row gutter={[32, 32]}>
              {members
                .filter((member) => member.translations && member.translations.length > 0 && member.slug)
                .map((member) => {
                  const translation =
                    member.translations.find((t) => t.language === locale) || member.translations[0];
                  if (!translation || !translation.name) {
                    console.warn(`Invalid translation for member ID ${member.id}`);
                    return null;
                  }
                  return (
                    <Col xs={24} sm={12} md={8} key={member.id}>
                      <Card
                        className={styles.memberCard}
                        variant="borderless"
                        cover={
                          member.image && (
                            <img
                              src={getImageUrl(member.image)}
                              alt={translation.name}
                              style={{ height: 200, objectFit: "cover" }}
                              onError={(e) => {
                                e.target.src = "/images/placeholder.jpg";
                              }}
                            />
                          )
                        }
                      >
                        <h3>{translation.name}</h3>
                        <p>{translation.description?.slice(0, 100) + "..." || t("noDescription")}</p>
                        <Link href={`/${locale}/member/${member.slug}`}>
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