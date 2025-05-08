"use client";
import { useState, useEffect } from "react";
import { Menu, Button, Drawer } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";
import { MenuOutlined, SearchOutlined } from "@ant-design/icons";

export default function Header() {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

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
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollTo = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setVisible(false); // Close mobile drawer after clicking
    }
  };

  // Define menu items based on whether the user is on the Home page
  const menuItems = [
    {
      key: "home",
      label:
        pathname === "/" ? (
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
              setVisible(false);
            }}
          >
            Home
          </a>
        ) : (
          <Link href="/">Home</Link>
        ),
    },
    {
      key: "services",
      label:
        pathname === "/" ? (
          <a
            href="#services"
            onClick={(e) => {
              e.preventDefault();
              handleScrollTo("services");
            }}
          >
            Services
          </a>
        ) : (
          <Link href="/services">Services</Link>
        ),
    },
    {
      key: "about",
      label:
        pathname === "/" ? (
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              handleScrollTo("about");
            }}
          >
            About Us
          </a>
        ) : (
          <Link href="/about">About Us</Link>
        ),
    },
    {
      key: "contact",
      label:
        pathname === "/" ? (
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleScrollTo("contact");
            }}
          >
            Contact
          </a>
        ) : (
          <Link href="/contact">Contact</Link>
        ),
    },
  ];

  return (
    <div className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.headerContainer}>
        <div className={styles.logo}>
          <Link href="/">
            <span className={styles.logoText}>XP OutSource</span>
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
                pathname === "/"
                  ? handleScrollTo("contact")
                  : (window.location.href = "/contact")
              }
            >
              Get Started
            </Button>
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
        title="XP OutSource"
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
            pathname === "/"
              ? handleScrollTo("contact")
              : (window.location.href = "/contact")
          }
        >
          Get Started
        </Button>
      </Drawer>
    </div>
  );
}
