"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import type { Product } from "../../components/products/types";
import { slugConfigs } from "../../lib/categoryConfig";
import { sortProducts } from "../../lib/sortProducts";
import CategoryHero from "./components/CategoryHero";
import ProductsGrid from "./components/ProductsGrid";

export function filterProducts(products: Product[], slug: string): Product[] {
  const config = slugConfigs[slug];
  if (!config) return products;
  const { brand, category, nameIncludes, nameExcludes } = config.filters;
  return products.filter((p) => {
    const matchBrand = brand ? p.brand?.toLowerCase() === brand.toLowerCase() : true;
    const matchCategory = category ? p.category === category : true;
    const matchName = nameIncludes?.length
      ? nameIncludes.some((kw) => p.name?.toLowerCase().includes(kw.toLowerCase()))
      : true;
    const matchExclude = nameExcludes?.length
      ? !nameExcludes.some((kw) => p.name?.toLowerCase().includes(kw.toLowerCase()))
      : true;
    return matchBrand && matchCategory && matchName && matchExclude;
  });
}

export default function CategoryPageClient({
  slug,
  initialProducts,
}: {
  slug: string;
  initialProducts?: Product[];
}) {
  const config = slugConfigs[slug];
  if (!config) notFound();

  const [rawProducts, setRawProducts] = useState<Product[]>(initialProducts ?? []);
  const [loading, setLoading] = useState(!initialProducts);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (initialProducts) return;
    const brand = config?.filters.brand ?? "";
    const query = brand ? `?brand=${encodeURIComponent(brand)}` : "";
    fetch(`/api/products${query}`)
      .then((r) => r.json())
      .then((data: Product[]) =>
        setRawProducts(sortProducts(filterProducts(data, slug)))
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, config?.filters.brand, initialProducts]);

  const label       = config?.label       ?? slug;
  const parentLabel = config?.parentLabel ?? "";
  const parentHref  = config?.parentHref  ?? "/";
  // الصور المخصصة يدوياً من categoryConfig
  const heroImages  = (config?.heroImages ?? []).filter(Boolean);

  return (
    <main className="min-h-screen" style={{ background: "#FAFCFE" }} dir="rtl">
      <CategoryHero
        label={label}
        parentLabel={parentLabel}
        parentHref={parentHref}
        productCount={rawProducts.length}
        loading={loading}
        heroImages={heroImages}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10 pb-16">
        <ProductsGrid
          products={rawProducts}
          loading={loading}
          page={page}
          onPageChange={setPage}
          emoji="📱"
          reserveMode={slug === "iphone-18"}
        />
      </div>
    </main>
  );
}
