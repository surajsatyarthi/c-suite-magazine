import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
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
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://*.sentry.io",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.sanity.io https://*.sentry.io https://www.googletagmanager.com",
              "frame-ancestors 'none'",
            ].join('; '),
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
    qualities: [85, 90, 95], // PREMIUM: High quality only
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
    removeConsole: false, // process.env.NODE_ENV === 'production',
  },
};

export default withSentryConfig(nextConfig, {
  org: "csuite-x2",
  project: "ceo-magazine",
  silent: !process.env.CI,
});
