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
    title: `ألعاب الفيديو وملحقاتها | ${siteName}`,
    description: `تسوق ألعاب الفيديو والملحقات بأفضل الأسعار في ${siteName}. شحن سريع وضمان معتمد.`,
    alternates: { canonical: `${SITE_URL}/games` },
  };
}

const subCategories: SubCategoryCard[] = [
  { slug: "ps5-games", label: "ألعاب الفيديو", emoji: "🎮", href: "/games/ps5-games" },
  { slug: "mice-keyboards", label: "ماوسات وكيبوردات", emoji: "⌨️", href: "/games/mice-keyboards" },
  { slug: "microphones", label: "مايكروفونات", emoji: "🎙️", href: "/games/microphones" },
  { slug: "figures", label: "مجسمات وفيقرز", emoji: "🧸", href: "/games/figures" },
  { slug: "rgb-lighting", label: "اضاءات RGB", emoji: "💡", href: "/games/rgb-lighting" },
];

const GAME_CATEGORIES = ["gaming", "mice-keyboards", "microphone", "figures", "rgb"];

const filterFn = (p: Product) =>
  GAME_CATEGORIES.includes(p.category?.toLowerCase() ?? "");

export default async function GamesPage() {
  const allProducts = await getAllProducts();
  const initialProducts = sortProducts(allProducts.filter(filterFn));

  return (
    <CategoryLandingClient
      title="ألعاب الفيديو"
      emoji="🎮"
      subCategories={subCategories}
      initialProducts={initialProducts}
    />
  );
}
