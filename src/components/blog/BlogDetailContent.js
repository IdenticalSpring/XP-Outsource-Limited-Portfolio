import { Card } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import BackToTopButton from "../BackToTopButton";
import { fetchBlog } from "../../lib/api";
import styles from "../../../app/[locale]/blog/[slug]/page.module.css";

export default async function BlogDetailContent({ locale, slug }) {
  const t = await getTranslations({ locale });
  const blog = await fetchBlog(locale, slug);

  if (!blog || !blog.translations || blog.translations.length === 0) {
    return <p>{t("blogNotFound")}</p>;
  }

  const translation =
    blog.translations.find((t) => t.language === locale) || blog.translations[0];

  if (!translation || !translation.title) {
    return <p>{t("blogNotFound")}</p>;
  }

  return (
    <>
      <div className={styles.linkWrapper}>
        <Link
          href={`/${locale}#blogs`}
          className={styles.backToBlogsBtn}
          style={{ textDecoration: "none" }}
        >
          <ArrowLeftOutlined /> {t("backToBlogs")}
        </Link>
      </div>
      <Card
        title={translation.title}
        cover={
          blog.image && (
            <img
              src={blog.image}
              alt={blog.altText || translation.title}
              style={{ maxHeight: 400, objectFit: "cover", borderRadius: "8px 8px 0 0" }}
            />
          )
        }
      >
        <div dangerouslySetInnerHTML={{ __html: translation.content }} />
      </Card>
      <BackToTopButton />
    </>
  );
}