import { type NextConfig } from "next";
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
        source: '/studio',
        destination: 'https://ceo-magazine-2f93fcy8.sanity.studio',
        permanent: true,
      },
      {
        source: '/sanity',
        destination: 'https://ceo-magazine-2f93fcy8.sanity.studio',
        permanent: true,
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
      // Executive salaries URL rename (SEO alignment)
      {
        source: '/executives',
        destination: '/executive-salaries',
        permanent: true,
      },
      {
        source: '/executives/:slug',
        destination: '/executive-salaries/:slug',
        permanent: true,
      },
      // CSA URL Structure Optimization - Old long slugs to new short slugs
      {
        source: '/csa/rich-stinson-visionary-leader-powering-america-s-electrification-future',
        destination: '/csa/rich-stinson-ceo-southwire',
        permanent: true,
      },
      {
        source: '/csa/stella-ambrose-visionary-trailblazer-in-sustainable-palm-oil-leadership',
        destination: '/csa/stella-ambrose-deputy-ceo-sawit-kinabalu',
        permanent: true,
      },
      {
        source: '/csa/leading-indias-energy-transition-indianoil-chairman-shrikant-madhav-vaidya-on-building-a-sustainable-future',
        destination: '/csa/shrikant-vaidya-chairman-indianoil',
        permanent: true,
      },
      {
        source: '/article/powering-the-future-andy-jassys-strategic-vision-for-amazons-energy-driven-expansion',
        destination: '/category/innovation/andy-jassy',
        permanent: true,
      },
      {
        source: '/article/andy-jassy',
        destination: '/category/innovation/andy-jassy',
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
          // { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://*.sentry.io",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https: wss: https://core.sanity-cdn.com https://cdn.sanity.io https://*.sanity.io wss://*.sanity.io https://*.sanity.studio wss://*.sanity.studio https://*.vercel.app https://*.vercel.sh wss://*.vercel.app wss://*.vercel.sh https://*.sentry.io https://www.googletagmanager.com",
              "frame-src 'self' https://*.sanity.studio https://*.sanity.io",
              "frame-ancestors 'self' https://ceo-magazine-2f93fcy8.sanity.studio https://*.sanity.studio https://*.sanity.io",
            ].join('; '),
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value:
              "default-src 'self'; img-src 'self' https: data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:; connect-src 'self' https: wss: https://cdn.sanity.io https://*.sanity.io wss://*.sanity.io https://*.sanity.studio wss://*.sanity.studio https://studio.csuitemagazine.global wss://studio.csuitemagazine.global https://*.vercel.app https://*.vercel.sh wss://*.vercel.app wss://*.vercel.sh; frame-src 'self' https://*.sanity.studio https://*.sanity.io https://studio.csuitemagazine.global; frame-ancestors 'self'",
          },
        ],
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [85, 88, 90, 95], // PREMIUM: include 88 to match usage
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
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
    ],
  },
  compiler: {
    // Strip console.* in production builds to reduce bundle noise
    removeConsole: process.env.NODE_ENV === 'production',
  },
  turbopack: {},
};

export default withSentryConfig(nextConfig, {
  org: "csuite-x2",
  project: "ceo-magazine",
  silent: !process.env.CI,
});
