import HomeCategorySection from "./HomeCategorySection";
import type { Product } from "./products/types";
import { getAllProducts } from "../lib/productsCache";
import { sortProducts } from "../lib/sortProducts";
import { getPublicCategories, getHomeSettings, getBulkBanners } from "../lib/categoriesCache";
import { resolveCategoryHref } from "../lib/categoryConfig";

async function getHomeCategories(): Promise<{ name: string; order: number }[]> {
  try {
    const [allCats, settings] = await Promise.all([
      getPublicCategories(),
      getHomeSettings(),
    ]);

    const visibleMap = new Map(
      settings.filter((s) => s.showInHome).map((s) => [s.category, s.order])
    );
    if (!visibleMap.size) return allCats.map((c, i) => ({ name: c.name, order: i }));

    return allCats
      .filter((c) => visibleMap.has(c.name))
      .map((c) => ({ name: c.name, order: visibleMap.get(c.name) ?? 0 }))
      .sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

export default async function HomeCategorySections() {
  const categories = await getHomeCategories();
  if (!categories.length) return null;

  const categoryNames = categories.map((c) => c.name);

  // Fetch all products and all category banners in parallel (ONLY 2 cached requests!)
  const [allProducts, bulkBannersMap] = await Promise.all([
    getAllProducts() as Promise<Product[]>,
    getBulkBanners(categoryNames),
  ]);

  const sectionsData = categories.map(({ name }) => ({
    name,
    banners: bulkBannersMap[name] || [],
    products: sortProducts((allProducts as Product[]).filter((p) => p.category?.trim() === name.trim())).slice(0, 4),
    href: resolveCategoryHref(name),
  }));

  const visible = sectionsData.filter((s) => s.banners.length > 0 || s.products.length > 0);
  if (!visible.length) return null;

  return (
    <section dir="rtl" className="w-full bg-white py-10 sm:py-14 px-4 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto flex flex-col">
        {visible.map((section, idx) => (
          <div key={section.name}>
            <HomeCategorySection
              categoryName={section.name}
              categoryHref={section.href}
              bannerImages={section.banners}
              products={section.products}
            />
            {idx < visible.length - 1 && (
              <div
                className="mt-14 sm:mt-20 h-px"
                style={{ background: "linear-gradient(to right, transparent, #D4E8F2 40%, transparent)" }}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
