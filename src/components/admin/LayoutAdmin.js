// src/components/admin/LayoutAdmin.js
"use client";

import { Layout, Menu } from "antd";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import styles from "./LayoutAdmin.module.css";
import {
  PlusOutlined,
  LogoutOutlined,
  ProjectOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

export default function LayoutAdmin({ children, menuItems, title }) {
  const router = useRouter();
  const locale = useLocale();

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    router.push(`/${locale}/admin/login`);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible>
        <div className={styles.logo}>Admin Panel</div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
          {menuItems.map((item) => (
            <Menu.Item
              key={item.key}
              icon={item.icon}
              onClick={
                item.onClick || (() => router.push(`/${locale}${item.path}`))
              }
            >
              {item.label}
            </Menu.Item>
          ))}
          <Menu.Item
            key="logout"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Logout
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header className={styles.header}>
          <h1>{title}</h1>
        </Header>
        <Content className={styles.content}>{children}</Content>
      </Layout>
    </Layout>
  );
}
