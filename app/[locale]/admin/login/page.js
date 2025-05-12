"use client";

import { Button, Form, Input, message, Typography, Divider } from "antd";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl"; // Thêm useLocale
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function AdminLogin() {
  const router = useRouter();
  const locale = useLocale(); // Lấy locale hiện tại (en hoặc vi)
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      router.push(`/${locale}/admin/dashboard`); // Thêm locale vào URL
    }
  }, [router, locale]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { username, password } = values;
      if (username === "admin" && password === "admin") {
        localStorage.setItem("adminToken", "xp-admin-token");
        message.success("Đăng nhập thành công");
        router.push(`/${locale}/admin/dashboard`); // Thêm locale vào URL
      } else {
        message.error("Tên đăng nhập hoặc mật khẩu không đúng");
      }
    } catch (error) {
      message.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <section className={styles.loginSection}>
        <div className={styles.container}>
          <div className={styles.logoContainer}>
            <div className={styles.logoWrapper}>
              <LoginOutlined className={styles.loginIcon} />
            </div>
          </div>

          <Form
            name="admin-login"
            layout="vertical"
            onFinish={onFinish}
            className={styles.form}
            size="large"
          >
            <Title level={2} className={styles.formTitle}>
              Đăng nhập quản trị
            </Title>
            <Text type="secondary" className={styles.formSubtitle}>
              Vui lòng nhập thông tin đăng nhập để tiếp tục
            </Text>

            <Divider className={styles.divider} />

            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập" },
              ]}
            >
              <Input
                prefix={<UserOutlined className={styles.inputIcon} />}
                placeholder="Nhập tên đăng nhập"
                className={styles.input}
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password
                prefix={<LockOutlined className={styles.inputIcon} />}
                placeholder="Nhập mật khẩu"
                className={styles.input}
                autoComplete="current-password"
              />
            </Form.Item>

            <div className={styles.forgotPassword}>
              <a href={`/${locale}/admin/forgot-password`}>Quên mật khẩu?</a>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className={styles.loginButton}
                loading={loading}
                icon={<LoginOutlined />}
              >
                Đăng nhập
              </Button>
            </Form.Item>

            <div className={styles.securityNote}>
              <Text type="secondary" className={styles.securityText}>
                Hệ thống được bảo mật SSL. Thông tin đăng nhập được mã hóa.
              </Text>
            </div>
          </Form>
        </div>
      </section>
    </div>
  );
}
