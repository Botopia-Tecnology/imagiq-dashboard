import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https://imagiq-backend-production.up.railway.app https://www.clarity.ms https://*.clarity.ms https://scripts.clarity.ms",
              "connect-src 'self' http://localhost:* https://imagiq-backend-production.up.railway.app https://www.clarity.ms https://*.clarity.ms https://c.clarity.ms https://res.cloudinary.com https://*.cloudinary.com",
              "img-src 'self' data: blob: https: http://localhost:* https://www.clarity.ms https://*.clarity.ms https://res.cloudinary.com https://*.cloudinary.com",
              "media-src 'self' blob: data: https://res.cloudinary.com https://*.cloudinary.com http://localhost:*",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "frame-src 'self' *",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
