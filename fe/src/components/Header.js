import { Menu } from "antd";
import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  const items = [
    { key: "home", label: <Link href="/">Home</Link> },
    { key: "about", label: <Link href="/about">About</Link> },
    { key: "services", label: <Link href="/services">Services</Link> },
    { key: "contact", label: <Link href="/contact">Contact</Link> },
  ];

  return (
    <div className={styles.header}>
      <div className={styles.logo}>XP OutSource</div>
      <Menu mode="horizontal" items={items} className={styles.menu} />
    </div>
  );
}
