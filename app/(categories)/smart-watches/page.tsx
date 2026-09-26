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
  const title = `الساعات الذكية بالتقسيط المريح | ${siteName}`;
  const description = `تسوق أفضل الساعات الذكية وساعات اللياقة البدنية سامسونج، هواوي، شاومي، وأبل بالتقسيط المريح بدون فوائد في ${siteName}.`;

  return {
    title,
    description,
    keywords: ["ساعات ذكية", "Smart Watch", "ساعات سامسونج", "ساعات هواوي", "ساعة ذكية رخيصة", siteName, "السعودية"],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/smart-watches`,
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
    alternates: { canonical: `${SITE_URL}/smart-watches` },
  };
}

const subCategories: SubCategoryCard[] = [
  { slug: "smart-watches", label: "الساعات الذكية", emoji: "⌚", href: "/smart-watches/smart-watches" },
];

const filterFn = (p: Product) =>
  p.category?.includes("ساعات ذكية") ||
  p.category?.toLowerCase().includes("smart") ||
  p.category?.toLowerCase().includes("watch") ||
  false;

export default async function SmartWatchesPage() {
  const allProducts = await getAllProducts();
  const initialProducts = sortProducts(allProducts.filter(filterFn));

  const breadcrumbs = getBreadcrumbJsonLd([
    { name: "الرئيسية", url: "/" },
    { name: "الساعات الذكية", url: "/smart-watches" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <CategoryLandingClient
        title="الساعات الذكية"
        emoji="⌚"
        subCategories={subCategories}
        initialProducts={initialProducts}
      />
    </>
  );
}
