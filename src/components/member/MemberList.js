// src/components/member/MemberList.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button, Card, Col, Row, Skeleton } from "antd";
import Link from "next/link";
import { fetchMembers } from "../../lib/api";
import styles from "./MemberList.module.css";

export default function MemberList({ locale }) {
  const t = useTranslations();
  const [members, setMembers] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3; 

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, total } = await fetchMembers(locale, currentPage, pageSize);
      if (!data?.length) {
        console.warn(`No members returned for page ${currentPage}`);
      }
      setMembers(data || []);
      setTotalMembers(total || 0);
    } catch (error) {
      console.error(`[Page ${currentPage}] Failed to load members:`, error);
      setError(t("loadError") || "Không thể tải danh sách thành viên. Vui lòng thử lại sau.");
      setMembers([]);
      setTotalMembers(0);
    } finally {
      setLoading(false);
    }
  }, [locale, currentPage, pageSize, t]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder.jpg";
    return imagePath; 
  };

  const scrollToMemberSection = useCallback(() => {
    const memberSection = document.getElementById("members");
    if (memberSection) {
      const headerHeight = document.querySelector(".header")?.offsetHeight || 0;
      window.scrollTo({
        top: memberSection.getBoundingClientRect().top + window.pageYOffset - headerHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const handlePageChange = useCallback((newPage) => {
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      scrollToMemberSection();
    }
  }, [currentPage, scrollToMemberSection]);

  const renderPagination = () => {
    if (totalMembers <= pageSize) return null;
    const totalPages = Math.ceil(totalMembers / pageSize);
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

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
          <h2>{t("membersSectionTitle") || "Thành viên của chúng tôi"}</h2>
          <p>{t("membersSectionDescription") || "Gặp gỡ đội ngũ tài năng của chúng tôi"}</p>
        </div>
        {loading ? (
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
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : members.length === 0 ? (
          <p>{t("noMembersAvailable") || "Hiện tại không có thành viên nào."}</p>
        ) : (
          <>
            <Row gutter={[32, 32]}>
              {members
                .filter((member) => member.isActive && member.translations?.length && member.slug)
                .map((member) => {
                  const translation =
                    member.translations.find((t) => t.language === locale) || member.translations[0];
                  if (!translation?.name) return null;
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
                              loading="lazy"
                            />
                          )
                        }
                      >
                        <h3>{translation.name}</h3>
                        <p>
                          {translation.description?.slice(0, 100) + "..." || t("noDescription")}
                        </p>
                        <Link href={`/${locale}/member/${member.slug}`}>
                          <Button type="link" className={styles.learnMoreBtn}>
                            {t("readMore") || "Xem thêm"}
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