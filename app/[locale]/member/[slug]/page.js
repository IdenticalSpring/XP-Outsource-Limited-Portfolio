// app/member/[slug]/page.js
"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Button, Card, Spin, Typography } from "antd";
import Link from "next/link";
import { fetchMemberBySlug } from "../../../../src/lib/api";
import styles from "./MemberDetail.module.css";

export default function MemberDetail() {
  const { locale, slug } = useParams();
  const t = useTranslations();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMember = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMemberBySlug(locale, slug);
        if (!data) {
          throw new Error("Member not found");
        }
        setMember(data);
      } catch (error) {
        console.error(`Failed to load member ${slug}:`, error);
        setError(t("memberNotFound") || "Member not found");
      } finally {
        setLoading(false);
      }
    };
    loadMember();
  }, [locale, slug, t]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return `${baseUrl}${imagePath}`;
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
        <p>{t("loading")}</p>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className={styles.error}>
        <Typography.Title level={3}>{error}</Typography.Title>
        <Link href={`/${locale}`}>
          <Button type="primary">{t("backToHome")}</Button>
        </Link>
      </div>
    );
  }

  const translation = member.translations?.find((t) => t.language === locale) || member.translations?.[0];

  if (!translation) {
    return (
      <div className={styles.error}>
        <Typography.Title level={3}>
          {t("translationNotFound") || "Translation not found for this language"}
        </Typography.Title>
        <Link href={`/${locale}`}>
          <Button type="primary">{t("backToHome")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <section className={styles.memberDetailSection}>
      <div className={styles.sectionContainer}>
        <Card
          className={styles.memberCard}
          cover={
            member.image && (
              <img
                src={getImageUrl(member.image)}
                alt={translation.name}
                style={{ height: 300, objectFit: "cover" }}
                onError={(e) => {
                  e.target.src = "/images/placeholder.jpg";
                }}
              />
            )
          }
        >
          <Typography.Title level={2}>{translation.name}</Typography.Title>
          <Typography.Text>{translation.metaDescription}</Typography.Text>
          <Typography.Paragraph style={{ marginTop: 16 }}>
            {translation.description}
          </Typography.Paragraph>
          <Link href={`/${locale}#members`}>
            <Button type="link" className={styles.backButton}>
              {t("backToMembers") || "Back to Members"}
            </Button>
          </Link>
        </Card>
      </div>
    </section>
  );
}