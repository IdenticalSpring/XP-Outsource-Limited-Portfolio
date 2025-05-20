"use client";

import LayoutAdmin from "@/src/components/admin/LayoutAdmin";
import StatisticsManagement from "@/src/components/admin/StatisticsPage";
import useAuthGuard from "@/src/components/admin/AuthGuard";

export default function StatisticsPage() {
  useAuthGuard();
  return (
    <LayoutAdmin title="Statistics Management Dashboard">
      <StatisticsManagement />
    </LayoutAdmin>
  );
}