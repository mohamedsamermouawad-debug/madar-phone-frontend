import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import Footer from "./components/Footer";
import { getCompanyData } from "./lib/companyCache";
import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  DEFAULT_KEYWORDS,
  getOrganizationJsonLd,
  getWebsiteJsonLd,
} from "./lib/seo";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#04454A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const c = await getCompanyData();

  const siteName = c.nameAr || "مدار للإلكترونيات";
  const titleDefault = `${siteName} | أفضل متجر إلكتروني للأجهزة بالتقسيط المريح في السعودية`;
  const description =
    c.details ||
    "متجر مدار للإلكترونيات - تسوق أحدث الجوالات، اللابتوبات، الساعات الذكية والأجهزة الإلكترونية بالتقسيط المريح بدون فوائد في السعودية. شحن سريع لجميع مناطق المملكة وضمان معتمد على جميع المنتجات.";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: titleDefault,
      template: `%s | ${siteName} - متجر معتمد`,
    },
    description,
    keywords: DEFAULT_KEYWORDS,
    authors: [{ name: siteName, url: SITE_URL }],
    creator: siteName,
    publisher: siteName,
    formatDetection: {
      telephone: true,
      email: true,
      address: true,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "ar_SA",
      url: SITE_URL,
      siteName,
      title: titleDefault,
      description,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 512,
          height: 512,
          alt: `${siteName} - متجر الأجهزة الإلكترونية بالتقسيط المريح`,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description,
      images: [DEFAULT_OG_IMAGE],
      creator: "@madar_electronics",
      site: "@madar_electronics",
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/site.webmanifest",
    alternates: {
      canonical: SITE_URL,
      languages: { "ar-SA": SITE_URL },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || "",
    },
    category: "electronics",
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const company = await getCompanyData();
  const orgSchema = getOrganizationJsonLd(company);
  const webSiteSchema = getWebsiteJsonLd();

  return (
    <html lang="ar" dir="rtl">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body className={`${cairo.className} antialiased`} suppressHydrationWarning>
        <ClientLayout footer={<Footer />}>{children}</ClientLayout>
      </body>
    </html>
  );
}
