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
    title: `الساعات الذكية | ${siteName}`,
    description: `تسوق أحدث الساعات الذكية بأفضل الأسعار وبالأقساط في ${siteName}.`,
    alternates: { canonical: `${SITE_URL}/smart-watches` },
  };
}

const subCategories: SubCategoryCard[] = [
  { slug: "smart-watches", label: "الساعات الذكية", emoji: "⌚", href: "/smart-watches/smart-watches" },
];

const filterFn = (p: Product) =>
  p.category?.includes("ساعات ذكية") ||
  p.category?.toLowerCase().includes("smart") ||
  false;

export default async function SmartWatchesPage() {
  const allProducts = await getAllProducts();
  const initialProducts = sortProducts(allProducts.filter(filterFn));

  return (
    <CategoryLandingClient
      title="الساعات الذكية"
      emoji="⌚"
      subCategories={subCategories}
      initialProducts={initialProducts}
    />
  );
}
