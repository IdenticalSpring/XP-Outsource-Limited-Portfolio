// src/config/slugs.js
export const SLUGS_CONFIG = {
  banners: [
    {
      slug: "contact-cta-banner",
      key: "contactCtaBanner",
      isMainBanner: false,
      titleKey: "contactCtaBannerTitle", 
    },
    // Có thể thêm các banner khác, ví dụ:
    // {
    //   slug: "home-hero-banner",
    //   key: "homeHeroBanner",
    //   isMainBanner: true,
    //   titleKey: "homeHeroBannerTitle",
    // },
  ],
  contacts: [
    {
      slug: "main-contact",
      key: "mainContact",
      titleKey: "contactInfoTitle",
      isPrimary: true,
      order: 1,
    },
    {
      slug: "secondary-contact-1",
      key: "secondaryContact1",
      titleKey: "secondaryContactTitle1",
      isPrimary: false,
      order: 2,
    },
    {
      slug: "secondary-contact-2",
      key: "secondaryContact2",
      titleKey: "secondaryContactTitle2",
      isPrimary: false,
      order: 3,
    },
  ].sort((a, b) => a.order - b.order),
};