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
  const title = `الملحقات والإكسسوارات الأصلية | ${siteName}`;
  const description = `تسوق أحدث إكسسوارات الجوالات واللابتوبات، بطاريات متنقلة، كابلات وشواحن أصلية بأفضل الأسعار بالتقسيط المريح بدون فوائد في ${siteName}.`;

  return {
    title,
    description,
    keywords: ["إكسسوارات جوال", "شواحن أصلية", "بطاريات متنقلة", "كفرات حماية", "أنكر", "سماعات", siteName, "السعودية"],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/accessories`,
      title: `${title} - تقسيط مريح وشحن سريع`,
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

  const breadcrumbs = getBreadcrumbJsonLd([
    { name: "الرئيسية", url: "/" },
    { name: "الملحقات والإكسسوارات", url: "/accessories" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <CategoryLandingClient
        title="الملحقات والإكسسوارات"
        emoji="🔋"
        subCategories={subCategories}
        initialProducts={initialProducts}
      />
    </>
  );
}
