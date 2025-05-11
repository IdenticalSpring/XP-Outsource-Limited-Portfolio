"use client";
import { Button, Card, Col, Row } from "antd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { services } from "@/data/data";
import styles from "./page.module.css";
import { FaCode, FaMobileAlt, FaCloud } from "react-icons/fa";

export default function Services() {
  const serviceIcons = {
    "Web Development": <FaCode size={40} />,
    "Mobile App Development": <FaMobileAlt size={40} />,
    "Cloud Solutions": <FaCloud size={40} />,
  };

  return (
    <div className={styles.container}>
      <Header />
      <section className={styles.servicesSection}>
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
                  <Button type="link" className={styles.learnMoreBtn}>
                    Learn More
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>
      <Footer />
    </div>
  );
}
