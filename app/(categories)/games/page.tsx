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
  const title = `ألعاب الفيديو والجيمينج | ${siteName}`;
  const description = `تسوق أحدث ألعاب بلايستيشن وإكس بوكس ونينتندو وإكسسوارات الألعاب بالتقسيط المريح بدون فوائد في ${siteName}.`;

  return {
    title,
    description,
    keywords: ["ألعاب بلايستيشن", "ألعاب PS5", "ألعاب PS4", "ألعاب إلكترونية", siteName, "السعودية"],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/games`,
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
    alternates: { canonical: `${SITE_URL}/games` },
  };
}

const subCategories: SubCategoryCard[] = [
  { slug: "ps5-games", label: "ألعاب PS5", emoji: "🎮", href: "/games/ps5-games" },
  { slug: "ps4-games", label: "ألعاب PS4", emoji: "🎮", href: "/games/ps4-games" },
];

const filterFn = (p: Product) =>
  p.category?.toLowerCase().includes("game") ||
  p.category?.includes("ألعاب") ||
  p.category?.includes("العاب") ||
  false;

export default async function GamesPage() {
  const allProducts = await getAllProducts();
  const initialProducts = sortProducts(allProducts.filter(filterFn));

  const breadcrumbs = getBreadcrumbJsonLd([
    { name: "الرئيسية", url: "/" },
    { name: "ألعاب الفيديو", url: "/games" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <CategoryLandingClient
        title="ألعاب الفيديو"
        emoji="🎮"
        subCategories={subCategories}
        initialProducts={initialProducts}
      />
    </>
  );
}
