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
    title: `أجهزة بلاي ستيشن وإكس بوكس | ${siteName}`,
    description: `تسوق أجهزة بلاي ستيشن وإكس بوكس وملحقاتها بأفضل الأسعار في ${siteName}. شحن سريع وضمان معتمد.`,
    alternates: { canonical: `${SITE_URL}/playstation` },
  };
}

const subCategories: SubCategoryCard[] = [
  { slug: "ps5", label: "بلاي ستيشن 5", emoji: "🎮", href: "/playstation/ps5" },
  { slug: "ps5-slim", label: "بلاي ستيشن 4", emoji: "🎮", href: "/playstation/ps5-slim" },
  { slug: "xbox-one", label: "أكس بوكس ون", emoji: "🕹️", href: "/playstation/xbox-one" },
  { slug: "controllers", label: "يد تحكم", emoji: "🎯", href: "/playstation/controllers" },
  { slug: "ps-accessories", label: "ملحقات بلاي ستيشن", emoji: "🔌", href: "/playstation/ps-accessories" },
];

const PS_CATEGORIES = ["ps5", "ps4", "xbox", "controller", "gaming-accessories"];

const filterFn = (p: Product) =>
  PS_CATEGORIES.includes(p.category?.toLowerCase() ?? "");

export default async function PlaystationPage() {
  const allProducts = await getAllProducts();
  const initialProducts = sortProducts(allProducts.filter(filterFn));

  return (
    <CategoryLandingClient
      title="أجهزة بلاي ستيشن"
      emoji="🎮"
      subCategories={subCategories}
      initialProducts={initialProducts}
    />
  );
}
