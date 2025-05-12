// src/components/BackToTopButton.js
"use client";
import { useState, useEffect } from "react";
import { Button } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import styles from "../../app/[locale]/blog/[slug]/page.module.css";

export default function BackToTopButton() {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <Button
      type="primary"
      shape="circle"
      icon={<ArrowUpOutlined />}
      className={styles.backToTop}
      onClick={handleScrollToTop}
      aria-label={t("backToTop") || "Back to Top"}
    />
  );
}