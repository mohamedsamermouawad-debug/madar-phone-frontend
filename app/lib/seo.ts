export const SITE_URL = "https://madarelectronic.com";
export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || "https://madar-phone-backend.vercel.app";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/android-chrome-512x512.png`;
export const SITE_NAME_DEFAULT = "مدار للإلكترونيات";
export const SITE_TAGLINE = "أفضل متجر إلكتروني للأجهزة بالتقسيط المريح في السعودية";

export const DEFAULT_KEYWORDS = [
  "مدار للإلكترونيات",
  "مدار",
  "Madar Electronics",
  "متجر مدار",
  "متجر إلكتروني سعودي",
  "أجهزة إلكترونية",
  "تقسيط جوالات",
  "تقسيط بدون فوائد",
  "تقسيط تابي وتمارا",
  "جوالات بالتقسيط",
  "شراء بالتقسيط في السعودية",
  "آيفون بالتقسيط",
  "iPhone 16 Pro Max",
  "iPhone 15 Pro Max",
  "سامسونج جالكسي",
  "Samsung Galaxy S24 Ultra",
  "لابتوبات بالتقسيط",
  "ساعات ذكية",
  "Apple Watch",
  "بلايستيشن 5",
  "PlayStation 5",
  "سماعات AirPods",
  "عروض الإلكترونيات السعودية",
  "توصيل سريع الرياض جدة الدمام",
  "ضمان معتمد",
];

export function getFullImageUrl(imagePath?: string | null): string {
  if (!imagePath) return DEFAULT_OG_IMAGE;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  // If it's a static image in public
  if (cleanPath.startsWith("/og-image") || cleanPath.startsWith("/logo") || cleanPath.startsWith("/android-chrome")) {
    return `${SITE_URL}${cleanPath}`;
  }
  return `${BACKEND_URL}${cleanPath}`;
}

export function getOrganizationJsonLd(company?: { nameAr?: string; details?: string; logo?: string; phone?: string; email?: string; address?: string }) {
  const name = company?.nameAr || SITE_NAME_DEFAULT;
  const logo = getFullImageUrl(company?.logo || "/logo.webp");

  return {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    "@id": `${SITE_URL}/#organization`,
    name,
    alternateName: ["Madar Electronics", "مدار", "متجر مدار"],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: logo,
      width: 512,
      height: 512,
    },
    image: DEFAULT_OG_IMAGE,
    description: company?.details || "متجر مدار للإلكترونيات - تسوق أحدث الجوالات، اللابتوبات، والساعات الذكية بالتقسيط المريح وبدون فوائد في جميع أنحاء المملكة العربية السعودية.",
    telephone: company?.phone || "+966599171457",
    email: company?.email || "info@madarelectronic.com",
    priceRange: "$$",
    currenciesAccepted: "SAR",
    paymentAccepted: "Cash, Credit Card, Mada, Apple Pay, Installment",
    address: {
      "@type": "PostalAddress",
      addressCountry: "SA",
      addressLocality: "Riyadh",
      streetAddress: company?.address || "المملكة العربية السعودية",
    },
    areaServed: {
      "@type": "Country",
      name: "Saudi Arabia",
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "SA",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 7,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
    },
  };
}

export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME_DEFAULT,
    alternateName: "Madar Electronics",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "ar-SA",
  };
}

export function getBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}
