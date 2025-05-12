"use client";
import { Button, Col, Row } from "antd";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FaLaptopCode, FaDatabase, FaProjectDiagram } from "react-icons/fa";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import BannerCarousel from "../../src/components/Banner";
import BlogList from "../../src/components/blog/BlogList";
import Link from "next/link";
import { about } from "../../src/data/data";
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { fetchBanners } from "../../src/lib/api";

export default function Home() {
  const { locale } = useParams();
  const t = useTranslations();
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBanners = async () => {
      setIsLoading(true);
      const fetchedBanners = await fetchBanners(locale);
      console.log("Fetched banners:", fetchedBanners);
      setBanners(fetchedBanners);
      setIsLoading(false);
    };
    loadBanners();
  }, [locale]);

  const mainBanners = banners.filter((banner) => banner.slug !== "contact-cta-banner");
  const contactBanner = banners.find((banner) => banner.slug === "contact-cta-banner");
  console.log("Main banners:", mainBanners);
  console.log("Contact banner:", contactBanner);

  const techPartners = [
    { name: "Microsoft", logo: "/images/microsoft.png" },
    { name: "Google", logo: "/images/google.png" },
    { name: "Amazon", logo: "/images/amazon.png" },
    { name: "IBM", logo: "/images/ibm.png" },
    { name: "Oracle", logo: "/images/oracle.png" },
  ];

  const achievements = [
    { number: "500+", text: "Successful Projects" },
    { number: "50+", text: "Global Clients" },
    { number: "10+", text: "Years Experience" },
    { number: "100+", text: "Expert Developers" },
  ];

  const getTranslation = (banner) => {
    if (!banner || !banner.translations || banner.translations.length === 0) {
      console.warn("Invalid banner or translations:", banner);
      return {
        title: "Error: No translation available",
        description: "Please check banner data",
        buttonText: "Contact Us",
        buttonLink: "/contact",
      };
    }
    const translation = banner.translations.find((t) => t.language === locale) || banner.translations[0];
    console.log("Selected translation for locale", locale, ":", translation);
    return translation;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const url = `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
    console.log("Generated image URL:", url);
    return url;
  };

  return (
    <div className={styles.container}>
      <Header />
      <BannerCarousel locale={locale} banners={mainBanners} isLoading={isLoading} />
      <BlogList locale={locale} />

      <section id="about" className={styles.aboutSection}>
        <div className={styles.sectionContainer}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12}>
              <div className={styles.aboutImage}>
                <div className={styles.placeholderImage}></div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className={styles.aboutContent}>
                <h2>{t("aboutTitle") || "About XP OutSource"}</h2>
                <p className={styles.aboutDescription}>{about.mission}</p>
                <div className={styles.aboutFeatures}>
                  <div className={styles.featureItem}>
                    <div className={styles.featureIcon}>
                      <FaLaptopCode />
                    </div>
                    <div>
                      <h4>{t("expertTeamTitle") || "Expert Team"}</h4>
                      <p>
                        {t("expertTeamDescription") ||
                          "Skilled developers with cutting-edge expertise"}
                      </p>
                    </div>
                  </div>
                  <div className={styles.featureItem}>
                    <div className={styles.featureIcon}>
                      <FaDatabase />
                    </div>
                    <div>
                      <h4>{t("advancedTechTitle") || "Advanced Technology"}</h4>
                      <p>
                        {t("advancedTechDescription") ||
                          "Using the latest technologies and frameworks"}
                      </p>
                    </div>
                  </div>
                  <div className={styles.featureItem}>
                    <div className={styles.featureIcon}>
                      <FaProjectDiagram />
                    </div>
                    <div>
                      <h4>{t("agileProcessTitle") || "Agile Process"}</h4>
                      <p>
                        {t("agileProcessDescription") ||
                          "Efficient development with transparent communication"}
                      </p>
                    </div>
                  </div>
                </div>
                <Link href="#contact">
                  <Button type="primary" className={styles.aboutButton}>
                    {t("learnMoreAboutUs") || "Learn More About Us"}
                  </Button>
                </Link>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      <section id="achievements" className={styles.achievementsSection}>
        <div className={styles.sectionContainer}>
          <Row gutter={[24, 24]}>
            {achievements.map((item, index) => (
              <Col xs={12} md={6} key={index}>
                <div className={styles.achievementItem}>
                  <h3>{item.number}</h3>
                  <p>{item.text}</p>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section id="partners" className={styles.partnersSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>{t("partnersTitle") || "Our Technology Partners"}</h2>
            <p>
              {t("partnersDescription") ||
                "We collaborate with industry leaders to deliver exceptional solutions"}
            </p>
          </div>
          <div className={styles.partnerLogos}>
            {techPartners.map((partner, index) => (
              <div key={index} className={styles.partnerLogo}>
                <div className={styles.logoPlaceholder}>{partner.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className={styles.ctaSection}>
        {contactBanner && !isLoading && (
          <div
            className={styles.ctaBackground}
            style={{ backgroundImage: `url(${getImageUrl(contactBanner.image)})` }}
          />
        )}
        <div className={styles.sectionContainer}>
          <div className={styles.ctaContent}>
            {isLoading ? (
              <div>
                <h2>Loading banner...</h2>
                <p>Please wait while we fetch the data.</p>
              </div>
            ) : contactBanner ? (
              (() => {
                const translation = getTranslation(contactBanner);
                return (
                  <>
                    <h2>{translation.title}</h2>
                    <p>{translation.description}</p>
                    <Link href={translation.buttonLink}>
                      <Button type="primary" size="large" className={styles.ctaButton}>
                        {translation.buttonText}
                      </Button>
                    </Link>
                  </>
                );
              })()
            ) : (
              <div>
                <h2>Error: Contact banner not found</h2>
                <p>Please ensure a banner with slug "contact-cta-banner" exists in the database.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}