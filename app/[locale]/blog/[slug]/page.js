// app/[locale]/blog/[slug]/page.js
import { Suspense } from "react";
import { Card } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { getTranslations } from "next-intl/server";
import Header from "../../../../src/components/Header";
import Footer from "../../../../src/components/Footer";
import Link from "next/link";
import BackToTopButton from "../../../../src/components/BackToTopButton";
import styles from "./page.module.css";

async function fetchBlog(locale, slug) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  try {
    const response = await fetch(`${API_URL}/${locale}/blog/${slug}`, {
      headers: {
        "Accept-Language": locale,
      },
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Failed to fetch blog");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}

async function BlogDetailContent({ locale, slug }) {
  const t = await getTranslations({ locale });
  console.log("Locale in BlogDetailContent:", locale);
  console.log("Translation for backToBlogs:", t("backToBlogs"));

  const blog = await fetchBlog(locale, slug);

  if (!blog || !blog.translations || blog.translations.length === 0) {
    return <p>{t("blogNotFound")}</p>;
  }

  const translation = blog.translations.find((t) => t.language === locale) || blog.translations[0];

  if (!translation || !translation.title) {
    console.warn(`Blog ${slug} thiếu bản dịch hợp lệ cho locale ${locale}`);
    return <p>{t("blogNotFound")}</p>;
  }

  return (
    <>
      <div className={styles.linkWrapper}>
        <Link href={`/${locale}#blogs`} className={styles.backToBlogsBtn} style={{ textDecoration: "none" }}>
          <ArrowLeftOutlined /> {t("backToBlogs")}
        </Link>
      </div>
      <Card
        title={translation.title}
        cover={
          blog.image && (
            <img
              src={blog.image}
              alt={blog.altText || translation.title}
              style={{ maxHeight: 400, objectFit: "cover", borderRadius: "8px 8px 0 0" }}
            />
          )
        }
      >
        <div dangerouslySetInnerHTML={{ __html: translation.content }} />
      </Card>
      <BackToTopButton />
    </>
  );
}

export default async function BlogDetail({ params }) {
  const resolvedParams = await params;
  const { locale, slug } = resolvedParams;
  const t = await getTranslations();
  console.log("Locale in BlogDetail:", locale);

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainContent}>
        <Suspense fallback={<p>{t("loading")}</p>}>
          <BlogDetailContent locale={locale} slug={slug} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export const dynamic = "force-dynamic";