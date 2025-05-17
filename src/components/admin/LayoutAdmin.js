"use client";

import { Layout, Menu } from "antd";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import styles from "./LayoutAdmin.module.css";
import {
  PlusOutlined,
  LogoutOutlined,
  PictureOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const { Header, Sider, Content } = Layout;

export default function LayoutAdmin({ children, title }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  // Define menu items
  const menuItems = [
    {
      key: "1",
      icon: <PictureOutlined />,
      label: "Banners",
      path: `/${locale}/admin/dashboard`,
    },
    {
      key: "2",
      icon: <BookOutlined />,
      label: "Blogs",
      path: `/${locale}/admin/blogs`,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
    },
  ];

  // Determine active menu based on current pathname
  const activeMenu =
    menuItems.find((item) => pathname.startsWith(item.path))?.key || "1";

  const handleMenuClick = ({ key }) => {
    const item = menuItems.find((item) => item.key === key);
    if (key === "logout") {
      sessionStorage.removeItem("adminToken");
      router.push(`/${locale}/admin/login`);
    } else if (item.path) {
      router.push(item.path);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible>
        <div className={styles.logo}>Admin Panel</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeMenu]}
          onClick={handleMenuClick}
        >
          {menuItems.map((item) => (
            <Menu.Item key={item.key} icon={item.icon}>
              {item.label}
            </Menu.Item>
          ))}
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
