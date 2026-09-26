"use client";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

type Product = {
  _id: string;
  name: string;
  category: string;
  image?: string;
  price: number;
  originalPrice: number;
  salePrice?: number;
  inStock?: boolean;
};

type SubCat = { name: string; category: string; count: number };

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [subCategories, setSubCategories] = useState<SubCat[]>([]);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(() => Number(searchParams.get("page")) || 1);
  const PAGE_SIZE = 15;

  // Search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch categories once
  useEffect(() => {
    fetch("/api/admin/sub-categories", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setSubCategories(data);
      })
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(PAGE_SIZE),
      });
      if (selectedCat) params.set("category", selectedCat);
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

      const res = await fetch(`/api/admin/products?${params.toString()}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.products)) {
          setProducts(data.products);
          setTotalCount(data.total || 0);
          setTotalPages(data.totalPages || 1);
        } else if (Array.isArray(data)) {
          setProducts(data);
          setTotalCount(data.length);
          setTotalPages(Math.ceil(data.length / PAGE_SIZE) || 1);
        }
      }
    } catch (err) {
      console.error("fetchProducts error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCat, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function confirmDeleteAction() {
    if (!confirmDelete || isDeleting) return;
    const { id, name } = confirmDelete;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE", credentials: "include" });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) {
        toast.error(data.message || data.error || "فشل الحذف");
      } else {
        toast.success(`تم حذف "${name}" بنجاح ✅`);
        setConfirmDelete(null);
        fetchProducts();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ أثناء الحذف");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الأصناف</h1>
          <p className="text-xs text-gray-400 mt-0.5">إدارة جميع المنتجات والأسعار والمخزون</p>
        </div>
        <button
          onClick={() => router.push("/admin/products/new")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <span className="text-lg leading-none">+</span>
          إضافة منتج جديد
        </button>
      </div>

      {subCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
          <button
            onClick={() => { setSelectedCat(null); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
              selectedCat === null
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            الكل
          </button>
          {subCategories.map((cat) => (
            <button
              key={`${cat.category}-${cat.name}`}
              onClick={() => { setSelectedCat(cat.name); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
                selectedCat === cat.name
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {cat.name}
              <span className="mr-1 text-xs opacity-75">({cat.count})</span>
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
          <span className="text-sm text-gray-500">
            إجمالي المنتجات: <span className="font-bold text-gray-700">{totalCount}</span>
          </span>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن منتج أو تصنيف..."
              className="border border-gray-300 rounded-lg pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            <span className="absolute right-3 top-2.5 text-gray-400 text-sm pointer-events-none">🔍</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-sm text-right">
            <thead className="bg-gray-50 text-gray-600 font-semibold text-sm">
              <tr>
                <th className="px-5 py-3 w-12">#</th>
                <th className="px-5 py-3 min-w-[220px]">المنتج</th>
                <th className="px-5 py-3 min-w-[140px]">التصنيف</th>
                <th className="px-5 py-3 min-w-[130px]">السعر</th>
                <th className="px-5 py-3 min-w-[100px]">الحالة</th>
                <th className="px-5 py-3 min-w-[100px]">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`sk-${idx}`} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 w-6 bg-gray-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-40 bg-gray-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                  </tr>
                ))
              ) : products.length > 0 ? (
                products.map((p, i) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-400 font-medium text-xs">
                      {(currentPage - 1) * PAGE_SIZE + i + 1}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                            <Image
                              src={p.image.startsWith("http") ? p.image : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${p.image.startsWith("/") ? p.image : `/${p.image}`}`}
                              alt={p.name}
                              fill
                              unoptimized
                              className="object-contain p-0.5"
                            />
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 shrink-0">
                            📱
                          </div>
                        )}
                        <span className="line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{p.category || "—"}</td>
                    <td className="px-5 py-3 text-gray-700">
                      {(() => {
                        const mainPrice = p.originalPrice || p.price || 0;
                        const sale = p.salePrice && p.salePrice > 0 && p.salePrice < mainPrice ? p.salePrice : null;
                        return sale ? (
                          <span>
                            <span className="text-green-600 font-bold">{sale} ر.س</span>
                            <span className="text-gray-400 line-through text-xs mr-1">{mainPrice}</span>
                          </span>
                        ) : (
                          <span className="font-semibold">{mainPrice} ر.س</span>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.inStock !== false ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                        {p.inStock !== false ? "متوفر" : "غير متوفر"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => router.push(`/admin/products/${p._id}/edit`)}
                          className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                          title="تعديل"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ id: p._id, name: p.name })}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                          title="حذف"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <div className="text-3xl mb-2">📦</div>
                    <p className="font-medium">لا توجد منتجات تطابق البحث</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-6 flex-wrap">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
            className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
          >
            ‹ السابق
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
            .reduce<(number | string)[]>((acc, p, i, arr) => {
              if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((page, idx) =>
              page === "..." ? (
                <span key={`dots-${idx}`} className="px-2 py-1 text-gray-400 text-xs">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  disabled={loading}
                  className={`min-w-[34px] px-2.5 py-1.5 rounded-lg border text-xs sm:text-sm font-semibold transition-colors ${
                    page === currentPage
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || loading}
            className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
          >
            التالي ›
          </button>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" dir="rtl">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">تأكيد الحذف</h2>
            <p className="text-sm text-gray-500 mb-1">هل أنت متأكد من حذف المنتج؟</p>
            <p className="text-base font-bold text-red-600 mb-4">« {confirmDelete.name} »</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={confirmDeleteAction}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? "جاري الحذف..." : "نعم، احذف"}
              </button>
              <button
                onClick={() => !isDeleting && setConfirmDelete(null)}
                disabled={isDeleting}
                className="border border-gray-300 text-gray-700 text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">جاري التحميل...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

