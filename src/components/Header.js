// src/components/Header.js
"use client";
import { useState, useEffect } from "react";
import { Menu, Button, Drawer } from "antd";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MenuOutlined, SearchOutlined, DownOutlined } from "@ant-design/icons";
import { useTranslations, useLocale } from "next-intl";
import { setCookie } from "cookies-next";
import styles from "./Header.module.css";
import { languages, menuConfig } from "../config/headerConfig";

export default function Header() {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const locale = useLocale();

  // Kiểm tra xem có phải trang chủ không
  const isHomePage = pathname === `/${locale}`;

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };

    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (e) => {
      if (!e.target.closest(`.${styles.languageDropdown}`)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    // Kiểm tra query parameter 'section' để cuộn sau khi chuyển trang
    const sectionId = searchParams.get("section");
    if (isHomePage && sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerHeight = document.querySelector(`.${styles.header}`)?.offsetHeight || 0;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - headerHeight,
          behavior: "smooth",
        });
        // Xóa class highlight từ tất cả section trước đó
        document.querySelectorAll(".highlight").forEach((el) => el.classList.remove("highlight"));
        // Thêm class highlight cho section hiện tại
        element.classList.add("highlight");
      }
      // Xóa query parameter sau khi cuộn
      const newUrl = `${window.location.pathname}`;
      window.history.replaceState(null, "", newUrl);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [searchParams, isHomePage]);

  const handleScrollTo = (sectionId) => {
    if (isHomePage) {
      // Nếu đang ở trang chủ, cuộn trực tiếp
      const element = document.getElementById(sectionId);
      if (element) {
        const headerHeight = document.querySelector(`.${styles.header}`)?.offsetHeight || 0;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - headerHeight,
          behavior: "smooth",
        });
        document.querySelectorAll(".highlight").forEach((el) => el.classList.remove("highlight"));
        element.classList.add("highlight");
      }
    } else {
      // Nếu không ở trang chủ, chuyển về trang chủ với query parameter
      router.push(`/${locale}?section=${sectionId}`);
    }
    setVisible(false);
  };

  const handleLanguageChange = (value) => {
    if (value !== locale) {
      setCookie("NEXT_LOCALE", value);
      const newPathname = pathname.replace(`/${locale}`, `/${value}`);
      router.push(newPathname);
      setDropdownOpen(false);
    }
  };

  const menuItems = menuConfig.map((item) => ({
    key: item.key,
    label: (
      <Link
        href={item.link.replace("[locale]", locale)}
        onClick={(e) => {
          // Nếu đang ở trang chủ và mục là section (about, blog, contact), cuộn thay vì chuyển hướng
          if (isHomePage && (item.key === "about" || item.key === "blog" || item.key === "contact")) {
            e.preventDefault();
            handleScrollTo(item.key);
          } else if (!isHomePage && (item.key === "about" || item.key === "blog" || item.key === "contact")) {
            // Nếu ở trang khác, chuyển về trang chủ với section
            e.preventDefault();
            handleScrollTo(item.key);
          }
          setVisible(false);
        }}
      >
        {t(item.translationKey)}
      </Link>
    ),
  }));

  return (
    <div
      className={`${styles.header} ${scrolled ? styles.scrolled : ""} ${
        !isHomePage ? styles.notHomePage : ""
      }`}
    >
      <div className={styles.headerContainer}>
        <div className={styles.logo}>
          <Link href={`/${locale}`}>
            <span className={styles.logoText}>{t("logo")}</span>
          </Link>
        </div>

        <div className={styles.desktopMenu}>
          <Menu mode="horizontal" items={menuItems} className={styles.menu} />
          <div className={styles.headerActions}>
            <Button className={styles.searchButton} icon={<SearchOutlined />} />
            <Button
              type="primary"
              className={styles.contactButton}
              onClick={() => handleScrollTo("contact")}
            >
              {t("getStarted")}
            </Button>

            <div className={styles.languageDropdown}>
              <div
                className={`${styles.dropdownTrigger} ${dropdownOpen ? styles.dropdownOpen : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(!dropdownOpen);
                }}
              >
                <span className={styles.dropdownFlag}>{languages[locale].flag}</span>
                <span>{languages[locale].name}</span>
                <DownOutlined className={styles.dropdownArrow} />
              </div>

              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  {Object.keys(languages).map((lang) => (
                    <div
                      key={lang}
                      className={`${styles.dropdownItem} ${locale === lang ? styles.active : ""}`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      <span className={styles.flag}>{languages[lang].flag}</span>
                      <span>{languages[lang].name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.mobileMenuButton}>
          <Button
            icon={<MenuOutlined />}
            onClick={() => setVisible(true)}
            className={styles.menuButton}
          />
        </div>
      </div>

      <Drawer
        title={t("logo")}
        placement="right"
        onClose={() => setVisible(false)}
        open={visible}
        className={styles.mobileDrawer}
      >
        <Menu mode="vertical" items={menuItems} className={styles.drawerMenu} />
        <Button
          type="primary"
          block
          className={styles.drawerContactBtn}
          onClick={() => handleScrollTo("contact")}
        >
          {t("getStarted")}
        </Button>

        <div className={styles.languageDropdown}>
          <div
            className={`${styles.dropdownTrigger} ${dropdownOpen ? styles.dropdownOpen : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(!dropdownOpen);
            }}
          >
            <span className={styles.dropdownFlag}>{languages[locale].flag}</span>
            <span>{languages[locale].name}</span>
            <DownOutlined className={styles.dropdownArrow} />
          </div>

          {dropdownOpen && (
            <div className={styles.dropdownMenu}>
              {Object.keys(languages).map((lang) => (
                <div
                  key={lang}
                  className={`${styles.dropdownItem} ${locale === lang ? styles.active : ""}`}
                  onClick={() => handleLanguageChange(lang)}
                >
                  <span className={styles.flag}>{languages[lang].flag}</span>
                  <span>{languages[lang].name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}