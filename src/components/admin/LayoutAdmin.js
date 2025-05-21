"use client";

import { Layout, Menu } from "antd";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import styles from "./LayoutAdmin.module.css";
import {
  PlusOutlined,
  LogoutOutlined,
  PictureOutlined,
  BookOutlined,
  SkinOutlined,
  BarChartOutlined,
  ContactsOutlined,
  GroupOutlined,
  UsergroupAddOutlined,
  FileImageOutlined, // Icon cho Statistics Management
} from "@ant-design/icons";
import { useState } from "react";

const { Header, Sider, Content } = Layout;

export default function LayoutAdmin({ children, title }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations(); // Thêm useTranslations để hỗ trợ i18n

  // Define menu items
  const menuItems = [
      {
      key: "1",
      icon: <SkinOutlined />,
      label: t("themeManagement") || "Theme Management",
      path: `/${locale}/admin/theme`,
    },
    {
      key: "2",
      icon: <BarChartOutlined />,
      label: t("statistics") || "Statistics",
      path: `/${locale}/admin/statistics`,
    },
    {
      key: "3",
      icon: <FileImageOutlined />,
      label: t("Images") || "Images",
      path: `/${locale}/admin/images`,
    },
    {
      key: "4",
      icon: <PictureOutlined />,
      label: t("banners") || "Banners",
      path: `/${locale}/admin/dashboard`,
    },
    {
      key: "5",
      icon: <BookOutlined />,
      label: t("blogs") || "Blogs",
      path: `/${locale}/admin/blogs`,
    },
    {
      key: "6",
      icon: <ContactsOutlined />,
      label: t("contact") || "Contacts",
      path: `/${locale}/admin/contact`,
    },

    {
      key: "7",
      icon: <UsergroupAddOutlined />,
      label: t("Member") || "Members",
      path: `/${locale}/admin/member`,
    },

    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: t("logout") || "Logout",
    },
  ];

  // Determine active menu based on current pathname
  const activeMenu =
    menuItems.find((item) => item.path && pathname.startsWith(item.path))
      ?.key || "1";

  const handleMenuClick = ({ key }) => {
    const item = menuItems.find((item) => item.key === key);
    if (key === "logout") {
      sessionStorage.removeItem("adminToken");
      router.push(`/${locale}/admin/login`);
    } else if (item?.path) {
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
