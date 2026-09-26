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
    title: `أجهزة صوت وسماعات | ${siteName}`,
    description: `تسوق سماعات أبل وأجهزة الصوت بأفضل الأسعار في ${siteName}. شحن سريع وضمان معتمد.`,
    alternates: { canonical: `${SITE_URL}/audio` },
  };
}

const subCategories: SubCategoryCard[] = [
  { slug: "airpods-pro", label: "سماعات أبل", emoji: "🎧", href: "/audio/airpods-pro" },
  { slug: "airpods-max", label: "سماعات سبيكر", emoji: "🔊", href: "/audio/airpods-max" },
  { slug: "samsung-buds", label: "سماعات متنوعة", emoji: "🎵", href: "/audio/samsung-buds" },
];

const filterFn = (p: Product) =>
  p.category?.includes("سماعات ابل") ||
  p.category?.includes("سماعات أبل") ||
  p.category === "سماعات" ||
  p.category?.toLowerCase() === "speaker" ||
  p.category?.toLowerCase() === "earbuds" ||
  p.subCategory?.includes("سماعات") ||
  p.subCategory === "هيدفون" ||
  false;

export default async function AudioPage() {
  const allProducts = await getAllProducts();
  const initialProducts = sortProducts(allProducts.filter(filterFn));

  return (
    <CategoryLandingClient
      title="أجهزة صوت و سماعات"
      emoji="🎧"
      subCategories={subCategories}
      initialProducts={initialProducts}
    />
  );
}
