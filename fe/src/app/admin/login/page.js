"use client";

import { Button, Form, Input, message } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export default function AdminLogin() {
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const onFinish = (values) => {
    // Hardcoded credentials for demo
    const { username, password } = values;
    if (username === "admin" && password === "admin") {
      localStorage.setItem("adminToken", "xp-admin-token");
      message.success("Login successful");
      router.push("/admin/dashboard");
    } else {
      message.error("Invalid username or password");
    }
  };

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <h2>Admin Login</h2>
        <Form
          name="admin-login"
          layout="vertical"
          onFinish={onFinish}
          className={styles.form}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter your username" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
      <Footer />
    </div>
  );
}
