import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import "../styles/accessibility.css";
import FocusManager from "@/components/FocusManager";
import dynamic from "next/dynamic";
import { Suspense } from "react";
// Defer non-critical client components to reduce initial JS via client wrapper
import LazyEntryLocale from "@/components/LazyEntryLocale";

const AdInterstitialV2 = dynamic(() => import("@/components/AdInterstitialV2"));
import { generateMetadata, generateStructuredData } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = generateMetadata({
  title: "C-Suite Magazine - Leadership, Innovation & Executive Insights",
  description: "A premium magazine for global CXOs featuring exclusive interviews, leadership insights, and business strategies from top executives worldwide.",
  keywords: ['CEO', 'CXO', 'leadership', 'business strategy', 'executive insights', 'innovation', 'management', 'corporate leadership', 'business transformation', 'digital transformation'],
  url: "https://csuitemagazine.global",
  type: "website"
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateStructuredData('organization', {});

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Performance: resource hints for critical origins */}
        {/* Google Search Console Verification */}
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta
            name="google-site-verification"
            content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION}
          />
        )}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://api.iconify.design" crossOrigin="" />
        <link rel="dns-prefetch" href="https://api.iconify.design" />
        {/* Fonts loaded via next/font to avoid render-blocking; remove external CSS links */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body
        className={`${playfair.variable} ${inter.variable} font-sans antialiased bg-white text-gray-900`}
      >
        {/* Focus management for keyboard vs mouse users */}
        <FocusManager />        {/* Entry popup for locale selection (client-only) */}
        <LazyEntryLocale />
        {/* Globally mounted interstitial ad (wrap in Suspense due to useSearchParams) */}
        <Suspense fallback={null}>
          <AdInterstitialV2 />
        </Suspense>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        {process.env.NEXT_PUBLIC_ENABLE_INSIGHTS === '1' ? <Analytics /> : null}
      </body>
    </html>
  );
}
