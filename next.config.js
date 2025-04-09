const result = require('dotenv').config();
/** @type {import('next').NextConfig} */

const nextConfig = {
  // reactStrictMode: true,
  env: result.parsed,
  output: 'standalone',
};

module.exports = nextConfig;
