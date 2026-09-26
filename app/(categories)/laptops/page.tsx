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
    title: `لابتوبات وشاشات | ${siteName}`,
    description: `تسوق أجهزة ماك بوك وشاشات ولابتوبات بأفضل الأسعار وبالتقسيط المريح في ${siteName}.`,
    alternates: { canonical: `${SITE_URL}/laptops` },
  };
}

const subCategories: SubCategoryCard[] = [
  { slug: "macbook-pro", label: "ماك بوك برو", emoji: "💻", href: "/laptops/macbook-pro" },
  { slug: "macbook-air", label: "ماك بوك إير", emoji: "🌬️", href: "/laptops/macbook-air" },
  { slug: "samsung-monitors", label: "شاشات سامسونج", emoji: "🖥️", href: "/laptops/samsung-monitors" },
  { slug: "windows-laptops", label: "لابتوبات ويندوز", emoji: "🪟", href: "/laptops/windows-laptops" },
];

const filterFn = (p: Product) =>
  p.category?.toLowerCase().includes("laptop") ||
  p.category?.toLowerCase().includes("macbook") ||
  p.category?.toLowerCase().includes("monitor") ||
  p.category?.includes("لابتوب") ||
  p.category?.includes("ماك بوك") ||
  p.category?.includes("لابتوبات") ||
  false;

export default async function LaptopsPage() {
  const allProducts = await getAllProducts();
  const initialProducts = sortProducts(allProducts.filter(filterFn));

  return (
    <CategoryLandingClient
      title="لابتوبات وشاشات"
      emoji="💻"
      subCategories={subCategories}
      initialProducts={initialProducts}
    />
  );
}
