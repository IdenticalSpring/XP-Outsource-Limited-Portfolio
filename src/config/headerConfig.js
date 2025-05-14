// src/config/headerConfig.js
export const languages = {
  en: { name: "English", flag: "🇺🇸" },
  vi: { name: "Tiếng Việt", flag: "🇻🇳" },
};

export const menuConfig = [
  { key: "home", link: "/[locale]", translationKey: "menu.home" },
  { key: "about", link: "/[locale]#about", translationKey: "menu.about" },
  { key: "blog", link: "/[locale]#blog", translationKey: "menu.blog" },
  { key: "members", link: "/[locale]#members", translationKey: "menu.members" },
  { key: "contact", link: "/[locale]#contact", translationKey: "menu.contact" },
];