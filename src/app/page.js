"use client";
import { Button, Card, Col, Row, Carousel } from "antd";
import { useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { services, about } from "@/data/data";
import Link from "next/link";
import styles from "./page.module.css";
import {
  FaCode,
  FaMobileAlt,
  FaCloud,
  FaChevronLeft,
  FaChevronRight,
  FaLaptopCode,
  FaDatabase,
  FaProjectDiagram,
} from "react-icons/fa";

export default function Home() {
  const carouselRef = useRef(null);

  const heroSlides = [
    {
      title: "Empower Your Business with XP OutSource",
      description:
        "Leading technology outsourcing solutions for global innovation",
      buttonText: "Discover Our Services",
      buttonLink: "#services",
      image: "/images/hero1.jpg",
    },
    {
      title: "Expert Software Development",
      description: "Custom solutions tailored to your business needs",
      buttonText: "See Our Projects",
      buttonLink: "#services",
      image: "/images/hero2.jpg",
    },
    {
      title: "Digital Transformation",
      description: "Navigate the future with our cutting-edge technology",
      buttonText: "Learn More",
      buttonLink: "#about",
      image: "/images/hero3.jpg",
    },
  ];

  const serviceIcons = {
    "Web Development": <FaCode size={40} />,
    "Mobile App Development": <FaMobileAlt size={40} />,
    "Cloud Solutions": <FaCloud size={40} />,
  };

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

  return (
    <div className={styles.container}>
      <Header />

      {/* Hero Section with Carousel */}
      <section id="home" className={styles.heroSection}>
        <Carousel
          autoplay
          effect="fade"
          dots={true}
          ref={carouselRef}
          className={styles.carousel}
        >
          {heroSlides.map((slide, index) => (
            <div key={index}>
              <div
                className={styles.heroSlide}
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className={styles.heroContent}>
                  <h1>{slide.title}</h1>
                  <p>{slide.description}</p>
                  <Link href={slide.buttonLink}>
                    <Button
                      type="primary"
                      size="large"
                      className={styles.heroButton}
                    >
                      {slide.buttonText}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </Carousel>

        <div className={styles.carouselNavigation}>
          <Button
            className={styles.navButton}
            onClick={() => carouselRef.current.prev()}
            icon={<FaChevronLeft />}
          />
          <Button
            className={styles.navButton}
            onClick={() => carouselRef.current.next()}
            icon={<FaChevronRight />}
          />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className={styles.servicesSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>Our Services</h2>
            <p>
              We provide a range of technology solutions to accelerate your
              business growth
            </p>
          </div>

          <Row gutter={[32, 32]}>
            {services.map((service) => (
              <Col xs={24} sm={12} md={8} key={service.id}>
                <Card className={styles.serviceCard} bordered={false}>
                  <div className={styles.serviceIcon}>
                    {serviceIcons[service.title]}
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <Link href={`/services/${service.id}`}>
                    <Button type="link" className={styles.learnMoreBtn}>
                      Learn More
                    </Button>
                  </Link>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* About Section */}
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
                <h2>About XP OutSource</h2>
                <p className={styles.aboutDescription}>{about.mission}</p>
                <div className={styles.aboutFeatures}>
                  <div className={styles.featureItem}>
                    <div className={styles.featureIcon}>
                      <FaLaptopCode />
                    </div>
                    <div>
                      <h4>Expert Team</h4>
                      <p>Skilled developers with cutting-edge expertise</p>
                    </div>
                  </div>
                  <div className={styles.featureItem}>
                    <div className={styles.featureIcon}>
                      <FaDatabase />
                    </div>
                    <div>
                      <h4>Advanced Technology</h4>
                      <p>Using the latest technologies and frameworks</p>
                    </div>
                  </div>
                  <div className={styles.featureItem}>
                    <div className={styles.featureIcon}>
                      <FaProjectDiagram />
                    </div>
                    <div>
                      <h4>Agile Process</h4>
                      <p>
                        Efficient development with transparent communication
                      </p>
                    </div>
                  </div>
                </div>
                <Link href="#contact">
                  <Button type="primary" className={styles.aboutButton}>
                    Learn More About Us
                  </Button>
                </Link>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Achievements Section */}
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

      {/* Partners Section */}
      <section id="partners" className={styles.partnersSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>Our Technology Partners</h2>
            <p>
              We collaborate with industry leaders to deliver exceptional
              solutions
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

      {/* Contact CTA Section */}
      <section id="contact" className={styles.ctaSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.ctaContent}>
            <h2>Ready to Transform Your Business?</h2>
            <p>
              Contact us today to discuss your technology needs and solutions
            </p>
            <Link href="/contact">
              <Button type="primary" size="large" className={styles.ctaButton}>
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
