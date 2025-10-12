import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'conjugate-filestore.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.leonardo.ai',
      },
      {
        protocol: 'https',
        hostname: 'conjugate-filestore.s3.ap-southeast-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.parallaximag.gr',
      },
      {
        protocol: 'https',
        hostname: '**.bbc.com',
      },
      {
        protocol: 'https',
        hostname: '**.medium.com',
      },
      {
        protocol: 'https',
        hostname: '**.wikipedia.org',
      },
      {
        protocol: 'https',
        hostname: '**.wp.com',
      },
      {
        protocol: 'https',
        hostname: '**.wordpress.com',
      },
      // Allow other common news/blog sites
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  }
};

export default nextConfig;
