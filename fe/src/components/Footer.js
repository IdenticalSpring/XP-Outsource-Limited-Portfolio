import { Col, Row } from "antd";
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <div className={styles.footer}>
      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} sm={8}>
          <h3>XP OutSource</h3>
          <p>Leading technology outsourcing solutions.</p>
        </Col>
        <Col xs={24} sm={8}>
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/services">Services</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </Col>
        <Col xs={24} sm={8}>
          <h3>Contact</h3>
          <p>Email: contact@xpoutsource.com</p>
          <p>Phone: +84 123 456 789</p>
        </Col>
      </Row>
      <div className={styles.copyright}>
        <p>© 2025 XP OutSource. All rights reserved.</p>
      </div>
    </div>
  );
}
