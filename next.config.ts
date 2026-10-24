import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/database/queries',
        destination: '/database/queries/new',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
