"use client";

import { Button, Table } from "antd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./page.module.css";

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);

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

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <h2>Admin Dashboard</h2>
        <Table columns={columns} dataSource={data} rowKey="id" />
        <Button type="primary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      <Footer />
    </div>
  );
}
