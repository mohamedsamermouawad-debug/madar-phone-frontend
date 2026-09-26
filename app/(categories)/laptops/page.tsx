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
  const title = `اللابتوبات وأجهزة الكمبيوتر المحمولة بالتقسيط | ${siteName}`;
  const description = `تسوق أفضل أجهزة اللابتوب ماك بوك MacBook، لابتوبات ديل، إتش بي، لينوفو بالتقسيط المريح بدون فوائد في ${siteName}.`;

  return {
    title,
    description,
    keywords: ["لابتوبات بالتقسيط", "ماك بوك", "MacBook Pro", "MacBook Air", "لابتوب قيمنق", "لابتوب للدراسة", siteName, "السعودية"],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/laptops`,
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
    alternates: { canonical: `${SITE_URL}/laptops` },
  };
}

const subCategories: SubCategoryCard[] = [
  { slug: "macbook-pro", label: "ماك بوك برو", emoji: "💻", href: "/laptops/macbook-pro" },
  { slug: "macbook-air", label: "ماك بوك إير", emoji: "💻", href: "/laptops/macbook-air" },
];

const filterFn = (p: Product) =>
  p.category?.toLowerCase().includes("laptop") ||
  p.category?.toLowerCase().includes("macbook") ||
  p.category?.includes("لابتوب") ||
  p.category?.includes("كمبيوتر محمول") ||
  p.category?.includes("ماك بوك") ||
  false;

export default async function LaptopsPage() {
  const allProducts = await getAllProducts();
  const initialProducts = sortProducts(allProducts.filter(filterFn));

  const breadcrumbs = getBreadcrumbJsonLd([
    { name: "الرئيسية", url: "/" },
    { name: "أجهزة اللابتوب", url: "/laptops" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <CategoryLandingClient
        title="أجهزة اللابتوب"
        emoji="💻"
        subCategories={subCategories}
        initialProducts={initialProducts}
      />
    </>
  );
}
