"use client";

import LayoutAdmin from "@/src/components/admin/LayoutAdmin";
import useAuthGuard from "@/src/components/admin/AuthGuard";
import ContactManagement from "@/src/components/admin/ContactManagement";

export default function BlogsPage() {
  useAuthGuard();
  return (
    <LayoutAdmin title="Blog Management Dashboard">
      <ContactManagement />
    </LayoutAdmin>
  );
}
