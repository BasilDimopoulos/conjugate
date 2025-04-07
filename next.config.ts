import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx'],
  images: {
    domains: ['conjugate-filestore.s3.amazonaws.com', 'cdn.leonardo.ai'],
  }
};

export default nextConfig;
