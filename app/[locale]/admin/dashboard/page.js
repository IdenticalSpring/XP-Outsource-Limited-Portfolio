"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl"; // Thêm useLocale
import { Layout, Menu, Table, Button, Modal, Form, Input, message } from "antd";
import {
  PlusOutlined,
  LogoutOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import styles from "./page.module.css";

const { Header, Sider, Content } = Layout;

export default function AdminDashboard() {
  const router = useRouter();
  const locale = useLocale(); // Lấy locale hiện tại
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "Web Development",
      description: "Building responsive web apps.",
      status: "In Progress",
    },
    {
      id: 2,
      title: "Mobile App Development",
      description: "Creating mobile apps.",
      status: "Completed",
    },
  ]);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push(`/${locale}/admin/login`); // Thêm locale
    }
  }, [router, locale]);

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Project Name", dataIndex: "title", key: "title" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Status", dataIndex: "status", key: "status" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingProject(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    form.setFieldsValue(project);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    setProjects(projects.filter((project) => project.id !== id));
    message.success("Project deleted successfully");
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingProject) {
        setProjects(
          projects.map((project) =>
            project.id === editingProject.id
              ? { ...project, ...values }
              : project
          )
        );
        message.success("Project updated successfully");
      } else {
        const newProject = {
          id: projects.length + 1,
          ...values,
          status: values.status || "In Progress",
        };
        setProjects([...projects, newProject]);
        message.success("Project added successfully");
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push(`/${locale}/admin/login`); // Thêm locale
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible>
        <div className={styles.logo}>Project Admin</div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
          <Menu.Item key="1" icon={<ProjectOutlined />}>
            Projects
          </Menu.Item>
          <Menu.Item key="2" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header className={styles.header}>
          <h1>Project Management Dashboard</h1>
        </Header>
        <Content className={styles.content}>
          <div className={styles.container}>
            <div className={styles.tableHeader}>
              <h2>Projects</h2>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Add Project
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={projects}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </div>
          <Modal
            title={editingProject ? "Edit Project" : "Add Project"}
            open={isModalVisible}
            onOk={handleModalOk}
            onCancel={() => setIsModalVisible(false)}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="title"
                label="Project Name"
                rules={[
                  { required: true, message: "Please enter project name" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="description"
                label="Description"
                rules={[
                  { required: true, message: "Please enter description" },
                ]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item name="status" label="Status">
                <Input placeholder="e.g., In Progress, Completed" />
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
}
