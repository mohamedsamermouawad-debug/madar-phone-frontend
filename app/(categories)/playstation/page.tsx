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
  const title = `أجهزة بلايستيشن PlayStation وإكسسواراتها بالتقسيط | ${siteName}`;
  const description = `تسوق أجهزة بلايستيشن 5 (PS5) ويد التحكم والألعاب الأصلية بالتقسيط المريح وبدون فوائد في ${siteName}. شحن سريع وضمان معتمد.`;

  return {
    title,
    description,
    keywords: ["بلايستيشن 5", "PS5", "PlayStation 5", "سوني 5", "يد تحكم DualSense", "تقسيط بلايستيشن", siteName, "السعودية"],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/playstation`,
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
    alternates: { canonical: `${SITE_URL}/playstation` },
  };
}

const subCategories: SubCategoryCard[] = [
  { slug: "ps5-consoles", label: "أجهزة PS5", emoji: "🎮", href: "/playstation/ps5-consoles" },
  { slug: "controllers", label: "يد تحكم", emoji: "🎮", href: "/playstation/controllers" },
  { slug: "ps-accessories", label: "ملحقات بلايستيشن", emoji: "🎧", href: "/playstation/ps-accessories" },
];

const PS_CATEGORIES = ["ps5", "ps4", "xbox", "controller", "gaming-accessories"];

const filterFn = (p: Product) =>
  PS_CATEGORIES.includes(p.category?.toLowerCase() ?? "") ||
  p.category?.includes("بلايستيشن") ||
  p.category?.includes("سوني") ||
  false;

export default async function PlaystationPage() {
  const allProducts = await getAllProducts();
  const initialProducts = sortProducts(allProducts.filter(filterFn));

  const breadcrumbs = getBreadcrumbJsonLd([
    { name: "الرئيسية", url: "/" },
    { name: "بلايستيشن والألعاب", url: "/playstation" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <CategoryLandingClient
        title="بلايستيشن والألعاب"
        emoji="🎮"
        subCategories={subCategories}
        initialProducts={initialProducts}
      />
    </>
  );
}
