"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import ProductCard from "./products/ProductCard";
import type { Product } from "./products/types";

type Category = { name: string; count: number; image: string; href: string };

interface Props {
  products: Product[];
  categories: Category[];
}

const ALL = "الكل";

// ترتيب الأقسام الرئيسية حسب الناف بار — كل ما كان الرقم أصغر كان الأولوية أعلى
const CATEGORY_ORDER: string[] = [
  // ── آيفون 18 ──
  "ابل ايفون 18 برو ماكس",
  "ابل ايفون 18 برو ",
  "ابل ايفون 18 برو",
  "ابل ايفون 18 دو",
  "ابل ايفون 18",
  // ── آيفون 17 ──
  "أبل آيفون 17 برو ماكس",
  "ابل ايفون 17 برو ماكس",
  "أبل آيفون 17 برو",
  "ابل ايفون 17 برو",
  "أبل آيفون 17 اير",
  "ابل ايفون 17 اير",
  "أبل آيفون 17",
  "ابل ايفون 17",
  // ── آيفون 16 ──
  "ابل ايفون 16 برو ماكس",
  "ابل ايفون 16 برو",
  "ابل ايفون 16 بلس",
  "ابل ايفون 16",
  // ── آيفون 15 ──
  "ابل ايفون 15 برو ماكس",
  "ابل ايفون 15 برو",
  "ابل ايفون 15 بلس",
  "ابل ايفون 15",
  // ── آيفون 14 ──
  "ابل ايفون 14 برو ماكس",
  "ابل ايفون 14 برو",
  "ابل ايفون 14 بلس",
  "ابل ايفون 14",
  // ── آيفون 13 ──
  "ابل ايفون 13 برو ماكس",
  "ابل ايفون 13 برو",
  // ── سامسونج ──
  "سامسونج جالاكسي S26",
  "سامسونج جالاكسي S25",
  "سامسونج جالاكسي S24",
  "سامسونج جالاكسي S23",
  "سامسونج جلاكسي S23 الترا",
  "سامسونج جالاكسي S22",
  // ── باقي الأقسام ──
  "ساعات ابل",
  "ساعات أبل",
  "ساعات ذكية",
  "الساعات الذكية",
  "سماعات ابل",
  "سماعات أبل",
  "أجهزة صوت و سماعات",
  "أجهزة صوت وسماعات",
  "أجهزة بلاي ستيشن",
  "بلاي ستيشن",
  "لابتوبات وشاشات",
  "لابتوبات",
  "الاجهزة اللوحية ايبادات",
  "الأجهزة اللوحية",
  "بطاريات متنقلة وكيابل",
  "بطاريات متنقله",
  "ملحقات",
  "ألعاب الفيديو",
  "العاب",
];

function getCategoryPriority(cat?: string): number {
  if (!cat) return 9999;
  const idx = CATEGORY_ORDER.findIndex(
    (c) => c.trim().toLowerCase() === cat.trim().toLowerCase()
  );
  return idx === -1 ? 9000 : idx;
}

function extractModelNumber(p: Product): number {
  const src = `${p.name ?? ""} ${p.category ?? ""}`;
  const nums = (src.match(/\d+/g) ?? []).map(Number).filter((n) => n > 0 && n < 100);
  return nums.length ? Math.max(...nums) : 0;
}

function sortByNewest(arr: Product[]): Product[] {
  return [...arr].sort((a, b) => {
    // أولاً: ترتيب القسم
    const catDiff = getCategoryPriority(a.category) - getCategoryPriority(b.category);
    if (catDiff !== 0) return catDiff;
    // ثانياً: داخل نفس القسم — رقم الموديل تنازلي
    const modelDiff = extractModelNumber(b) - extractModelNumber(a);
    if (modelDiff !== 0) return modelDiff;
    // ثالثاً: السعر تصاعدي
    const pa = (a.salePrice && a.salePrice > 0 ? a.salePrice : a.originalPrice) ?? 0;
    const pb = (b.salePrice && b.salePrice > 0 ? b.salePrice : b.originalPrice) ?? 0;
    return pa - pb;
  });
}

