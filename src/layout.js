import { ConfigProvider } from "antd";
import "./globals.css";

export const metadata = {
  title: "XP OutSource",
  description: "Technology outsourcing solutions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#1890ff",
              borderRadius: 4,
            },
          }}
        >
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
