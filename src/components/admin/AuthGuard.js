// src/components/admin/AuthGuard.js
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function useAuthGuard() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      router.push(`/${locale}/admin/login`);
    }
  }, [router, locale]);
}
