import { Button, Card, Col, Row, Carousel } from "antd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { services, about } from "@/data/data";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div>
      <Header />
      {/* Hero Section */}
      <div className={styles.hero}>
        <h1>Empower Your Business with XP OutSource</h1>
        <p>Leading technology outsourcing solutions for global innovation.</p>
        <Link href="/services">
          <Button type="primary" size="large">
            Discover Our Services
          </Button>
        </Link>
      </div>

      {/* Services Section */}
      <div className={styles.section}>
        <h2>Our Services</h2>
        <Row gutter={[24, 24]}>
          {services.map((service) => (
            <Col xs={24} sm={12} md={8} key={service.id}>
              <Card
                hoverable
                title={service.title}
                className={styles.serviceCard}
              >
                <p>{service.description}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* About Section */}
      <div className={styles.section}>
        <h2>About XP OutSource</h2>
        <p>{about.mission}</p>
        <Link href="/about">
          <Button type="link">Learn More</Button>
        </Link>
      </div>

      {/* Contact Section */}
      <div className={styles.section}>
        <h2>Get in Touch</h2>
        <p>Contact us to start your digital transformation journey.</p>
        <Link href="/contact">
          <Button type="primary">Contact Us</Button>
        </Link>
      </div>

      <Footer />
    </div>
  );
}
