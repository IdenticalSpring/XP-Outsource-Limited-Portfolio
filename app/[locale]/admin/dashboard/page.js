// src/pages/admin/dashboard/page.js
"use client";

import { PictureOutlined } from "@ant-design/icons";
import useAuthGuard from "@/src/components/admin/AuthGuard";
import LayoutAdmin from "@/src/components/admin/LayoutAdmin";
import BannerManagement from "@/src/components/admin/BannerManagement";

export default function AdminDashboard() {
  useAuthGuard();

  const menuItems = [
    {
      key: "1",
      icon: <PictureOutlined />,
      label: "Banners",
      path: "/admin/dashboard",
    },
  ];

  return (
    <LayoutAdmin menuItems={menuItems} title="Banner Management Dashboard">
      <BannerManagement />
    </LayoutAdmin>
  );
}
