import type { Metadata } from "next";
import { slugConfigs, filterProducts } from "../../lib/categoryConfig";
import { getAllProducts } from "../../lib/productsCache";
import { sortProducts } from "../../lib/sortProducts";
import CategoryPageClient from "./CategoryPageClient";
import { getCompanyData } from "../../lib/companyCache";
import { SITE_URL, DEFAULT_OG_IMAGE, getFullImageUrl, getBreadcrumbJsonLd } from "../../lib/seo";

export const revalidate = 86400; // 24 hours

export function generateStaticParams() {
  return Object.keys(slugConfigs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const config = slugConfigs[slug];
  const company = await getCompanyData();

  const siteName = company?.nameAr || "مدار للإلكترونيات";
  const label = config?.label ?? slug;
  const parentLabel = config?.parentLabel ?? "";

  const title = parentLabel ? `${label} - ${parentLabel} | اشتري بالتقسيط من ${siteName}` : `${label} | أفضل الأسعار والتقسيط المريح من ${siteName}`;
  const description = `تسوق ${label} بأفضل الأسعار وبالتقسيط المريح بدون فوائد في متجر ${siteName}. ${parentLabel ? `ضمن قسم ${parentLabel}.` : ""} شحن سريع لجميع مناطق المملكة وضمان معتمد على جميع المنتجات.`;

  const ogImage = company?.logo ? getFullImageUrl(company.logo) : DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    keywords: [label, parentLabel, siteName, "أقساط جوالات", "شراء بالتقسيط", "السعودية", "تقسيط بدون فوائد"].filter(Boolean),
    openGraph: {
      type: "website",
      url: `${SITE_URL}/${slug}`,
      title: `${title} | ${siteName}`,
      description,
      siteName,
      locale: "ar_SA",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${label} - ${siteName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `${SITE_URL}/${slug}`,
    },
  };
}

export default async function CategorySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = slugConfigs[slug];
  const allProducts = await getAllProducts();
  const initialProducts = sortProducts(filterProducts(allProducts, slug));

  const label = config?.label ?? slug;
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "الرئيسية", url: "/" },
    { name: config?.parentLabel || "المتجر", url: config?.parentHref || "/store" },
    { name: label, url: `/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoryPageClient slug={slug} initialProducts={initialProducts} />
    </>
  );
}