// يبني قائمة الفلاتر: الأقسام الموجودة في الناف بار + أي قسم عنده منتجات مش موجود
const NAV_CATEGORY_LABELS: Record<string, string> = {
  "ابل ايفون 18 برو ماكس": "آيفون 18 برو ماكس",
  "ابل ايفون 18 برو": "آيفون 18 برو",
  "ابل ايفون 18 برو ": "آيفون 18 برو",
  "ابل ايفون 18 دو": "آيفون 18",
  "ابل ايفون 18": "آيفون 18",
  "أبل آيفون 17 برو ماكس": "آيفون 17 برو ماكس",
  "ابل ايفون 17 برو ماكس": "آيفون 17 برو ماكس",
  "أبل آيفون 17 برو": "آيفون 17 برو",
  "ابل ايفون 17 برو": "آيفون 17 برو",
  "أبل آيفون 17 اير": "آيفون 17 Air",
  "ابل ايفون 17 اير": "آيفون 17 Air",
  "أبل آيفون 17": "آيفون 17",
  "ابل ايفون 17": "آيفون 17",
  "ابل ايفون 16 برو ماكس": "آيفون 16 برو ماكس",
  "ابل ايفون 16 برو": "آيفون 16 برو",
  "ابل ايفون 16 بلس": "آيفون 16 بلس",
  "ابل ايفون 16": "آيفون 16",
  "ابل ايفون 15 برو ماكس": "آيفون 15 برو ماكس",
  "ابل ايفون 15 برو": "آيفون 15 برو",
  "ابل ايفون 15 بلس": "آيفون 15 بلس",
  "ابل ايفون 15": "آيفون 15",
  "ابل ايفون 14 برو ماكس": "آيفون 14 برو ماكس",
  "ابل ايفون 14 برو": "آيفون 14 برو",
  "ابل ايفون 13 برو ماكس": "آيفون 13 برو ماكس",
  "سامسونج جالاكسي S26": "S26 الترا",
  "سامسونج جالاكسي S25": "S25 الترا",
  "سامسونج جالاكسي S24": "S24 الترا",
  "سامسونج جالاكسي S23": "S23 الترا",
  "سامسونج جلاكسي S23 الترا": "S23 الترا",
  "سامسونج جالاكسي S22": "S22 الترا",
  "ساعات ابل": "ساعات Apple",
  "ساعات أبل": "ساعات Apple",
  "ساعات ذكية": "ساعات ذكية",
  "الساعات الذكية": "ساعات ذكية",
  "سماعات ابل": "سماعات",
  "سماعات أبل": "سماعات",
  "أجهزة صوت و سماعات": "سماعات",
  "أجهزة صوت وسماعات": "سماعات",
  "أجهزة بلاي ستيشن": "بلاي ستيشن",
  "بلاي ستيشن": "بلاي ستيشن",
  "لابتوبات وشاشات": "لابتوبات",
  "لابتوبات": "لابتوبات",
  "الاجهزة اللوحية ايبادات": "أيبادات",
  "الأجهزة اللوحية": "أيبادات",
  "بطاريات متنقلة وكيابل": "إكسسوارات",
  "بطاريات متنقله": "إكسسوارات",
  "ملحقات": "إكسسوارات",
  "ألعاب الفيديو": "ألعاب",
  "العاب": "ألعاب",
};

function getDisplayLabel(cat: string): string {
  return NAV_CATEGORY_LABELS[cat.trim()] ?? cat;
}

