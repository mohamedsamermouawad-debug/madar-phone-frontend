import type { Metadata } from "next";
import CategoryLandingClient from "../../components/CategoryLandingClient";
import type { SubCategoryCard } from "../../components/CategoryLandingClient";
import type { Product } from "../../components/products/types";
import { getAllProducts } from "../../lib/productsCache";
import { sortProducts } from "../../lib/sortProducts";
import { getCompanyData } from "../../lib/companyCache";

const SITE_URL = "https://madar-electronics.com";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompanyData();
  const siteName = company.nameAr || "مدار للإلكترونيات";
  return {
    title: `ساعات أبل | ${siteName}`,
    description: `تسوق أحدث ساعات أبل ووتش بأفضل الأسعار وبالتقسيط المريح في ${siteName}.`,
    alternates: { canonical: `${SITE_URL}/apple-watches` },
  };
}

const subCategories: SubCategoryCard[] = [
  { slug: "series-10", label: "آبل ووتش سيريس 10", emoji: "⌚", href: "/apple-watches/series-10" },
  { slug: "series-9", label: "آبل ووتش سيريس 9", emoji: "⌚", href: "/apple-watches/series-9" },
  { slug: "ultra", label: "آبل ووتش الترا", emoji: "🏔️", href: "/apple-watches/ultra" },
  { slug: "se", label: "آبل ووتش SE", emoji: "✨", href: "/apple-watches/se" },
];

const filterFn = (p: Product) =>
  p.category?.toLowerCase().includes("watch") ||
  p.category?.includes("ساعات ابل") ||
  p.category?.includes("ساعات أبل") ||
  p.category?.includes("apple watch") ||
  false;

export default async function AppleWatchesPage() {
  const allProducts = await getAllProducts();
  const initialProducts = sortProducts(allProducts.filter(filterFn));

  return (
    <CategoryLandingClient
      title="ساعات أبل"
      emoji="⌚"
      subCategories={subCategories}
      initialProducts={initialProducts}
    />
  );
}
