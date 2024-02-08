// const removeImports = require('next-remove-imports')();

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
    },
};

require('dotenv').config();

module.exports = nextConfig;
