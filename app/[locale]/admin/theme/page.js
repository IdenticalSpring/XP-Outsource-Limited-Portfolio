// src/app/[locale]/admin/theme/page.js
"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button, Form, Input, ColorPicker, Select, message } from "antd";
import LayoutAdmin from "@/src/components/admin/LayoutAdmin";
import useAuthGuard from "@/src/components/admin/AuthGuard";
import { saveThemeConfig, fetchThemeConfig } from "@/src/lib/api";
import styles from "./theme-management.module.css";

export default function ThemeManagement() {
  useAuthGuard();
  const t = useTranslations();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const defaultTheme = {
    primaryColor: "#f15a22",
    secondaryColor: "#d84a14",
    fontFamily: "Inter, sans-serif",
    headingFontSize: "2.5rem",
    textFontSize: "1.1rem",
  };

  useEffect(() => {
    const loadTheme = async () => {
      setLoading(true);
      try {
        const themeConfig = await fetchThemeConfig();
        // Đảm bảo primaryColor và secondaryColor là chuỗi hex
        form.setFieldsValue({
          ...defaultTheme,
          ...themeConfig,
          primaryColor: themeConfig.primaryColor || defaultTheme.primaryColor,
          secondaryColor: themeConfig.secondaryColor || defaultTheme.secondaryColor,
        });
      } catch (error) {
        console.error("Failed to load theme config:", error);
        message.error(t("loadError") || "Không thể tải cấu hình giao diện");
        form.setFieldsValue(defaultTheme);
      } finally {
        setLoading(false);
      }
    };
    loadTheme();
  }, [form, t]);

  const getColorHex = (color) => {
    if (!color) return defaultTheme.primaryColor;
    // Nếu là đối tượng Color, gọi toHexString
    if (typeof color.toHexString === "function") {
      return color.toHexString();
    }
    // Nếu đã là chuỗi hex, trả về trực tiếp
    return color;
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const themeData = {
        ...values,
        primaryColor: getColorHex(values.primaryColor),
        secondaryColor: getColorHex(values.secondaryColor),
      };
      await saveThemeConfig(themeData);
      message.success(t("saveSuccess") || "Lưu cấu hình giao diện thành công. Vui lòng reload để áp dụng.");
    } catch (error) {
      console.error("Failed to save theme config:", error);
      message.error(t("saveError") || "Không thể lưu cấu hình giao diện");
    } finally {
      setLoading(false);
    }
  };

  const previewStyle = {
    "--primary-color": getColorHex(form.getFieldValue("primaryColor")),
    "--secondary-color": getColorHex(form.getFieldValue("secondaryColor")),
    "--font-family": form.getFieldValue("fontFamily") || defaultTheme.fontFamily,
    "--heading-font-size": form.getFieldValue("headingFontSize") || defaultTheme.headingFontSize,
    "--text-font-size": form.getFieldValue("textFontSize") || defaultTheme.textFontSize,
  };

  return (
    <LayoutAdmin title={t("themeManagementTitle") || "Quản lý giao diện"}>
      <div className={styles.container}>
        <h2 className={styles.title}>{t("themeManagementTitle") || "Quản lý giao diện"}</h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={defaultTheme}
          className={styles.form}
        >
          <Form.Item
            name="primaryColor"
            label={t("primaryColor") || "Màu chính"}
            rules={[{ required: true, message: t("required") || "Vui lòng chọn màu chính" }]}
          >
            <ColorPicker format="hex" />
          </Form.Item>
          <Form.Item
            name="secondaryColor"
            label={t("secondaryColor") || "Màu phụ"}
            rules={[{ required: true, message: t("required") || "Vui lòng chọn màu phụ" }]}
          >
            <ColorPicker format="hex" />
          </Form.Item>
          <Form.Item
            name="fontFamily"
            label={t("fontFamily") || "Kiểu chữ"}
            rules={[{ required: true, message: t("required") || "Vui lòng chọn kiểu chữ" }]}
          >
            <Select
              options={[
                { value: "Inter, sans-serif", label: "Inter" },
                { value: "Roboto, sans-serif", label: "Roboto" },
                { value: "Open Sans, sans-serif", label: "Open Sans" },
                { value: "Lora, serif", label: "Lora" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="headingFontSize"
            label={t("headingFontSize") || "Cỡ chữ tiêu đề"}
            rules={[
              { required: true, message: t("required") || "Vui lòng nhập cỡ chữ tiêu đề" },
              {
                pattern: /^\d*\.?\d*(rem|px)$/,
                message: t("invalidFontSize") || "Vui lòng nhập giá trị hợp lệ (e.g., 2.5rem)",
              },
            ]}
          >
            <Input placeholder="e.g., 2.5rem" />
          </Form.Item>
          <Form.Item
            name="textFontSize"
            label={t("textFontSize") || "Cỡ chữ nội dung"}
            rules={[
              { required: true, message: t("required") || "Vui lòng nhập cỡ chữ nội dung" },
              {
                pattern: /^\d*\.?\d*(rem|px)$/,
                message: t("invalidFontSize") || "Vui lòng nhập giá trị hợp lệ (e.g., 1.1rem)",
              },
            ]}
          >
            <Input placeholder="e.g., 1.1rem" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t("save") || "Lưu cấu hình"}
            </Button>
          </Form.Item>
        </Form>
        <div style={previewStyle} className={styles.preview}>
          <h2 className={styles.previewTitle}>Tiêu đề mẫu</h2>
          <p className={styles.previewText}>Nội dung mẫu với cỡ chữ thông thường.</p>
          <Button type="primary" className={styles.previewButton}>
            Nút mẫu
          </Button>
        </div>
      </div>
    </LayoutAdmin>
  );
}