export default function StoreClient({ products, categories }: Props) {
  const [active, setActive] = useState(ALL);
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  // بناء قائمة فلاتر ذكية: كل قسم عنده منتجات، مرتبة حسب CATEGORY_ORDER
  const filterCategories = useMemo(() => {
    // استخرج كل قسم موجود في المنتجات
    const catMap = new Map<string, { count: number; image: string }>();
    for (const p of products) {
      const cat = p.category?.trim();
      if (!cat) continue;
      const existing = catMap.get(cat);
      if (existing) {
        existing.count++;
      } else {
        // حاول تلاقي الصورة من categories array
        const matched = categories.find((c) => c.name.trim() === cat);
        catMap.set(cat, { count: 1, image: matched?.image ?? "" });
      }
    }

    // رتّبها حسب CATEGORY_ORDER
    return Array.from(catMap.entries())
      .map(([name, { count, image }]) => ({ name, count, image }))
      .sort((a, b) => getCategoryPriority(a.name) - getCategoryPriority(b.name));
  }, [products, categories]);

  const filtered = useMemo(() => {
    const base = active === ALL ? products : products.filter((p) => p.category?.trim() === active);
    return sortByNewest(base);
  }, [products, active]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleFilter = (name: string) => {
    setActive(name);
    setPage(1);
  };

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pb-16">

      {/* ── فلتر الأقسام ── */}
      <div className="py-5">
        <div className="flex gap-2 overflow-x-auto pb-1.5" style={{ scrollbarWidth: "none" }}>

          {/* زر الكل */}
          <button
            onClick={() => handleFilter(ALL)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-200"
            style={{
              background: active === ALL ? "#003048" : "#F0F7FB",
              color: active === ALL ? "#fff" : "#003048",
              border: active === ALL ? "2px solid #003048" : "2px solid #D4E8F2",
            }}
          >
            الكل
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-black"
              style={{
                background: active === ALL ? "rgba(255,255,255,0.2)" : "#D4E8F2",
                color: active === ALL ? "#fff" : "#0889A2",
              }}
            >
              {products.length}
            </span>
          </button>

          {/* أزرار الأقسام — مبنية من المنتجات الفعلية */}
          {filterCategories.map((cat) => {
            const isActive = active === cat.name;
            const label = getDisplayLabel(cat.name);
            return (
              <button
                key={cat.name}
                onClick={() => handleFilter(cat.name)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-200"
                style={{
                  background: isActive ? "#0889A2" : "#F0F7FB",
                  color: isActive ? "#fff" : "#003048",
                  border: isActive ? "2px solid #0889A2" : "2px solid #D4E8F2",
                }}
              >
                {cat.image && (
                  <span className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 bg-white">
                    <Image src={cat.image} alt={label} fill unoptimized className="object-contain p-0.5" />
                  </span>
                )}
                {label}
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-black"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.2)" : "#D4E8F2",
                    color: isActive ? "#fff" : "#0889A2",
                  }}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── عنوان + عداد ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-black" style={{ color: "#003048" }}>
            {active === ALL ? "جميع المنتجات" : getDisplayLabel(active)}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "#90AEBA" }}>
            {filtered.length} منتج متاح
          </p>
        </div>
        {totalPages > 1 && (
          <p className="text-xs" style={{ color: "#90AEBA" }}>
            صفحة {page} من {totalPages}
          </p>
        )}
      </div>

      {/* ── شبكة المنتجات ── */}
      {paged.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="text-6xl">🛍️</div>
          <p className="font-black text-lg" style={{ color: "#003048" }}>لا توجد منتجات في هذا القسم</p>
          <button
            onClick={() => handleFilter(ALL)}
            className="text-sm font-bold px-5 py-2.5 rounded-full transition-all hover:opacity-80"
            style={{ background: "#0889A2", color: "#fff" }}
          >
            عرض كل المنتجات
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
          {paged.map((p, i) => (
            <ProductCard key={p._id} product={p} priority={i < 4} />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <button
            onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-30"
            style={{ background: "#F0F7FB", color: "#003048", border: "1.5px solid #D4E8F2" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            السابق
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
            .reduce<(number | "…")[]>((acc, n, i, arr) => {
              if (i > 0 && (n as number) - (arr[i - 1] as number) > 1) acc.push("…");
              acc.push(n);
              return acc;
            }, [])
            .map((n, i) =>
              n === "…" ? (
                <span key={`e-${i}`} className="text-xs px-1" style={{ color: "#90AEBA" }}>…</span>
              ) : (
                <button
                  key={n}
                  onClick={() => { setPage(n as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="w-10 h-10 rounded-xl text-xs font-black transition-all"
                  style={
                    page === n
                      ? { background: "#0889A2", color: "#fff", boxShadow: "0 4px 14px rgba(8,137,162,0.3)" }
                      : { background: "#F0F7FB", color: "#003048", border: "1.5px solid #D4E8F2" }
                  }
                >
                  {n}
                </button>
              )
            )}

          <button
            onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-30"
            style={{ background: "#F0F7FB", color: "#003048", border: "1.5px solid #D4E8F2" }}
          >
            التالي
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        </div>
      )}

      <style>{`div::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}
