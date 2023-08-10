/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MEXC_API_KEY: process.env.MEXC_API_KEY,
    MEXC_API_SECRET: process.env.MEXC_API_SECRET,
    MEXC_API_URL: process.env.MEXC_API_URL,
  },
};

module.exports = nextConfig;
