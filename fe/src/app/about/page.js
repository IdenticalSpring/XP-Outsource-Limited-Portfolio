"use client";
import { Button, Col, Row } from "antd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { about } from "@/data/data";
import styles from "./page.module.css";
import { FaLaptopCode, FaDatabase, FaProjectDiagram } from "react-icons/fa";
import Link from "next/link";

export default function About() {
  return (
    <div className={styles.container}>
      <Header />
      <section className={styles.aboutSection}>
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
                <Link href="/contact">
                  <Button type="primary" className={styles.aboutButton}>
                    Contact Us
                  </Button>
                </Link>
              </div>
            </Col>
          </Row>
        </div>
      </section>
      <Footer />
    </div>
  );
}
