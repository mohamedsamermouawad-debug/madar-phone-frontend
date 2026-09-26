"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type OrderItem = { productId: string; name: string; price: number; quantity: number; image?: string };

type Order = {
  _id: string;
  orderId: string;
  customer: string;
  whatsapp: string;
  nationalId: string;
  address: string;
  installmentType: "installment" | "full";
  months: number;
  monthlyPayment: number;
  total: number;
  downPayment: number;
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardHolder: string;
  items: OrderItem[];
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
};

const STATUS = {
  pending: { label: "قيد الانتظار", cls: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  confirmed: { label: "مؤكد", cls: "bg-green-100 text-green-700 border-green-300" },
  cancelled: { label: "ملغي", cls: "bg-red-100 text-red-700 border-red-300" },
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const perPage = 10;
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [search]);

  const loadOrders = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(perPage),
      });
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();

      if (Array.isArray(data)) {
        // Fallback for legacy format
        setOrders(data);
        setTotalPages(Math.ceil(data.length / perPage) || 1);
        setTotalCount(data.length);
      } else if (data && Array.isArray(data.orders)) {
        setOrders(data.orders);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      } else {
        setOrders([]);
      }
    } catch {
      if (!isBackground) toast.error("تعذر تحميل الطلبات");
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [page, perPage, debouncedSearch, statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Smart polling: only poll when document is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden && !actionLoadingId) {
        loadOrders(true);
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [loadOrders, actionLoadingId]);

  async function deleteOrder(id: string) {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("تم حذف الطلب بنجاح ✅");
        setConfirmDelete(null);
        loadOrders();
      } else {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || "فشل حذف الطلب");
      }
    } catch {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function changeStatus(id: string, newStatus: string) {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === id ? { ...o, status: newStatus as Order["status"] } : o))
        );
        toast.success("تم تحديث حالة الطلب ✅");
      } else {
        toast.error(data.error || "فشل تحديث الحالة");
      }
    } catch {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="min-w-0 overflow-x-hidden" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">إدارة الطلبات</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            إجمالي الطلبات: <span className="font-semibold text-purple-700">{totalCount}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadOrders()}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            تحديث
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3 bg-gray-50/50 border-b border-gray-100">
          {/* Status tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "الكل" },
              { id: "pending", label: "قيد الانتظار" },
              { id: "confirmed", label: "المؤكدة" },
              { id: "cancelled", label: "الملغية" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                  statusFilter === tab.id
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-64 bg-white"
              placeholder="ابحث باسم، واتس، هوية، أو رقم طلب..."
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300" style={{ WebkitOverflowScrolling: "touch" }}>
          <table className="w-full text-sm text-right" style={{ minWidth: "1050px" }}>
            <thead className="bg-gray-50 text-gray-600 font-semibold text-xs sm:text-sm border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-12 text-center">#</th>
                <th className="px-4 py-3">العميل</th>
                <th className="px-4 py-3">رقم الواتساب</th>
                <th className="px-4 py-3">نظام الدفع</th>
                <th className="px-4 py-3">الإجمالي</th>
                <th className="px-4 py-3">الدفعة الأولى</th>
                <th className="px-4 py-3">تاريخ الطلب</th>
                <th className="px-4 py-3 text-center">الحالة</th>
                <th className="px-4 py-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-7 h-7 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">جاري تحميل الطلبات...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    لا توجد طلبات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                orders.map((o, i) => {
                  const isRowBusy = actionLoadingId === o._id;
                  const rowNum = (page - 1) * perPage + i + 1;
                  return (
                    <tr key={o._id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-4 py-3.5 text-center text-gray-400 font-mono text-xs">{rowNum}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-gray-800 text-sm">{o.customer || "-"}</div>
                        <div className="text-[11px] text-gray-400 font-mono" dir="ltr">#{o.orderId}</div>
                      </td>
                      <td className="px-4 py-3.5" dir="ltr">
                        {o.whatsapp ? (
                          <a
                            href={`https://wa.me/${o.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                          >
                            <span>💬</span>
                            {o.whatsapp}
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600">
                        {o.installmentType === "installment" ? (
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-medium">
                            تقسيط ({o.months} شهر)
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">كامل</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-gray-900 text-sm">
                        {o.total?.toLocaleString("ar-EG")} ر.س
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600">
                        {o.installmentType === "installment" ? `${o.downPayment?.toLocaleString("ar-EG")} ر.س` : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500 font-mono">
                        {new Date(o.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS[o.status]?.cls || "bg-gray-100 text-gray-700"}`}>
                          {STATUS[o.status]?.label || o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {/* Details */}
                          <button
                            onClick={() => router.push(`/admin/orders/${o._id}`)}
                            className="inline-flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-lg transition whitespace-nowrap"
                            title="تفاصيل الطلب"
                          >
                            <span>✏️</span>
                            تفاصيل
                          </button>

                          {/* Print Invoice */}
                          <button
                            onClick={() => window.open(`/admin/orders/${o._id}/invoice`, "_blank")}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2 py-1 rounded-lg transition whitespace-nowrap"
                            title="الفاتورة"
                          >
                            <span>🧾</span>
                            فاتورة
                          </button>

                          {/* Receipt */}
                          <button
                            onClick={() => window.open(`/admin/orders/${o._id}/receipt`, "_blank")}
                            className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-2 py-1 rounded-lg transition whitespace-nowrap"
                            title="سند قبض"
                          >
                            <span>📑</span>
                            سند
                          </button>

                          {/* Contract */}
                          <button
                            onClick={() => window.open(`/admin/orders/${o._id}/contract`, "_blank")}
                            className="inline-flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-2 py-1 rounded-lg transition whitespace-nowrap"
                            title="عقد التقسيط"
                          >
                            <span>📜</span>
                            عقد
                          </button>

                          {/* Confirm Button */}
                          {o.status === "pending" && (
                            <button
                              disabled={isRowBusy}
                              onClick={() => changeStatus(o._id, "confirmed")}
                              className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-semibold px-2 py-1 rounded-lg transition whitespace-nowrap"
                            >
                              {isRowBusy ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : "✓ تأكيد"}
                            </button>
                          )}

                          {/* Cancel Button */}
                          {o.status !== "cancelled" && (
                            <button
                              disabled={isRowBusy}
                              onClick={() => changeStatus(o._id, "cancelled")}
                              className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold px-2 py-1 rounded-lg transition whitespace-nowrap"
                            >
                              {isRowBusy ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : "✕ إلغاء"}
                            </button>
                          )}

                          {/* Cancellation Invoice */}
                          {o.status === "cancelled" && (
                            <button
                              onClick={() => window.open(`/admin/orders/${o._id}/cancellation`, "_blank")}
                              className="inline-flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-2 py-1 rounded-lg transition whitespace-nowrap"
                            >
                              <span>❌</span>
                              فاتورة إلغاء
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            disabled={isRowBusy}
                            onClick={() => setConfirmDelete({ id: o._id, name: o.customer || o.orderId })}
                            className="inline-flex items-center gap-1 text-red-500 hover:bg-red-50 disabled:opacity-50 p-1.5 rounded-lg transition"
                            title="حذف الطلب"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs sm:text-sm text-gray-600">
            <span>
              عرض الصفحة <strong className="text-purple-700">{page}</strong> من إجمالي <strong>{totalPages}</strong> صفحات ({totalCount} طلب)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
              >
                السابق
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                  let pageNum = idx + 1;
                  if (totalPages > 5 && page > 3) {
                    pageNum = Math.min(totalPages - 4 + idx, page - 2 + idx);
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                        page === pageNum
                          ? "bg-purple-600 text-white shadow-sm"
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mx-auto mb-3">
              🗑️
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">تأكيد حذف الطلب</h2>
            <p className="text-xs text-gray-500 mb-2">هل أنت متأكد من رغبتك في حذف طلب:</p>
            <p className="text-sm font-bold text-red-600 bg-red-50 py-1.5 px-3 rounded-lg mb-5 border border-red-100">
              « {confirmDelete.name} »
            </p>
            <div className="flex gap-2.5 justify-center">
              <button
                disabled={actionLoadingId !== null}
                onClick={() => deleteOrder(confirmDelete.id)}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs sm:text-sm font-bold py-2 rounded-xl transition"
              >
                {actionLoadingId ? "جاري الحذف..." : "نعم، احذف"}
              </button>
              <button
                disabled={actionLoadingId !== null}
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-300 text-gray-700 text-xs sm:text-sm font-bold py-2 rounded-xl hover:bg-gray-50 transition"
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
