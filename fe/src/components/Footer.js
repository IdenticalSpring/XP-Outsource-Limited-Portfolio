import { Col, Row, Input, Button, Divider } from "antd";
import Link from "next/link";
import styles from "./Footer.module.css";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaArrowRight,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <Row gutter={[48, 48]} justify="space-between">
          <Col xs={24} sm={24} md={8} lg={7}>
            <div className={styles.footerWidget}>
              <div className={styles.footerLogo}>XP OutSource</div>
              <p className={styles.companyDesc}>
                XP OutSource is a leading technology outsourcing company
                providing innovative solutions for businesses looking to
                accelerate digital transformation.
              </p>
              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <FaMapMarkerAlt className={styles.contactIcon} />
                  <span>123 Technology Park, Ho Chi Minh City, Vietnam</span>
                </div>
                <div className={styles.contactItem}>
                  <FaPhoneAlt className={styles.contactIcon} />
                  <span>+84 123 456 789</span>
                </div>
                <div className={styles.contactItem}>
                  <FaEnvelope className={styles.contactIcon} />
                  <span>contact@xpoutsource.com</span>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} md={5} lg={4}>
            <div className={styles.footerWidget}>
              <h3 className={styles.widgetTitle}>Company</h3>
              <ul className={styles.footerLinks}>
                <li>
                  <Link href="/about">About Us</Link>
                </li>
                <li>
                  <Link href="/team">Our Team</Link>
                </li>
                <li>
                  <Link href="/careers">Careers</Link>
                </li>
                <li>
                  <Link href="/news">News</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
              </ul>
            </div>
          </Col>

          <Col xs={24} sm={12} md={5} lg={4}>
            <div className={styles.footerWidget}>
              <h3 className={styles.widgetTitle}>Services</h3>
              <ul className={styles.footerLinks}>
                <li>
                  <Link href="/services/web">Web Development</Link>
                </li>
                <li>
                  <Link href="/services/mobile">Mobile App Development</Link>
                </li>
                <li>
                  <Link href="/services/cloud">Cloud Solutions</Link>
                </li>
                <li>
                  <Link href="/services/consulting">IT Consulting</Link>
                </li>
                <li>
                  <Link href="/services/support">Tech Support</Link>
                </li>
              </ul>
            </div>
          </Col>

          <Col xs={24} sm={24} md={6} lg={7}>
            <div className={styles.footerWidget}>
              <h3 className={styles.widgetTitle}>Newsletter</h3>
              <p className={styles.newsletterDesc}>
                Subscribe to our newsletter for the latest updates and insights
              </p>
              <div className={styles.subscribeForm}>
                <Input
                  placeholder="Your email address"
                  className={styles.subscribeInput}
                />
                <Button type="primary" className={styles.subscribeBtn}>
                  <FaArrowRight />
                </Button>
              </div>
              <div className={styles.socialLinks}>
                <a href="https://facebook.com" className={styles.socialLink}>
                  <FaFacebookF />
                </a>
                <a href="https://twitter.com" className={styles.socialLink}>
                  <FaTwitter />
                </a>
                <a href="https://linkedin.com" className={styles.socialLink}>
                  <FaLinkedinIn />
                </a>
                <a href="https://youtube.com" className={styles.socialLink}>
                  <FaYoutube />
                </a>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Divider className={styles.footerDivider} />

      <div className={styles.footerBottom}>
        <div className={styles.copyright}>
          <p>© 2025 XP OutSource. All rights reserved.</p>
        </div>
        <div className={styles.footerNav}>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-of-service">Terms of Service</Link>
          <Link href="/sitemap">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}
