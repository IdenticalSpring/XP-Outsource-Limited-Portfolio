"use client";

import LayoutAdmin from "@/src/components/admin/LayoutAdmin";
import BlogManagement from "@/src/components/admin/BlogManagement";
import useAuthGuard from "@/src/components/admin/AuthGuard";

export default function BlogsPage() {
  useAuthGuard();
  return (
    <LayoutAdmin title="Blog Management Dashboard">
      <BlogManagement />
    </LayoutAdmin>
  );
}
