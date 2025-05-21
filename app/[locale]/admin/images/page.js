"use client";

import LayoutAdmin from "@/src/components/admin/LayoutAdmin";
import useAuthGuard from "@/src/components/admin/AuthGuard";
import ImageManagement from "@/src/components/admin/ImageManagement";

export default function BlogsPage() {
  useAuthGuard();
  return (
    <LayoutAdmin title="Blog Management Dashboard">
      <ImageManagement />
    </LayoutAdmin>
  );
}
