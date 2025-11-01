import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import "../styles/accessibility.css";
import RevealController from "@/components/RevealController";
import FocusManager from "@/components/FocusManager";
import { generateMetadata, generateStructuredData } from "@/lib/seo";

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
        <FocusManager />
        {/* Global IntersectionObserver to reveal elements with .reveal */}
        <RevealController />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
