import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable React Compiler for production stability; re-enable after verifying compatibility
  // reactCompiler: true,
  async redirects() {
    return [
      {
        source: '/author/:slug',
        destination: '/writer/:slug',
        permanent: true,
      },
      {
        source: '/sanity',
        destination: '/studio',
        permanent: false,
      },
      // Normalize broken article slug artifact
      {
        source: '/article/from-vision-to-market-victory-the-s-blueprint-for-concept-commercialization',
        destination: '/article/from-vision-to-market-victory-the-blueprint-for-concept-commercialization',
        permanent: true,
      },
      {
        source: '/category/:cat/from-vision-to-market-victory-the-s-blueprint-for-concept-commercialization',
        destination: '/category/:cat/from-vision-to-market-victory-the-blueprint-for-concept-commercialization',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; img-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:; connect-src 'self' https: wss: https://cdn.sanity.io https://*.sanity.io wss://*.sanity.io https://*.vercel.app https://*.vercel.sh wss://*.vercel.app wss://*.vercel.sh; frame-ancestors 'self'",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value:
              "default-src 'self'; img-src 'self' https: data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:; connect-src 'self' https: wss: https://cdn.sanity.io https://*.sanity.io wss://*.sanity.io https://*.vercel.app https://*.vercel.sh wss://*.vercel.app wss://*.vercel.sh; frame-ancestors 'self'",
          },
        ],
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [65, 70, 75, 90],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2560],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'api.iconify.design',
      },
    ],
  },
  compiler: {
    // Strip console.* in production builds to reduce bundle noise
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
