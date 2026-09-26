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
  const title = `الأجهزة اللوحية والآيباد (Tablets & iPad) بالتقسيط | ${siteName}`;
  const description = `تسوق أحدث أجهزة الآيباد iPad Pro و iPad Air وسامسونج تاب بالتقسيط المريح وبدون فوائد في ${siteName}. شحن سريع وضمان معتمد.`;

  return {
    title,
    description,
    keywords: ["ايباد بالتقسيط", "iPad Pro", "iPad Air", "تابلت سامسونج", "Galaxy Tab", "أجهزة لوحية", siteName, "السعودية"],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/tablets`,
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
    alternates: { canonical: `${SITE_URL}/tablets` },
  };
}

const subCategories: SubCategoryCard[] = [
  { slug: "ipad-pro", label: "آيباد برو", emoji: "📲", href: "/tablets/ipad-pro" },
  { slug: "ipad-air", label: "آيباد إير", emoji: "📲", href: "/tablets/ipad-air" },
  { slug: "ipad-mini", label: "آيباد ميني", emoji: "📲", href: "/tablets/ipad-mini" },
  { slug: "ipad", label: "آيباد عادي", emoji: "📱", href: "/tablets/ipad" },
  { slug: "samsung-tab", label: "سامسونج تاب", emoji: "📱", href: "/tablets/samsung-tab" },
];

const filterFn = (p: Product) =>
  p.category?.toLowerCase().includes("tablet") ||
  p.category?.toLowerCase().includes("ipad") ||
  p.category?.includes("ايباد") ||
  p.category?.includes("آيباد") ||
  p.category?.includes("لوحية") ||
  p.category?.includes("تابلت") ||
  false;

export default async function TabletsPage() {
  const allProducts = await getAllProducts();
  const initialProducts = sortProducts(allProducts.filter(filterFn));

  const breadcrumbs = getBreadcrumbJsonLd([
    { name: "الرئيسية", url: "/" },
    { name: "الأجهزة اللوحية والآيباد", url: "/tablets" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <CategoryLandingClient
        title="الأجهزة اللوحية والآيباد"
        emoji="📲"
        subCategories={subCategories}
        initialProducts={initialProducts}
      />
    </>
  );
}
