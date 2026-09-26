"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";
import ProductCard from "./ProductCard";
import type { Product } from "./types";
import CategoryBanner from "../banner/CategoryBanner";
import { sortProducts } from "../../lib/sortProducts";

const LIMIT = 4;

const categoryPageMap: Record<string, string> = {
  smartphone: "/store",
  smartphones: "/store",
  watch: "/apple-watches/se",
  audio: "/audio/airpods-pro",
  speaker: "/audio/airpods-max",
  earbuds: "/audio/samsung-buds",
  ps5: "/playstation/ps5",
  ps4: "/playstation/ps5-slim",
  xbox: "/playstation/xbox-one",
  controller: "/playstation/controllers",
  "gaming-accessories": "/playstation/ps-accessories",
  laptop: "/laptops/macbook-pro",
  monitor: "/laptops/samsung-monitors",
  tablet: "/tablets/ipad-pro",
  powerbank: "/accessories/anker-batteries",
  gaming: "/games/ps5-games",
  "mice-keyboards": "/games/mice-keyboards",
  microphone: "/games/microphones",
  figures: "/games/figures",
  rgb: "/games/rgb-lighting",
  "ابل ايفون 17 برو": "/smartphones/iphone-17-pro",
  "ابل ايفون 17 برو ماكس": "/smartphones/iphone-17-pro-max",
  "ابل ايفون 17برو ماكس": "/smartphones/iphone-17-pro-max",
  "ابل ايفون 17": "/smartphones/iphone-17",
  "ابل ايفون 17 اير": "/smartphones/iphone-17-air",
  "ابل ايفون 16 برو": "/smartphones/iphone-16-pro",
  "ابل ايفون 16 برو ماكس": "/smartphones/iphone-16-pro-max",
  "ابل ايفون 16": "/smartphones/iphone-16",
  "ابل ايفون 16 بلس": "/smartphones/iphone-16-plus",
  "ابل ايفون 15 برو": "/smartphones/iphone-15-pro",
  "ابل ايفون 15 برو ماكس": "/smartphones/iphone-15-pro-max",
  "ابل ايفون 15": "/smartphones/iphone-15",
  "ابل ايفون 15 بلس": "/smartphones/iphone-15-plus",
  "ابل ايفون 14 برو": "/smartphones/iphone-14-pro",
  "ابل ايفون 14 برو ماكس": "/smartphones/iphone-14-pro-max",
  "ابل ايفون 14": "/smartphones/iphone-14",
  "ابل ايفون 14 بلس": "/smartphones/iphone-14-plus",
  "ابل ايفون 13 برو ماكس": "/smartphones/iphone-13-pro-max",
  "سامسونج جالكسي": "/smartphones/samsung-s25-ultra",
  "سامسونج جالاكسي S22": "/smartphones/samsung-s22-ultra",
  "سامسونج جالاكسي S23": "/smartphones/samsung-s23-ultra",
  "سامسونج جالاكسي S24": "/smartphones/samsung-s24-ultra",
  "سامسونج جالاكسي S25": "/smartphones/samsung-s25-ultra",
  "سامسونج جالاكسي S26": "/smartphones/samsung-s26-ultra",
  "ساعات ابل": "/apple-watches/se",
  "سماعات ابل": "/audio/airpods-pro",
  "بلاي ستيشن": "/playstation/ps5",
  "لابتوبات": "/laptops/macbook-pro",
  "ايبادات": "/tablets/ipad-pro",
  "ملحقات": "/accessories/anker-batteries",
  "العاب": "/games/ps5-games",
};

const accentColors = [
  { bar: "#2563eb", light: "#eff6ff", text: "#2563eb" },
  { bar: "#7c3aed", light: "#f5f3ff", text: "#7c3aed" },
  { bar: "#0891b2", light: "#ecfeff", text: "#0891b2" },
  { bar: "#059669", light: "#ecfdf5", text: "#059669" },
  { bar: "#dc2626", light: "#fef2f2", text: "#dc2626" },
];

