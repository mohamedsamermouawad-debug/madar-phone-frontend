"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import {
  MessageSquareQuote,
  Star,
  Search,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  User,
  RefreshCw,
  X,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { apiFetch } from "../../lib/api";

interface Review {
  _id: string;
  name: string;
  comment: string;
  rating: number;
  gender: "male" | "female" | string;
  approved: boolean;
  createdAt: string;
}

interface ReviewFormData {
  name: string;
  comment: string;
  rating: number;
  gender: "male" | "female";
  approved: boolean;
}

const emptyForm: ReviewFormData = {
  name: "",
  comment: "",
  rating: 5,
  gender: "male",
  approved: true,
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function StarRating({
  rating,
  onChange,
  size = "md",
}: {
  rating: number;
  onChange?: (val: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const iconSize = size === "sm" ? 14 : size === "lg" ? 22 : 16;
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.round(rating);
        return (
          <button
            key={star}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(star)}
            className={`${onChange ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}`}
            aria-label={`${star} من 5 نجوم`}
          >
            <Star
              size={iconSize}
              className={`${
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "hidden">("all");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // Modals & Active state
  const [confirmDelete, setConfirmDelete] = useState<Review | null>(null);
  const [editReview, setEditReview] = useState<Review | null>(null);
  const [editForm, setEditForm] = useState<ReviewFormData>({ name: "", comment: "", rating: 5, gender: "male", approved: true });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<ReviewFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [viewCommentReview, setViewCommentReview] = useState<Review | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch reviews from API
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await apiFetch("/api/admin/reviews/all", { credentials: "include" });
      if (!res.ok) throw new Error("فشل جلب الآراء");
      const data = await res.json();
      if (Array.isArray(data)) {
        setReviews(data);
      } else {
        setReviews([]);
      }
    } catch {
      setFetchError(true);
      toast.error("تعذر تحميل الآراء، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Lock body scroll when modal is open
  const isAnyModalOpen = !!(confirmDelete || editReview || showAddForm || viewCommentReview);
  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAnyModalOpen]);

  // Handle ESC key to close active modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConfirmDelete(null);
        setEditReview(null);
        setShowAddForm(false);
        setViewCommentReview(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const total = reviews.length;
    const approvedCount = reviews.filter((r) => r.approved).length;
    const hiddenCount = total - approvedCount;
    const avgRating = total > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / total).toFixed(1)
      : "5.0";
    return { total, approvedCount, hiddenCount, avgRating };
  }, [reviews]);

  // Filtered & Paginated items
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reviews.filter((r) => {
      if (statusFilter === "approved" && !r.approved) return false;
      if (statusFilter === "hidden" && r.approved) return false;
      if (ratingFilter !== "all" && r.rating !== ratingFilter) return false;
      if (!query) return true;
      return (
        (r.name && r.name.toLowerCase().includes(query)) ||
        (r.comment && r.comment.toLowerCase().includes(query))
      );
    });
  }, [reviews, search, statusFilter, ratingFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Reset to page 1 on filter changes
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (status: "all" | "approved" | "hidden") => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleRatingChange = (rating: number | "all") => {
    setRatingFilter(rating);
    setPage(1);
  };

  // Toggle approved with optimistic UI update
  async function toggleApproved(id: string) {
    const target = reviews.find((r) => r._id === id);
    if (!target) return;
    const previousState = target.approved;
    const nextState = !previousState;

    // Optimistic UI update
    setReviews((prev) =>
      prev.map((r) => (r._id === id ? { ...r, approved: nextState } : r))
    );
    setTogglingId(id);

    try {
      const res = await apiFetch(`/api/admin/reviews/${id}/toggle`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل التحديث");
      }
      toast.success(
        nextState ? "تم إظهار الرأي في الصفحة الرئيسية ✅" : "تم إخفاء الرأي من الصفحة الرئيسية"
      );
    } catch (err: unknown) {
      // Rollback
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, approved: previousState } : r))
      );
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء التحديث";
      toast.error(msg);
    } finally {
      setTogglingId(null);
    }
  }

  // Remove review
  async function remove(id: string) {
    const target = reviews.find((r) => r._id === id);
    setConfirmDelete(null);

    // Optimistic removal
    setReviews((prev) => prev.filter((r) => r._id !== id));

    try {
      const res = await apiFetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "فشل الحذف");
      }
      toast.success("تم حذف الرأي بنجاح ✅");
    } catch (err: unknown) {
      // Rollback
      if (target) {
        setReviews((prev) => [target, ...prev]);
      }
      const msg = err instanceof Error ? err.message : "تعذر حذف الرأي";
      toast.error(msg);
    }
  }

  // Open edit modal
  function openEdit(r: Review) {
    setEditReview(r);
    setEditForm({
      name: r.name,
      comment: r.comment,
      rating: r.rating || 5,
      gender: r.gender === "female" ? "female" : "male",
      approved: r.approved ?? true,
    });
  }

  // Save edited review
  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editReview) return;
    if (!editForm.name.trim()) return toast.error("يرجى كتابة اسم العميل");
    if (!editForm.comment.trim()) return toast.error("يرجى كتابة نص التعليق");

    setSaving(true);
    try {
      const res = await apiFetch(`/api/admin/reviews/${editReview._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          comment: editForm.comment.trim(),
          rating: editForm.rating,
          gender: editForm.gender,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل حفظ التعديلات");

      setReviews((prev) => prev.map((r) => (r._id === data._id ? { ...r, ...data } : r)));
      setEditReview(null);
      toast.success("تم تعديل الرأي بنجاح ✅");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء الحفظ";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  // Save new review
  async function saveAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.name.trim()) return toast.error("يرجى كتابة اسم العميل");
    if (!addForm.comment.trim()) return toast.error("يرجى كتابة نص التعليق");

    setSaving(true);
    try {
      const res = await apiFetch("/api/admin/reviews/admin-add", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name.trim(),
          comment: addForm.comment.trim(),
          rating: addForm.rating,
          gender: addForm.gender,
          approved: addForm.approved,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل إضافة الرأي");

      setReviews((prev) => [data, ...prev]);
      setShowAddForm(false);
      setAddForm(emptyForm);
      toast.success("تم إضافة الرأي بنجاح ✅");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء الإضافة";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  const copyComment = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputCls =
    "w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";

  return (
    <div dir="rtl" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <MessageSquareQuote className="text-blue-600 size-6" />
            آراء وتقييمات العملاء
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إدارة آراء العملاء المعروضة في الصفحة الرئيسية والموقع
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReviews}
            disabled={loading}
            title="تحديث البيانات"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-blue-600" : ""} />
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-blue-500/10 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} />
            إضافة تقييم جديد
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">إجمالي الآراء</span>
            <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquareQuote size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{stats.total}</div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">معروض في الرئيسية</span>
            <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.approvedCount}</div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">مخفي / قيد المراجعة</span>
            <div className="size-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.hiddenCount}</div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">متوسط التقييم</span>
            <div className="size-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star size={18} className="fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-800">{stats.avgRating}</span>
            <span className="text-xs text-slate-400">/ 5 نجوم</span>
          </div>
        </div>
      </div>

      {/* Main Content Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Filters & Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="ابحث بالاسم أو التعليق..."
              className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-8 py-2 text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {search && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Status Filter */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button
                onClick={() => handleStatusChange("all")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                الكل ({reviews.length})
              </button>
              <button
                onClick={() => handleStatusChange("approved")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  statusFilter === "approved"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                المعروض ({stats.approvedCount})
              </button>
              <button
                onClick={() => handleStatusChange("hidden")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  statusFilter === "hidden"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                المخفي ({stats.hiddenCount})
              </button>
            </div>

            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) =>
                handleRatingChange(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
            >
              <option value="all">كل النجوم</option>
              <option value={5}>5 نجوم ★★★★★</option>
              <option value={4}>4 نجوم ★★★★☆</option>
              <option value={3}>3 نجوم ★★★☆☆</option>
              <option value={2}>نجمتان ★★☆☆☆</option>
              <option value={1}>نجمة واحدة ★☆☆☆☆</option>
            </select>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-slate-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                    <div className="h-3 w-48 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Fetch Error State */}
        {!loading && fetchError && (
          <div className="p-12 text-center">
            <AlertCircle className="size-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">تعذر تحميل قائمة الآراء</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-4">
              حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة مرة أخرى
            </p>
            <button
              onClick={fetchReviews}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw size={14} /> إعادة المحاولة
            </button>
          </div>
        )}

        {/* Desktop Table View */}
        {!loading && !fetchError && (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-100 text-xs">
                  <tr>
                    <th className="px-5 py-3.5">العميل</th>
                    <th className="px-5 py-3.5">التعليق</th>
                    <th className="px-5 py-3.5">التقييم</th>
                    <th className="px-5 py-3.5">التاريخ</th>
                    <th className="px-5 py-3.5 text-center">العرض بالرئيسية</th>
                    <th className="px-5 py-3.5 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Customer info */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`size-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              r.gender === "female"
                                ? "bg-pink-100 text-pink-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {r.name?.trim().charAt(0) || <User size={14} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{r.name}</p>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {r.gender === "female" ? "أنثى" : "ذكر"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Comment */}
                      <td className="px-5 py-4 max-w-sm">
                        <button
                          type="button"
                          onClick={() => setViewCommentReview(r)}
                          className="text-right text-xs text-slate-600 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2"
                          title="انقر لقراءة التعليق كاملًا"
                        >
                          {r.comment}
                        </button>
                      </td>

                      {/* Rating */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <StarRating rating={r.rating || 5} size="sm" />
                          <span className="text-xs font-bold text-slate-600">
                            ({r.rating || 5})
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                        {formatDate(r.createdAt)}
                      </td>

                      {/* Approved Toggle */}
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => toggleApproved(r._id)}
                          disabled={togglingId === r._id}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 ${
                            r.approved ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                          title={r.approved ? "معروض في الموقع - انقر للإخفاء" : "مخفي - انقر للإظهار"}
                          aria-label={r.approved ? "إخفاء من الرئيسية" : "إظهار في الرئيسية"}
                        >
                          <span
                            className={`inline-block size-4.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                              r.approved ? "-translate-x-5.5" : "-translate-x-1"
                            }`}
                          />
                        </button>
                        <div className="text-[10px] font-semibold mt-1">
                          {r.approved ? (
                            <span className="text-emerald-600">معروض</span>
                          ) : (
                            <span className="text-slate-400">مخفي</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(r)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="تعديل الرأي"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(r)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="حذف الرأي"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                        <MessageSquareQuote size={36} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-semibold text-slate-600">لا توجد تقييمات مطابقة</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          جرب تغيير كلمات البحث أو خيارات التصفية
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-slate-100">
              {paginated.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <MessageSquareQuote size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-semibold text-slate-600">لا توجد تقييمات مطابقة</p>
                  <p className="text-xs text-slate-400 mt-0.5">جرب تغيير كلمات البحث أو الفلاتر</p>
                </div>
              )}
              {paginated.map((r) => (
                <div key={r._id} className="p-4 space-y-3 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`size-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          r.gender === "female"
                            ? "bg-pink-100 text-pink-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {r.name?.trim().charAt(0) || <User size={14} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{r.name}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{r.gender === "female" ? "أنثى" : "ذكر"}</span>
                          <span>•</span>
                          <span>{formatDate(r.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                        title="تعديل"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(r)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewCommentReview(r)}
                    className="w-full text-right text-xs text-slate-700 bg-slate-50/70 hover:bg-slate-100 p-3 rounded-xl transition-colors line-clamp-3 cursor-pointer"
                  >
                    {r.comment}
                  </button>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={r.rating || 5} size="sm" />
                      <span className="text-xs font-bold text-slate-600">({r.rating || 5})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${r.approved ? "text-emerald-600" : "text-slate-400"}`}>
                        {r.approved ? "معروض" : "مخفي"}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleApproved(r._id)}
                        disabled={togglingId === r._id}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
                          r.approved ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block size-4.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                            r.approved ? "-translate-x-5.5" : "-translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="px-4 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>
                  إظهار {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} إلى{" "}
                  {Math.min(currentPage * pageSize, filtered.length)} من أصل {filtered.length} رأي
                </span>
                <div className="flex items-center gap-1">
                  <span>|</span>
                  <label htmlFor="pageSizeSelect" className="text-slate-400">عدد النتائج:</label>
                  <select
                    id="pageSizeSelect"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="bg-white border border-slate-200 rounded-md px-2 py-0.5 text-xs text-slate-700"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-bold border border-slate-200 bg-white rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                >
                  السابق
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`dots-${i}`} className="px-2 text-slate-400 text-xs">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p as number)}
                        className={`min-w-8 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                          currentPage === p
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-bold border border-slate-200 bg-white rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                >
                  التالي
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* View Comment Full Modal */}
      {viewCommentReview && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
          onClick={() => setViewCommentReview(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`size-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    viewCommentReview.gender === "female"
                      ? "bg-pink-100 text-pink-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {viewCommentReview.name?.trim().charAt(0) || <User size={16} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{viewCommentReview.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRating rating={viewCommentReview.rating || 5} size="sm" />
                    <span className="text-xs text-slate-400 font-medium">
                      ({formatDate(viewCommentReview.createdAt)})
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewCommentReview(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {viewCommentReview.comment}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => copyComment(viewCommentReview.comment)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-slate-200/70 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? "تم النسخ" : "نسخ التعليق"}
              </button>

              <button
                type="button"
                onClick={() => setViewCommentReview(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="size-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={26} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">حذف الرأي</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                هل أنت متأكد من حذف تقييم العميل{" "}
                <strong className="text-slate-700 font-bold">&quot;{confirmDelete.name}&quot;</strong>؟
                لا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>
            <div className="flex gap-2.5 justify-center pt-2">
              <button
                type="button"
                onClick={() => remove(confirmDelete._id)}
                className="bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                نعم، تأكيد الحذف
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {editReview && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
          onClick={() => setEditReview(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Edit3 className="text-blue-600 size-5" />
                تعديل الرأي
              </h3>
              <button
                type="button"
                onClick={() => setEditReview(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم الزبون / العميل *</label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="مثال: أحمد محمد"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">الجنس</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className={inputCls}
                  >
                    <option value="male">ذكر (أيقونة زرقاء)</option>
                    <option value="female">أنثى (أيقونة وردية)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">التقييم (بالنجوم)</label>
                  <div className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 flex items-center justify-between">
                    <StarRating
                      rating={editForm.rating}
                      onChange={(val) => setEditForm({ ...editForm, rating: val })}
                      size="md"
                    />
                    <span className="text-xs font-bold text-slate-700">{editForm.rating} ★</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">نص التعليق والتجربة *</label>
                  <span className="text-[11px] text-slate-400">{editForm.comment.length} / 1000</span>
                </div>
                <textarea
                  required
                  rows={4}
                  maxLength={1000}
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                  placeholder="اكتب تجربة العميل بالتفصيل..."
                  className={inputCls}
                />
              </div>

              <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditReview(null)}
                  className="border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Review Modal */}
      {showAddForm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
          onClick={() => {
            setShowAddForm(false);
            setAddForm(emptyForm);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Plus className="text-blue-600 size-5" />
                إضافة رأي عميل جديد
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setAddForm(emptyForm);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم العميل *</label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="مثال: سارة العتيبي"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">الجنس</label>
                  <select
                    value={addForm.gender}
                    onChange={(e) => setAddForm({ ...addForm, gender: e.target.value as "male" | "female" })}
                    className={inputCls}
                  >
                    <option value="male">ذكر (أيقونة زرقاء)</option>
                    <option value="female">أنثى (أيقونة وردية)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">التقييم (بالنجوم)</label>
                  <div className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 flex items-center justify-between">
                    <StarRating
                      rating={addForm.rating}
                      onChange={(val) => setAddForm({ ...addForm, rating: val })}
                      size="md"
                    />
                    <span className="text-xs font-bold text-slate-700">{addForm.rating} ★</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">نص الرأي والتجربة *</label>
                  <span className="text-[11px] text-slate-400">{addForm.comment.length} / 1000</span>
                </div>
                <textarea
                  required
                  rows={4}
                  maxLength={1000}
                  value={addForm.comment}
                  onChange={(e) => setAddForm({ ...addForm, comment: e.target.value })}
                  placeholder="اكتب تجربة العميل مع المنتجات أو التوصيل..."
                  className={inputCls}
                />
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <input
                  type="checkbox"
                  id="add_approved"
                  checked={addForm.approved}
                  onChange={(e) => setAddForm({ ...addForm, approved: e.target.checked })}
                  className="size-4.5 rounded accent-blue-600 cursor-pointer"
                />
                <label htmlFor="add_approved" className="text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer">
                  عرض الرأي مباشرة في الصفحة الرئيسية والموقع
                </label>
              </div>

              <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setAddForm(emptyForm);
                  }}
                  className="border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "جاري الإضافة..." : "إضافة الرأي"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
