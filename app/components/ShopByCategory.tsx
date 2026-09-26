import Link from "next/link";
import CategorySlider from "./CategorySlider";
import { getPublicCategories, getHomeSettings } from "../lib/categoriesCache";
import { resolveCategoryHref } from "../lib/categoryConfig";

type Category = { name: string; count: number; image: string; href: string };

async function getCategories(): Promise<Category[]> {
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

    return sorted.map((c) => ({ ...c, href: resolveCategoryHref(c.name) }));
  } catch {
    return [];
  }
}

export default async function ShopByCategory() {
  const categories = await getCategories();
  if (!categories.length) return null;

  return (
    <section
      className="w-full bg-white px-4 sm:px-8 lg:px-12 pt-7 pb-8"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* عنوان */}
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-base sm:text-lg font-black shrink-0" style={{ color: "#003048" }}>
            تسوق حسب القسم
          </h2>
          <div
            className="flex-1 h-px"
            style={{ background: "linear-gradient(to left, transparent, #D4E8F2 40%, transparent)" }}
          />
          <Link
            href="/store"
            className="text-xs font-bold shrink-0 transition-colors hover:text-[#003048]"
            style={{ color: "#0889A2" }}
          >
            عرض الكل ←
          </Link>
        </div>

        {/* الدواير */}
        <CategorySlider categories={categories} />
      </div>
    </section>
  );
}
