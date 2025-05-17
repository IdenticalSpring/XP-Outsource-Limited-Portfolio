// src/components/Banner/BannerCarousel.js
"use client";
import { useRef } from "react";
import { Carousel, Skeleton, Button } from "antd"; // <== thêm Skeleton ở đây
import Link from "next/link";
import { useTranslations } from "next-intl";
import styles from "./Banner.module.css";

export default function BannerCarousel({ locale, banners, isLoading }) {
  const carouselRef = useRef(null);
  const t = useTranslations();
  const finalLocale = locale || "en";

  const getTranslation = (banner) => {
    if (!banner || !banner.translations || !Array.isArray(banner.translations)) {
      return {
        title: "No Title",
        description: "No Description",
        buttonText: "Learn More",
        buttonLink: "#",
      };
    }
    return (
      banner.translations.find((trans) => trans.language === finalLocale) ||
      banner.translations[0] || {
        title: "No Title",
        description: "No Description",
        buttonText: "Learn More",
        buttonLink: "#",
      }
    );
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
  };

  // ----------- BẮT ĐẦU SKELETON ----------
if (isLoading) {
  return (
    <section id="home" className={styles.heroSection}>
      <div className={styles.skeletonContainer}>
        <Skeleton.Image
          style={{
            width: "100%",
            height: "100vh",
            minHeight: 600,
            borderRadius: 0,
            background: "#f0f0f0",
          }}
          active
        />
        <div className={styles.skeletonContent}>
          <Skeleton.Input
            style={{
              width: "min(80%, 400px)", 
              height: 48,
              marginBottom: 24,
              borderRadius: 8,
            }}
            active
            size="large"
          />
          <Skeleton
            paragraph={{ rows: 2, width: ["80%", "60%"] }}
            active
            title={false}
            style={{ marginBottom: 24 }}
          />
          <Skeleton.Button
            style={{
              width: 160,
              height: 40,
              borderRadius: 8,
              marginTop: 16,
            }}
            active
            size="large"
          />
        </div>
      </div>
    </section>
  );
}
  // ----------- KẾT THÚC SKELETON ----------

  if (!banners || banners.length === 0) {
    return (
      <section id="home" className={styles.heroSection}>
        <div style={{ textAlign: "center" }}>
          {t("noBanners") || "No banners available"}
        </div>
      </section>
    );
  }

  return (
    <section id="home" className={styles.heroSection}>
      <Carousel
        autoplay
        autoplaySpeed={5000}
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
    </section>
  );
}
