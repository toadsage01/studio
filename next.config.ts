import type { NextConfig } from 'next';

const nextConfig = {
  /* config options here */
  // Use an alternate dist directory to bypass a locked .next folder on Windows
  distDir: '.next-dev',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Silence multi-lockfile workspace root warning by explicitly setting Turbo's root
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
} satisfies NextConfig;

export default nextConfig;
