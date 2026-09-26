"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Image as ImageIcon, Plus, Search, X, Check, Power, Trash2, RefreshCw } from "lucide-react";

type BannerItem = { url: string; active: boolean };

const LABELS = [
  "البانر الأول", "البانر الثاني", "البانر الثالث", "البانر الرابع",
  "البانر الخامس", "البانر السادس", "البانر السابع", "البانر الثامن",
  "البانر التاسع", "البانر العاشر",
];

const MAX_BANNERS = 10;
const MAX_FILE_SIZE_MB = 8;

/**
 * Optimizes Cloudinary URLs for preview in the admin panel
 */
function getOptimizedPreviewUrl(url: string): string {
  if (!url) return "";
  if (url.includes("cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", "/upload/w_900,c_limit,q_auto,f_auto/");
  }
  return url;
}

function BannerCard({
  banner,
  index,
  isLoading,
  onUpload,
  onToggle,
  onDeleteImage,
  onDeleteSlot,
}: {
  banner: BannerItem;
  index: number;
  isLoading: boolean;
  onUpload: (i: number, f: File) => void;
  onToggle: (i: number) => void;
  onDeleteImage: (i: number) => void;
  onDeleteSlot: (i: number) => void;
}) {
  const hasImage = !!banner.url;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerInput = () => {
    if (!isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صالح (PNG, JPG, WebP, AVIF)");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`حجم الصورة كبير جداً (الحد الأقصى ${MAX_FILE_SIZE_MB} ميجابايت)`);
      e.target.value = "";
      return;
    }

    onUpload(index, file);
    e.target.value = "";
  };

  const previewUrl = useMemo(() => getOptimizedPreviewUrl(banner.url), [banner.url]);

  return (
    <div
      className={`group relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-md ${
        !banner.active && hasImage ? "opacity-75" : ""
      } ${hasImage ? "border-indigo-100" : "border-gray-200"}`}
    >
      {/* Top Status Badge */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
        <span
          className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-sm backdrop-blur-md transition-colors ${
            hasImage && banner.active
              ? "bg-emerald-500 text-white"
              : hasImage
              ? "bg-amber-500 text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {hasImage && banner.active ? "✓ مفعّل" : hasImage ? "⏸ موقوف" : "فارغ"}
        </span>
      </div>

      {/* Banner Preview Area */}
      <div
        className={`relative w-full aspect-[2.4/1] sm:aspect-[2.5/1] cursor-pointer overflow-hidden ${
          hasImage ? "bg-gray-900" : "bg-gradient-to-br from-slate-50 to-indigo-50/40"
        }`}
        onClick={triggerInput}
      >
        {hasImage ? (
          <>
            <Image
              src={previewUrl}
              alt={LABELS[index] || `بانر ${index + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all duration-300 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/95 text-gray-800 text-[11px] sm:text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl shadow-md flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
                تغيير الصورة
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-2 group-hover:bg-indigo-50/50 transition-colors duration-300">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white shadow-sm border border-gray-100 group-hover:border-indigo-200 flex items-center justify-center transition-all">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
            </div>
            <span className="text-[11px] sm:text-xs md:text-sm text-gray-500 group-hover:text-indigo-600 font-medium transition-colors text-center px-2">
              اضغط لاختيار ورفع صورة البانر
            </span>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px] flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 border-[2.5px] sm:border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] sm:text-xs text-indigo-700 font-semibold">جاري المعالجة...</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="px-3 py-2 sm:px-4 sm:py-3 bg-white flex items-center justify-between gap-1.5 sm:gap-2 border-t border-gray-100">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 shrink-0 rounded-full ${
              hasImage && banner.active
                ? "bg-emerald-500 shadow-sm shadow-emerald-200"
                : hasImage
                ? "bg-amber-400"
                : "bg-gray-300"
            }`}
          />
          <span className="font-semibold text-gray-800 text-xs sm:text-sm truncate">
            {LABELS[index] || `بانر ${index + 1}`}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={triggerInput}
            disabled={isLoading}
            className="px-2 py-1 sm:px-3 sm:py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] sm:text-xs font-semibold rounded-lg transition disabled:opacity-40 whitespace-nowrap shadow-sm"
          >
            {hasImage ? "تغيير" : "رفع"}
          </button>

          {hasImage && (
            <>
              <button
                type="button"
                onClick={() => onToggle(index)}
                disabled={isLoading}
                title={banner.active ? "إيقاف تفعيل البانر" : "تفعيل البانر"}
                className={`px-2 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition disabled:opacity-40 whitespace-nowrap flex items-center gap-1 ${
                  banner.active
                    ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                }`}
              >
                <Power className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{banner.active ? "إيقاف" : "تفعيل"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm("هل أنت متأكد من حذف هذه الصورة؟")) {
                    onDeleteImage(index);
                  }
                }}
                disabled={isLoading}
                title="حذف الصورة"
                className="p-1 sm:p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition disabled:opacity-40 border border-rose-100"
              >
                <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              if (confirm("هل أنت متأكد من حذف فتحة البانر بالكامل؟")) {
                onDeleteSlot(index);
              }
            }}
            disabled={isLoading}
            title="حذف البانر بالكامل"
            className="p-1 sm:p-1.5 bg-gray-100 hover:bg-rose-100 text-gray-400 hover:text-rose-600 rounded-lg transition disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoryBannersPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);

  // In-memory cache for loaded category banners to ensure instant switching with zero lag
  const [bannersCache, setBannersCache] = useState<Record<string, BannerItem[]>>({});
  const [loadingCategory, setLoadingCategory] = useState<Record<string, boolean>>({});
  const [actionLoadingIndex, setActionLoadingIndex] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  // Fetch initial category list
  useEffect(() => {
    let isMounted = true;
    setLoadingCategories(true);

    fetch("/api/admin/sub-categories", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { category: string }[]) => {
        if (!isMounted) return;
        if (!Array.isArray(data)) return;
        const unique = Array.from(new Set(data.map((d) => d.category).filter(Boolean))).sort((a, b) =>
          a.localeCompare(b, "ar")
        );
        setCategories(unique);
        if (unique.length > 0) {
          setSelected(unique[0]);
        }
      })
      .catch(() => {
        toast.error("فشل تحميل قائمة التصنيفات");
      })
      .finally(() => {
        if (isMounted) setLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch banners for the selected category if not cached or refresh
  const fetchCategoryBanners = useCallback(
    async (category: string, force = false) => {
      if (!category) return;
      if (!force && bannersCache[category]) return;

      setLoadingCategory((prev) => ({ ...prev, [category]: true }));
      try {
        const res = await fetch(`/api/admin/category-banners/${encodeURIComponent(category)}`, {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setBannersCache((prev) => ({ ...prev, [category]: data }));
        }
      } catch {
        toast.error("فشل جلب بانرات التصنيف");
      } finally {
        setLoadingCategory((prev) => ({ ...prev, [category]: false }));
      }
    },
    [bannersCache]
  );

  useEffect(() => {
    if (selected) {
      fetchCategoryBanners(selected);
    }
  }, [selected, fetchCategoryBanners]);

  const currentBanners = useMemo(() => {
    return bannersCache[selected] || [];
  }, [bannersCache, selected]);

  const isCurrentLoading = !!loadingCategory[selected] && !bannersCache[selected];

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.trim().toLowerCase();
    return categories.filter((c) => c.toLowerCase().includes(q));
  }, [categories, search]);

  const stats = useMemo(() => {
    const filled = currentBanners.filter((b) => b.url).length;
    const activeCount = currentBanners.filter((b) => b.url && b.active).length;
    const pausedCount = filled - activeCount;
    const emptyCount = currentBanners.length - filled;
    return { filled, activeCount, pausedCount, emptyCount, total: currentBanners.length };
  }, [currentBanners]);

  const handleUpload = async (index: number, file: File) => {
    if (!selected) return;
    setActionLoadingIndex(index);
    const form = new FormData();
    form.append("image", file);

    try {
      const res = await fetch(
        `/api/admin/category-banners/${encodeURIComponent(selected)}/upload/${index}`,
        {
          method: "POST",
          credentials: "include",
          body: form,
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الرفع");

      setBannersCache((prev) => {
        const list = prev[selected] ? [...prev[selected]] : [];
        list[index] = { ...list[index], url: data.url };
        return { ...prev, [selected]: list };
      });
      toast.success("تم رفع البانر بنجاح");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الرفع");
    } finally {
      setActionLoadingIndex(null);
    }
  };

  const handleToggle = async (index: number) => {
    if (!selected) return;
    setActionLoadingIndex(index);
    try {
      const res = await fetch(
        `/api/admin/category-banners/${encodeURIComponent(selected)}/toggle/${index}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل التعديل");

      setBannersCache((prev) => {
        const list = prev[selected] ? [...prev[selected]] : [];
        if (list[index]) {
          list[index] = { ...list[index], active: data.active };
        }
        return { ...prev, [selected]: list };
      });
      toast.success(data.active ? "تم تفعيل البانر" : "تم إيقاف البانر");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل التعديل");
    } finally {
      setActionLoadingIndex(null);
    }
  };

  const handleDeleteImage = async (index: number) => {
    if (!selected) return;
    setActionLoadingIndex(index);
    try {
      const res = await fetch(
        `/api/admin/category-banners/${encodeURIComponent(selected)}/${index}/image`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("فشل الحذف");

      setBannersCache((prev) => {
        const list = prev[selected] ? [...prev[selected]] : [];
        if (list[index]) {
          list[index] = { ...list[index], url: "" };
        }
        return { ...prev, [selected]: list };
      });
      toast.success("تم حذف الصورة بنجاح");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الحذف");
    } finally {
      setActionLoadingIndex(null);
    }
  };

  const handleDeleteSlot = async (index: number) => {
    if (!selected) return;
    setActionLoadingIndex(index);
    try {
      const res = await fetch(
        `/api/admin/category-banners/${encodeURIComponent(selected)}/${index}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("فشل الحذف");

      setBannersCache((prev) => {
        const list = (prev[selected] || []).filter((_, i) => i !== index);
        return { ...prev, [selected]: list };
      });
      toast.success("تم حذف البانر بنجاح");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الحذف");
    } finally {
      setActionLoadingIndex(null);
    }
  };

  const handleAdd = async () => {
    if (!selected) return;
    if (currentBanners.length >= MAX_BANNERS) {
      toast.error(`الحد الأقصى المسموح به هو ${MAX_BANNERS} بانرات`);
      return;
    }

    setAdding(true);
    try {
      const res = await fetch(`/api/admin/category-banners/${encodeURIComponent(selected)}/add`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشلت الإضافة");

      setBannersCache((prev) => {
        const list = prev[selected] ? [...prev[selected]] : [];
        list.push({ url: "", active: true });
        return { ...prev, [selected]: list };
      });
      toast.success("تمت إضافة فتحة بانر جديدة");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشلت الإضافة");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-blue-50/30 -mx-3 -mt-0 sm:-mx-5 md:-mx-6" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm px-3 py-3 sm:px-6 sm:py-5 md:px-8 md:py-6">
        <div className="flex items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-lg sm:rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 truncate">بانرات التصنيفات</h1>
              <p className="text-gray-500 text-[11px] sm:text-xs md:text-sm truncate sm:whitespace-normal">
                إدارة ورفع صور البانرات الترويجية لصفحات التصنيفات
              </p>
            </div>
          </div>

          {selected && (
            <button
              onClick={() => fetchCategoryBanners(selected, true)}
              disabled={loadingCategory[selected]}
              className="shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingCategory[selected] ? "animate-spin text-indigo-600" : ""}`} />
              <span className="hidden xs:inline">تحديث</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-5 md:p-8 space-y-3 sm:space-y-5">
        {/* Helper Alert */}
        <div className="flex items-start gap-2 text-indigo-900 bg-indigo-50/80 border border-indigo-200 rounded-xl p-2.5 sm:p-3 text-[11px] sm:text-xs md:text-sm leading-relaxed">
          <span className="text-sm sm:text-base shrink-0">💡</span>
          <div>
            <span className="font-semibold">طريقة العمل:</span> اختر التصنيف بالأسفل، ثم ارفع صور البانرات. يمكنك إيقاف تفعيل أي بانر مؤقتاً دون حذفه. البانرات المفعّلة فقط هي التي تظهر لزوار المتجر.
          </div>
        </div>

        {/* Categories Section */}
        {loadingCategories ? (
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm text-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2.5 sm:mb-3" />
            <p className="text-xs sm:text-sm text-gray-500">جاري تحميل التصنيفات...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 border border-gray-100 text-center shadow-sm">
            <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
            <h3 className="text-sm sm:text-base font-bold text-gray-700 mb-1">لا توجد تصنيفات حالياً</h3>
            <p className="text-xs sm:text-sm text-gray-400">قم بإضافة تصنيفات من صفحة التصنيفات الفرعية أولاً لتتمكن من إضافة بانرات لها.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {/* Search and Category Badges */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث عن تصنيف..."
                    className="w-full pl-7 pr-8 sm:pl-8 sm:pr-9 py-1 sm:py-1.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="text-[11px] sm:text-xs text-gray-400 font-medium whitespace-nowrap">
                  {filteredCategories.length} من {categories.length}
                </div>
              </div>

              {/* Horizontal scrollable category list */}
              <div
                className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 pt-0.5"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#a5b4fc #f1f5f9" }}
              >
                {filteredCategories.map((cat) => {
                  const isSelected = selected === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelected(cat)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition border whitespace-nowrap shrink-0 flex items-center gap-1 sm:gap-1.5 ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200"
                          : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      {cat}
                    </button>
                  );
                })}

                {filteredCategories.length === 0 && (
                  <div className="text-xs text-gray-400 py-2">لا يوجد تصنيف مطابق لكلمة البحث.</div>
                )}
              </div>
            </div>

            {/* Selected Category Banner Panel */}
            {selected && (
              <div className="space-y-3 sm:space-y-4">
                {/* Stats Bar and Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 sm:gap-4">
                    <span className="font-bold text-xs sm:text-sm md:text-base text-gray-800">
                      بانرات تصنيف: <span className="text-indigo-600">{selected}</span>
                    </span>

                    <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 border border-gray-200/80 rounded-lg sm:rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
                        <span className="text-gray-600">مفعّل: <b className="text-emerald-600">{stats.activeCount}</b></span>
                      </div>
                      <div className="w-px h-3 sm:h-3.5 bg-gray-200" />
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500" />
                        <span className="text-gray-600">موقوف: <b className="text-amber-600">{stats.pausedCount}</b></span>
                      </div>
                      <div className="w-px h-3 sm:h-3.5 bg-gray-200" />
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-300" />
                        <span className="text-gray-600">فارغ: <b className="text-gray-500">{stats.emptyCount}</b></span>
                      </div>
                    </div>
                  </div>

                  {currentBanners.length < MAX_BANNERS && (
                    <button
                      type="button"
                      onClick={handleAdd}
                      disabled={adding}
                      className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg sm:rounded-xl transition shadow-sm disabled:opacity-50 text-xs sm:text-sm whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      {adding ? "جاري الإضافة..." : "إضافة خانة بانر"}
                    </button>
                  )}
                </div>

                {/* Banners Grid */}
                {isCurrentLoading ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 animate-pulse h-44 sm:h-52 flex flex-col justify-between">
                        <div className="w-full h-28 sm:h-32 bg-gray-100 rounded-lg sm:rounded-xl" />
                        <div className="flex justify-between items-center pt-2">
                          <div className="w-20 sm:w-24 h-3.5 sm:h-4 bg-gray-100 rounded" />
                          <div className="w-14 sm:w-16 h-5 sm:h-6 bg-gray-100 rounded-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : currentBanners.length === 0 ? (
                  <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-12 border border-gray-100 text-center shadow-sm">
                    <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                    <h3 className="text-xs sm:text-base font-bold text-gray-700 mb-1">لا توجد بانرات مضافة لهذا التصنيف</h3>
                    <p className="text-[11px] sm:text-sm text-gray-400 mb-3 sm:mb-4">اضغط على زر إضافة خانة بانر لرفع أول صورة لهذا التصنيف.</p>
                    <button
                      type="button"
                      onClick={handleAdd}
                      disabled={adding}
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة خانة بانر
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
                    {currentBanners.map((banner, i) => (
                      <BannerCard
                        key={i}
                        banner={banner}
                        index={i}
                        isLoading={actionLoadingIndex === i}
                        onUpload={handleUpload}
                        onToggle={handleToggle}
                        onDeleteImage={handleDeleteImage}
                        onDeleteSlot={handleDeleteSlot}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