function CategoryRow({ category, items, isFirst, accentIdx }: { category: string; items: Product[]; isFirst?: boolean; accentIdx: number }) {
  const visible = items.slice(0, LIMIT);
  const href = categoryPageMap[category] ?? categoryPageMap[category.toLowerCase()] ?? "#";
  const accent = accentColors[accentIdx % accentColors.length];

  return (
    <div className="mb-8" dir="rtl">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <span className="w-1 h-7 rounded-full shrink-0" style={{ background: accent.bar }} />
          <h2 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">{category}</h2>
        </div>
        <Link
          href={href}
          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full border transition-all duration-200 hover:opacity-80"
          style={{ color: accent.text, borderColor: accent.bar, background: accent.light }}
        >
          عرض الكل
          <IoArrowBack size={13} />
        </Link>
      </div>

      {/* ── Cards ── */}
      <div className="grid grid-cols-2 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
        {visible.map((p, i) => (
          <ProductCard key={p._id} product={p} priority={isFirst && i === 0} />
        ))}
      </div>
    </div>
  );
}

type HomeSettings = { category: string; subCategory: string; showInHome: boolean; order: number };
type HomeConfig = { settings: HomeSettings[]; max: number };

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [homeConfig, setHomeConfig] = useState<HomeConfig | null>(null);
  const [bannerMap, setBannerMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/products`).then((r) => r.json()),
      fetch("/api/sub-categories-home").then((r) => r.json()).catch(() => ({ settings: [], max: 4 })),
    ])
      .then(([prods, config]) => {
        setProducts(prods);
        setHomeConfig(Array.isArray(config) ? { settings: config, max: 4 } : config);
        const cats = [...new Set((prods as Product[]).map((p) => p.category).filter(Boolean))];
        if (cats.length) {
          fetch(`/api/admin/category-banners-bulk?categories=${encodeURIComponent(cats.join(","))}`)
            .then((r) => r.json())
            .then((data) => { if (data && typeof data === "object") setBannerMap(data); })
            .catch(() => {});
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, Product[]> = {};
    products.forEach((p) => {
      const cat = p.category || "أخرى";
      (map[cat] ??= []).push(p);
    });
    Object.keys(map).forEach((cat) => { map[cat] = sortProducts(map[cat]); });
    return map;
  }, [products]);

  const orderedCategories = useMemo(() => {
    const allCats = Object.keys(grouped).filter((c) => c !== "أخرى");
    if (!homeConfig) return allCats;
    const { settings, max } = homeConfig;
    const visibleSettings = settings.filter((s) => s.showInHome);
    if (visibleSettings.length === 0) return allCats;
    const orderedCats = visibleSettings
      .sort((a, b) => a.order - b.order)
      .slice(0, max)
      .map((s) => s.category)
      .filter((c, idx, arr) => arr.indexOf(c) === idx)
      .filter((c) => allCats.includes(c));
    const unconfigured = allCats.filter((c) => !settings.some((s) => s.category === c) && c !== "أخرى");
    return [...orderedCats, ...unconfigured];
  }, [grouped, homeConfig]);

  if (loading) return (
    <section className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-8">
      {[1, 2, 3].map((g) => (
        <div key={g} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-7 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-5 w-40 bg-gray-200 animate-pulse rounded-full" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                <div className="w-full aspect-square bg-gray-100 animate-pulse" />
                <div className="p-3 space-y-2.5">
                  <div className="h-3 bg-gray-100 animate-pulse rounded-full w-1/2" />
                  <div className="h-4 bg-gray-100 animate-pulse rounded-full w-3/4" />
                  <div className="h-4 bg-gray-100 animate-pulse rounded-full w-1/2" />
                  <div className="h-9 bg-gray-100 animate-pulse rounded-xl mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );

  if (!products.length) return <p className="text-center text-gray-400 py-10">لا توجد منتجات حالياً</p>;

  return (
    <section className="w-full py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        {orderedCategories.map((category, catIdx) => (
          <div key={category}>
            {/* Category banner (full-bleed) */}
            {bannerMap[category]?.length > 0 && (
              <div className="-mx-3 sm:-mx-6 mb-4">
                <CategoryBanner category={category} images={bannerMap[category]} />
              </div>
            )}
            <CategoryRow category={category} items={grouped[category]} isFirst={catIdx === 0} accentIdx={catIdx} />
          </div>
        ))}
      </div>
    </section>
  );
}
