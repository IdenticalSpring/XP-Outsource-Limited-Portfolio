import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaInstagram,
  FaGithub,
} from "react-icons/fa";

export const socialLinks = [
  {
    id: 'facebook',
    name: 'Facebook',
    url: 'https://facebook.com/xpoutsource',
    icon: FaFacebookF
  },
  {
    id: 'twitter',
    name: 'Twitter',
    url: 'https://twitter.com/xpoutsource',
    icon: FaTwitter
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://linkedin.com/company/xpoutsource',
    icon: FaLinkedinIn
  },
  {
    id: 'youtube',
    name: 'YouTube',
    url: 'https://youtube.com/c/xpoutsource',
    icon: FaYoutube
  },
  {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://instagram.com/xpoutsource',
    icon: FaInstagram
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com/xpoutsource',
    icon: FaGithub
  }
];

export const footerLinks = {
  company: [
    { key: 'home', translationKey: 'home', section: 'home' },
    { key: 'about', translationKey: 'about', section: 'about' },
    { key: 'blog', translationKey: 'blogTitle', section: 'blog' },
    { key: 'members', translationKey: 'teamTitle', section: 'members' },
    { key: 'contact', translationKey: 'contact', section: 'contact' }
  ],
  legalLinks: [
    { key: 'privacy', translationKey: 'privacyPolicyTitle', path: 'privacy-policy' },
    { key: 'terms', translationKey: 'termsOfServiceTitle', path: 'terms-of-service' },
    { key: 'sitemap', translationKey: 'sitemapTitle', path: 'sitemap' }
  ]
};