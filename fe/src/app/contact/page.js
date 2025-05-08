"use client";
import { Button, Form, Input } from "antd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export default function Contact() {
  const onFinish = (values) => {
    console.log("Form values:", values);
    // Add logic to handle form submission (e.g., send to API later)
  };

  return (
    <div className={styles.container}>
      <Header />
      <section className={styles.ctaSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.ctaContent}>
            <h2>Contact Us</h2>
            <p>
              Reach out to discuss your technology needs and how we can help
              transform your business.
            </p>
            <Form
              name="contact"
              layout="vertical"
              onFinish={onFinish}
              className={styles.form}
            >
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Please enter your name" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Please enter a valid email",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Message"
                name="message"
                rules={[
                  { required: true, message: "Please enter your message" },
                ]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className={styles.ctaButton}
                >
                  Send Message
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
