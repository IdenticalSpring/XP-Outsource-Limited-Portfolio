"use client";

import LayoutAdmin from "@/src/components/admin/LayoutAdmin";
import useAuthGuard from "@/src/components/admin/AuthGuard";
import MemberManagement from "@/src/components/admin/MemberManagement";

export default function BlogsPage() {
  useAuthGuard();
  return (
    <LayoutAdmin title="Blog Management Dashboard">
      <MemberManagement />
    </LayoutAdmin>
  );
}
