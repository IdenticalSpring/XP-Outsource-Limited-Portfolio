// app/[locale]/blog/[slug]/page.js
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import Header from "../../../../src/components/Header";
import Footer from "../../../../src/components/Footer";
import BlogDetailContent from "../../../../src/components/blog/BlogDetailContent";
import styles from "./page.module.css";

export default async function BlogDetail({ params }) {
  const resolvedParams = await params;
  const { locale, slug } = resolvedParams;
  const t = await getTranslations();

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