import type { Metadata } from "next";
import CategoryLandingClient from "../../components/CategoryLandingClient";
import type { SubCategoryCard } from "../../components/CategoryLandingClient";
import type { Product } from "../../components/products/types";
import { getAllProducts } from "../../lib/productsCache";
import { sortProducts } from "../../lib/sortProducts";
import { getCompanyData } from "../../lib/companyCache";
import { SITE_URL, DEFAULT_OG_IMAGE, getBreadcrumbJsonLd } from "../../lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompanyData();
  const siteName = company?.nameAr || "مدار للإلكترونيات";
  const title = `السماعات والصوتيات الأصلية | ${siteName}`;
  const description = `تسوق سماعات أبل إيربودز AirPods وسماعات الرأس ومكبرات الصوت الأصلية بالتقسيط المريح بدون فوائد في ${siteName}.`;

  return {
    title,
    description,
    keywords: ["سماعات ايربودز", "AirPods Max", "سماعات بلوتوث", "مكبرات صوت", siteName, "السعودية"],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/audio`,
      title,
      description,
      siteName,
      locale: "ar_SA",
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${title} - ${siteName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    alternates: { canonical: `${SITE_URL}/audio` },
  };
}

const subCategories: SubCategoryCard[] = [
  { slug: "airpods", label: "إيربودز", emoji: "🎧", href: "/audio/airpods" },
  { slug: "headphones", label: "سماعات رأس", emoji: "🎧", href: "/audio/headphones" },
  { slug: "earphones", label: "سماعات أذن", emoji: "🎵", href: "/audio/earphones" },
  { slug: "speakers", label: "مكبرات صوت", emoji: "🔊", href: "/audio/speakers" },
];

const filterFn = (p: Product) =>
  p.category?.toLowerCase().includes("audio") ||
  p.category?.toLowerCase().includes("headphone") ||
  p.category?.toLowerCase().includes("airpod") ||
  p.category?.toLowerCase().includes("speaker") ||
  p.category?.includes("سماعات") ||
  p.category?.includes("صوتيات") ||
  p.category?.includes("مكبرات") ||
  false;

export default async function AudioPage() {
  const allProducts = await getAllProducts();
  const initialProducts = sortProducts(allProducts.filter(filterFn));

  const breadcrumbs = getBreadcrumbJsonLd([
    { name: "الرئيسية", url: "/" },
    { name: "الصوتيات والسماعات", url: "/audio" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <CategoryLandingClient
        title="الصوتيات والسماعات"
        emoji="🎧"
        subCategories={subCategories}
        initialProducts={initialProducts}
      />
    </>
  );
}
