
export const menuConfig = [
  {
    key: "home",
    href: "#home", 
    link: "/[locale]", 
    translationKey: "home",
  },
  {
    key: "about",
    href: "#about",
    link: "/[locale]#about",
    translationKey: "about",
  },
  {
    key: "contact",
    href: "#contact",
    link: "/[locale]/contact",
    translationKey: "contact",
  },
  {
    key: "blog",
    href: "/[locale]/blog",
    link: "/[locale]/blog",
    translationKey: "blog",
  },
];

export const languages = {
  en: {
    name: "English",
    flag: "🇬🇧",
  },
  vi: {
    name: "Vietnamese",
    flag: "🇻🇳",
  },
};