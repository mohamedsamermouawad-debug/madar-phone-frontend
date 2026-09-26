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
    title: `الملحقات والإكسسوارات | ${siteName}`,
    description: `تسوق بطاريات متنقلة وكيابل وشواحن بأفضل الأسعار في ${siteName}. شحن سريع وضمان معتمد.`,
    alternates: { canonical: `${SITE_URL}/accessories` },
  };
}

const subCategories: SubCategoryCard[] = [
  { slug: "anker-batteries", label: "بطاريات متنقلة", emoji: "🔋", href: "/accessories/anker-batteries" },
  { slug: "cables", label: "كيابل وشواحن", emoji: "🔌", href: "/accessories/cables" },
  { slug: "cases", label: "كفرات وحماية", emoji: "🛡️", href: "/accessories/cases" },
  { slug: "screen-protectors", label: "حماية شاشة", emoji: "📲", href: "/accessories/screen-protectors" },
];

const filterFn = (p: Product) =>
  p.category?.toLowerCase().includes("powerbank") ||
  p.category?.toLowerCase().includes("accessory") ||
  p.category?.toLowerCase().includes("accessories") ||
  p.category?.toLowerCase().includes("cable") ||
  p.category?.includes("ملحقات") ||
  p.category?.includes("بطاريات") ||
  p.category?.includes("كيابل") ||
  false;

export default async function AccessoriesPage() {
  const allProducts = await getAllProducts();
  const initialProducts = sortProducts(allProducts.filter(filterFn));

  return (
    <CategoryLandingClient
      title="الملحقات والإكسسوارات"
      emoji="🔋"
      subCategories={subCategories}
      initialProducts={initialProducts}
    />
  );
}
