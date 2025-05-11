// src/components/Header.js
"use client";
import { useState, useEffect } from "react";
import { Menu, Button, Drawer } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MenuOutlined, SearchOutlined, DownOutlined } from "@ant-design/icons";
import { useTranslations, useLocale } from "next-intl";
import { setCookie } from "cookies-next";
import styles from "./Header.module.css";

export default function Header() {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();

  // Định nghĩa cờ và tên ngôn ngữ
  const languages = {
    en: {
      name: "English",
      flag: "🇺🇸"
    },
    vi: {
      name: "Tiếng Việt",
      flag: "🇻🇳"
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    
    // Đóng dropdown khi click ra ngoài
    const handleClickOutside = (e) => {
      if (!e.target.closest(`.${styles.languageDropdown}`)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleScrollTo = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setVisible(false);
    }
  };

  const handleLanguageChange = (value) => {
    if (value !== locale) {
      setCookie("NEXT_LOCALE", value);
      router.push(pathname.replace(`/${locale}`, `/${value}`));
      setDropdownOpen(false);
    }
  };

  const menuItems = [
    {
      key: "home",
      label:
        pathname === `/${locale}` ? (
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
              setVisible(false);
            }}
          >
            {t("home")}
          </a>
        ) : (
          <Link href={`/${locale}`}>{t("home")}</Link>
        ),
    },
    {
      key: "services",
      label:
        pathname === `/${locale}` ? (
          <a
            href="#services"
            onClick={(e) => {
              e.preventDefault();
              handleScrollTo("services");
            }}
          >
            {t("services")}
          </a>
        ) : (
          <Link href="/services">{t("services")}</Link>
        ),
    },
    {
      key: "about",
      label:
        pathname === `/${locale}` ? (
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              handleScrollTo("about");
            }}
          >
            {t("about")}
          </a>
        ) : (
          <Link href="/about">{t("about")}</Link>
        ),
    },
    {
      key: "contact",
      label:
        pathname === `/${locale}` ? (
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleScrollTo("contact");
            }}
          >
            {t("contact")}
          </a>
        ) : (
          <Link href="/contact">{t("contact")}</Link>
        ),
    },
  ];

  return (
    <div className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
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
              onClick={() =>
                pathname === `/${locale}`
                  ? handleScrollTo("contact")
                  : (window.location.href = `/${locale}/contact`)
              }
            >
              {t("getStarted")}
            </Button>
            
            {/* Cải thiện language dropdown */}
            <div className={styles.languageDropdown}>
              <div
                className={`${styles.dropdownTrigger} ${dropdownOpen ? styles.dropdownOpen : ''}`}
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
                      className={`${styles.dropdownItem} ${locale === lang ? styles.active : ''}`}
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
          onClick={() =>
            pathname === `/${locale}`
              ? handleScrollTo("contact")
              : (window.location.href = `/${locale}/contact`)
          }
        >
          {t("getStarted")}
        </Button>
        
        {/* Cải thiện mobile language dropdown */}
        <div className={styles.languageDropdown}>
          <div
            className={`${styles.dropdownTrigger} ${dropdownOpen ? styles.dropdownOpen : ''}`}
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
                  className={`${styles.dropdownItem} ${locale === lang ? styles.active : ''}`}
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