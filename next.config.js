const withNextIntl = require('next-intl/plugin')(
  './i18n.js'
);

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withNextIntl(nextConfig);
