require('dotenv').config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    // Will be available on both server and client
    HOSTNAME: 'localhost',
    BACKEND_PORT: process.env.BACKEND_PORT ? process.env.BACKEND_PORT : '',
    TESTNET_MODE: process.env.TESTNET_MODE === 'true',

    BITBADGES_API_KEY: process.env.BITBADGES_API_KEY,
    WC_PROJECT_ID: process.env.WC_PROJECT_ID,
    CLIENT_ID: process.env.CLIENT_ID,
    REDIRECT_URI: process.env.REDIRECT_URI
    // BITBADGES_API_URL: 'https://localhost:3001'
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

module.exports = nextConfig;
