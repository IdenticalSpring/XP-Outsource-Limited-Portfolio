import { Card } from "antd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { about } from "@/data/data";
import styles from "./page.module.css";

export default function About() {
  return (
    <div>
      <Header />
      <div className={styles.container}>
        <h2>About XP OutSource</h2>
        <Card className={styles.card}>
          <p>{about.mission}</p>
          <p>
            We are committed to delivering cutting-edge technology solutions to
            drive global business success.
          </p>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
