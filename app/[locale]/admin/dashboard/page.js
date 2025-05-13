"use client";

import LayoutAdmin from "@/src/components/admin/LayoutAdmin";
import BannerManagement from "@/src/components/admin/BannerManagement";
import useAuthGuard from "@/src/components/admin/AuthGuard";

export default function DashboardPage() {
  useAuthGuard();
  return (
    <LayoutAdmin title="Banner Management Dashboard">
      <BannerManagement />
    </LayoutAdmin>
  );
}
