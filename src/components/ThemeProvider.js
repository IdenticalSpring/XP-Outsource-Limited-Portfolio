// src/components/ThemeProvider.js
"use client";
import { useEffect } from "react";
import { fetchThemeConfig } from "@/src/lib/api";

export default function ThemeProvider({ children }) {
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const theme = await fetchThemeConfig();
        if (theme && Object.keys(theme).length > 0) {
          document.documentElement.style.setProperty("--primary-color", theme.primaryColor);
          document.documentElement.style.setProperty("--secondary-color", theme.secondaryColor);
          document.documentElement.style.setProperty("--font-family", theme.fontFamily);
          document.documentElement.style.setProperty("--heading-font-size", theme.headingFontSize);
          document.documentElement.style.setProperty("--text-font-size", theme.textFontSize);
        }
      } catch (error) {
        console.error("Failed to apply theme:", error);
      }
    };
    loadTheme();
  }, []);

  return <>{children}</>;
}