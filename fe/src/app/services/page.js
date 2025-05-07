import { Card, Col, Row } from "antd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { services } from "@/data/data";
import styles from "./page.module.css";

export default function Services() {
  return (
    <div>
      <Header />
      <div className={styles.container}>
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
      <Footer />
    </div>
  );
}
