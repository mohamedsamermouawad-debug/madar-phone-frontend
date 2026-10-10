import { Suspense } from "react";
import type { Metadata } from "next";
import StoreBannerSlider from "../components/StoreBannerSlider";
import StoreClient from "../components/StoreClient";
import { getAllProducts } from "../lib/productsCache";
import { sortProducts } from "../lib/sortProducts";
import { getPublicCategories, getHomeSettings } from "../lib/categoriesCache";
import type { Product } from "../components/products/types";
import { SITE_URL, BACKEND_URL, DEFAULT_OG_IMAGE, getBreadcrumbJsonLd } from "../lib/seo";

export const metadata: Metadata = {
  title: "المتجر الإلكتروني | تصفح كافة المنتجات والأسعار | مدار للإلكترونيات",
  description: "تسوق كافة منتجات مدار للإلكترونيات من جوالات، أجهزة لوحية، ساعات ذكية، أجهزة بلايستيشن وإكسسوارات أصلية بالتقسيط المريح وبدون فوائد في السعودية.",
  keywords: ["متجر مدار", "تسوق إلكترونيات", "تقسيط جوالات", "عروض هواتف ذكية", "أجهزة بالتقسيط", "السعودية"],
  alternates: {
    canonical: `${SITE_URL}/store`,
  },
  openGraph: {
    title: "المتجر الإلكتروني | تصفح كافة المنتجات والأسعار | مدار للإلكترونيات",
    description: "تسوق كافة منتجات مدار للإلكترونيات بالتقسيط المريح وبدون فوائد في السعودية.",
    url: `${SITE_URL}/store`,
    siteName: "مدار للإلكترونيات",
    locale: "ar_SA",
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "المتجر الإلكتروني - مدار للإلكترونيات",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "المتجر الإلكتروني | مدار للإلكترونيات",
    description: "تسوق كافة منتجات مدار للإلكترونيات بالتقسيط المريح وبدون فوائد.",
    images: [DEFAULT_OG_IMAGE],
  },
};

const PLACEHOLDER_BANNERS = [
  "https://res.cloudinary.com/dllmx2yf3/image/upload/v1790388387/ChatGPT_Image_Sep_26_2026_05_04_15_AM_1_wmoiw3.webp"
];

type Category = { name: string; count: number; image: string };

async function getCategories(): Promise<(Category & { href: string })[]> {
  try {
    const [allCats, settings] = await Promise.all([
      getPublicCategories(),
      getHomeSettings(),
    ]);

    const visibleMap = new Map(
      settings.filter((s) => s.showInHome).map((s) => [s.category, s.order])
    );

    const sorted = (visibleMap.size ? allCats.filter((c) => visibleMap.has(c.name)) : allCats)
      .sort((a, b) => (visibleMap.get(a.name) ?? 0) - (visibleMap.get(b.name) ?? 0));

    return sorted.map((c) => ({ ...c, href: "/store" }));
  } catch {
    return [];
  }
}

async function getStoreBanners(): Promise<string[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/admin/banners`, { next: { revalidate: 86400 } });
    if (!res.ok) return PLACEHOLDER_BANNERS;
    const data = await res.json();
    const urls: string[] = Array.isArray(data)
      ? data.filter((b: { active?: boolean; url?: string }) => b.active && b.url).map((b: { url: string }) => b.url)
      : [];
    return urls.length ? urls : PLACEHOLDER_BANNERS;
  } catch {
    return PLACEHOLDER_BANNERS;
  }
}

export const revalidate = 86400; // 24 hours (updated instantly on-demand via tags)

export default async function StorePage() {
  const [products, categories, banners] = await Promise.all([
    getAllProducts() as Promise<Product[]>,
    getCategories(),
    getStoreBanners(),
  ]);

  const sorted = sortProducts(products);

  const breadcrumbs = getBreadcrumbJsonLd([
    { name: "الرئيسية", url: "/" },
    { name: "المتجر", url: "/store" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <main className="min-h-screen bg-white" dir="rtl">

        {/* ── Banner Slider ── */}
        <StoreBannerSlider images={banners} />

        {/* ── رأس الصفحة ── */}
        <div className="w-full px-4 sm:px-8 lg:px-12 pt-4 pb-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end gap-3">
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "#0889A2" }}>
                  مدار للإلكترونيات
                </p>
                <h1 className="text-2xl sm:text-3xl font-black leading-tight" style={{ color: "#003048" }}>
                  المتجر
                </h1>
              </div>
              <div className="flex-1 h-px mb-2" style={{ background: "linear-gradient(to left, transparent, #D4E8F2)" }} />
              <p className="text-sm font-bold mb-2" style={{ color: "#90AEBA" }}>
                {sorted.length} منتج
              </p>
            </div>
          </div>
        </div>

        {/* ── المنتجات + الفلتر ── */}
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <StoreClient products={sorted} categories={categories} />
        </Suspense>

      </main>
    </>
  );
}
