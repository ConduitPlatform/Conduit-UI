const result = require('dotenv').config();
/** @type {import('next').NextConfig} */

const nextConfig = {
  // reactStrictMode: true,
  env: result.parsed,
};

module.exports = nextConfig;
