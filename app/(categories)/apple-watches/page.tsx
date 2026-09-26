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
  const title = `ساعات أبل الذكية (Apple Watch) بالتقسيط | ${siteName}`;
  const description = `تسوق أحدث ساعات أبل Apple Watch Ultra و Series و SE بالتقسيط المريح بدون فوائد في ${siteName}. شحن سريع وضمان معتمد.`;

  return {
    title,
    description,
    keywords: ["ساعات أبل", "Apple Watch", "ابل واتش الترا", "Apple Watch Ultra", "Apple Watch Series", "تقسيط ساعات", siteName, "السعودية"],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/apple-watches`,
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
    alternates: { canonical: `${SITE_URL}/apple-watches` },
  };
}

const subCategories: SubCategoryCard[] = [
  { slug: "apple-watch-ultra", label: "أبل واتش ألترا", emoji: "⌚", href: "/apple-watches/apple-watch-ultra" },
  { slug: "apple-watch-series", label: "أبل واتش سيريس", emoji: "⌚", href: "/apple-watches/apple-watch-series" },
  { slug: "apple-watch-se", label: "أبل واتش SE", emoji: "⌚", href: "/apple-watches/apple-watch-se" },
];

const filterFn = (p: Product) =>
  p.category?.includes("ساعات ابل") ||
  p.category?.toLowerCase().includes("apple watch") ||
  (p.category?.toLowerCase().includes("watch") && p.brand?.toLowerCase().includes("apple")) ||
  false;

export default async function AppleWatchesPage() {
  const allProducts = await getAllProducts();
  const initialProducts = sortProducts(allProducts.filter(filterFn));

  const breadcrumbs = getBreadcrumbJsonLd([
    { name: "الرئيسية", url: "/" },
    { name: "ساعات أبل", url: "/apple-watches" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <CategoryLandingClient
        title="ساعات أبل"
        emoji="⌚"
        subCategories={subCategories}
        initialProducts={initialProducts}
      />
    </>
  );
}
