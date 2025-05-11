// src/components/BannerCarousel.js
"use client";
import { useState, useEffect, useRef } from "react";
import { Carousel, Spin, Button } from "antd";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { fetchBanners } from "../lib/api";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "./Banner.module.css";

export default function Banner({ locale }) {
  const carouselRef = useRef(null);
  const t = useTranslations();
  const finalLocale = locale || "en";
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadBanners() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchBanners(finalLocale);
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format: Expected an array");
        }
        setBanners(data);
      } catch (err) {
        setError(t("failedToLoadBanners") || "Failed to load banners. Please try again later.");
        console.error("Error in loadBanners:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBanners();
  }, [finalLocale]);

  const getTranslation = (banner) => {
    if (!banner || !banner.translations || !Array.isArray(banner.translations)) {
      return { title: "No Title", description: "No Description", buttonText: "Learn More", buttonLink: "#" };
    }
    return (
      banner.translations.find((trans) => trans.language === finalLocale) ||
      banner.translations[0] ||
      { title: "No Title", description: "No Description", buttonText: "Learn More", buttonLink: "#" }
    );
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
  };

  return (
    <section id="home" className={styles.heroSection}>
      {loading ? (
        <Spin size="large" style={{ display: "block", margin: "0 auto" }} />
      ) : error ? (
        <div style={{ textAlign: "center", color: "red" }}>{error}</div>
      ) : banners.length === 0 ? (
        <div style={{ textAlign: "center" }}>{t("noBanners") || "No banners available"}</div>
      ) : (
        <Carousel
          autoplay
          effect="fade"
          dots={true}
          ref={carouselRef}
          className={styles.carousel}
        >
          {banners.map((slide) => {
            const translation = getTranslation(slide);
            const imageUrl = getImageUrl(slide.image);
            return (
              <div key={slide.id}>
                <div
                  className={styles.heroSlide}
                  style={{ backgroundImage: `url(${imageUrl})` }}
                >
                  <div className={styles.heroContent}>
                    <h1>{translation.title}</h1>
                    <p>{translation.description}</p>
                    <Link href={translation.buttonLink}>
                      <Button
                        type="primary"
                        size="large"
                        className={styles.heroButton}
                      >
                        {translation.buttonText}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </Carousel>
      )}

      <div className={styles.carouselNavigation}>
        <Button
          className={styles.navButton}
          onClick={() => carouselRef.current?.prev()}
          icon={<FaChevronLeft />}
          disabled={loading || banners.length === 0}
        />
        <Button
          className={styles.navButton}
          onClick={() => carouselRef.current?.next()}
          icon={<FaChevronRight />}
          disabled={loading || banners.length === 0}
        />
      </div>
    </section>
  );
}