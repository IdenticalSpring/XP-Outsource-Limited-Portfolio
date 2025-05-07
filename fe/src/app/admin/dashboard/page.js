"use client";

import { Button, Table } from "antd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./page.module.css";

export default function AdminDashboard({ searchParams }) {
  const router = useRouter();
  const isAdmin = searchParams.admin === "true";

  useEffect(() => {
    if (!isAdmin) {
      router.push("/");
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Service", dataIndex: "title", key: "title" },
    { title: "Description", dataIndex: "description", key: "description" },
  ];

  const data = [
    {
      id: 1,
      title: "Web Development",
      description: "Building responsive web apps.",
    },
    {
      id: 2,
      title: "Mobile App Development",
      description: "Creating mobile apps.",
    },
  ];

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <h2>Admin Dashboard</h2>
        <Table columns={columns} dataSource={data} rowKey="id" />
        <Button type="primary" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </div>
      <Footer />
    </div>
  );
}
