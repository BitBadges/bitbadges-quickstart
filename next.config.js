/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    // Will be available on both server and client
    HOSTNAME: 'bitbadges.io',
    BACKEND_PORT: process.env.BACKEND_PORT ? process.env.BACKEND_PORT : '',
    MAINNET: process.env.MAINNET === 'true' ? true : false,
    BITBADGES_API_KEY: process.env.BITBADGES_API_KEY,
    WC_PROJECT_ID: process.env.WC_PROJECT_ID,
    BITBADGES_API_URL: 'https://localhost:3001'
  },
  transpilePackages: [
    'antd',
    '@ant-design',
    'rc-util',
    'rc-pagination',
    'rc-picker',
    'rc-notification',
    'rc-tooltip',
    'rc-tree',
    'rc-table',
    '@mattrglobal/bbs-signatures',
    '@mattrglobal/node-bbs-signatures',
    '@trevormil/bbs-signatures'
  ]
};

require('dotenv').config();

module.exports = nextConfig;
