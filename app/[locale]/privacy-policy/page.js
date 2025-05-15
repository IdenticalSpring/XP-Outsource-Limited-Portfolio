// src/pages/[locale]/privacy-policy/index.js
"use client";
import { useTranslations } from "next-intl";
import Header from "../../../src/components/Header";
import Footer from "../../../src/components/Footer";
import styles from "./page.module.css";

export default function PrivacyPolicy() {
  const t = useTranslations();

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>{t("privacyPolicyTitle")}</h1>
        <section className={styles.content}>
          <p>{t("privacyPolicyContent") || "This is the Privacy Policy page content. Please update this placeholder with actual content."}</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}