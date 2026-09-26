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
    title: `الأجهزة اللوحية والآيباد | ${siteName}`,
    description: `تسوق أجهزة الآيباد والتابلت بأفضل الأسعار وبالتقسيط المريح في ${siteName}.`,
    alternates: { canonical: `${SITE_URL}/tablets` },
  };
}

const subCategories: SubCategoryCard[] = [
  { slug: "ipad-pro", label: "آيباد برو", emoji: "📱", href: "/tablets/ipad-pro" },
  { slug: "ipad-air", label: "آيباد إير", emoji: "💨", href: "/tablets/ipad-air" },
  { slug: "ipad-mini", label: "آيباد ميني", emoji: "🔹", href: "/tablets/ipad-mini" },
  { slug: "ipad", label: "آيباد عادي", emoji: "📲", href: "/tablets/ipad" },
  { slug: "samsung-tab", label: "تابلت سامسونج", emoji: "🤖", href: "/tablets/samsung-tab" },
];

const filterFn = (p: Product) =>
  p.category?.toLowerCase().includes("tablet") ||
  p.category?.toLowerCase().includes("ipad") ||
  p.category?.includes("ايباد") ||
  p.category?.includes("آيباد") ||
  p.category?.includes("الأجهزة اللوحية") ||
  p.category?.includes("ايبادات") ||
  false;

export default async function TabletsPage() {
  const allProducts = await getAllProducts();
  const initialProducts = sortProducts(allProducts.filter(filterFn));

  return (
    <CategoryLandingClient
      title="الأجهزة اللوحية"
      emoji="📱"
      subCategories={subCategories}
      initialProducts={initialProducts}
    />
  );
}
