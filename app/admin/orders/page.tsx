"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Search,
  RefreshCw,
  Eye,
  FileText,
  Receipt,
  FileSignature,
  FileX,
  Check,
  X,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Calendar,
  CreditCard,
  Layers,
  Inbox,
  AlertTriangle,
  MoveHorizontal,
  Loader2,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

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
  pending: {
    label: "قيد الانتظار",
    icon: Clock,
    badgeCls: "bg-amber-50 text-amber-700 border-amber-200/80",
    dotCls: "bg-amber-500",
  },
  confirmed: {
    label: "مؤكد",
    icon: CheckCircle2,
    badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dotCls: "bg-emerald-500",
  },
  cancelled: {
    label: "ملغي",
    icon: XCircle,
    badgeCls: "bg-rose-50 text-rose-700 border-rose-200/80",
    dotCls: "bg-rose-500",
  },
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

  // Horizontal mouse-drag scrolling state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [draggedFar, setDraggedFar] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setDraggedFar(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => setDraggedFar(false), 50);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
    if (Math.abs(walk) > 6) {
      setDraggedFar(true);
    }
  };

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
        toast.success("تم حذف الطلب بنجاح");
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
        toast.success("تم تحديث حالة الطلب");
      } else {
        toast.error(data.error || "فشل تحديث الحالة");
      }
    } catch {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setActionLoadingId(null);
    }
  }

  const safeAction = (callback: () => void) => {
    if (!draggedFar) {
      callback();
    }
  };

  return (
    <div className="w-full max-w-full space-y-4" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">إدارة الطلبات</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/60">
              {totalCount} طلب
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            متابعة وإدارة طلبات العملاء، الفواتير، العقود، وسندات القبض
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadOrders()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl transition-all disabled:opacity-50 active:scale-98"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${loading ? "animate-spin text-purple-600" : ""}`} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Filter and Search Bar */}
        <div className="p-3.5 sm:p-4 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "الكل" },
              { id: "pending", label: "قيد الانتظار" },
              { id: "confirmed", label: "المؤكدة" },
              { id: "cancelled", label: "الملغية" },
            ].map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setPage(1);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    active
                      ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100/80 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-8 py-1.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
              placeholder="ابحث بالاسم، الواتس، أو رقم الطلب..."
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scroll hint badge on mobile */}
        <div className="flex sm:hidden items-center justify-between px-4 py-2 bg-purple-50/40 border-b border-purple-100/50 text-[11px] text-purple-700">
          <span className="flex items-center gap-1">
            <MoveHorizontal className="w-3.5 h-3.5 animate-pulse" />
            اسحب أفقياً باللمس لعرض كامل البيانات والإجراءات
          </span>
        </div>

        {/* Horizontal scroll container with touch & mouse drag support */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`overflow-x-auto select-none sm:select-auto cursor-grab active:cursor-grabbing transition-colors scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${
            isDragging ? "cursor-grabbing" : ""
          }`}
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x pan-y",
          }}
        >
          <table className="w-full text-right text-xs sm:text-sm border-collapse" style={{ minWidth: "1080px" }}>
            <thead>
              <tr className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-200 text-xs">
                <th className="py-3 px-3.5 text-center w-12 whitespace-nowrap">#</th>
                <th className="py-3 px-3.5 whitespace-nowrap">بيانات العميل</th>
                <th className="py-3 px-3.5 whitespace-nowrap">رقم التواصل</th>
                <th className="py-3 px-3.5 whitespace-nowrap">نظام الدفع</th>
                <th className="py-3 px-3.5 whitespace-nowrap">الإجمالي</th>
                <th className="py-3 px-3.5 whitespace-nowrap">الدفعة الأولى</th>
                <th className="py-3 px-3.5 whitespace-nowrap">تاريخ الطلب</th>
                <th className="py-3 px-3.5 text-center whitespace-nowrap">الحالة</th>
                <th className="py-3 px-3.5 text-center whitespace-nowrap">الإجراءات والعمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                      <span className="text-xs text-gray-500 font-medium">جاري تحميل الطلبات...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <Inbox className="w-5 h-5" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500 font-medium">لا توجد طلبات مطابقة للبحث أو التصفية</span>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o, i) => {
                  const isRowBusy = actionLoadingId === o._id;
                  const rowNum = (page - 1) * perPage + i + 1;
                  const statusConf = STATUS[o.status] || STATUS.pending;
                  const StatusIcon = statusConf.icon;

                  return (
                    <tr
                      key={o._id}
                      className="hover:bg-purple-50/25 transition-colors group"
                    >
                      {/* # Index */}
                      <td className="py-3 px-3.5 text-center text-gray-400 font-mono text-xs whitespace-nowrap">
                        {rowNum}
                      </td>

                      {/* Customer Name & Order ID (Single line) */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                            {o.customer || "عميل غير مسمى"}
                          </span>
                          <span
                            className="text-[11px] font-mono text-purple-700 bg-purple-50 border border-purple-200/60 px-1.5 py-0.5 rounded font-medium"
                            dir="ltr"
                          >
                            #{o.orderId}
                          </span>
                        </div>
                      </td>

                      {/* WhatsApp (Single line) */}
                      <td className="py-3 px-3.5 whitespace-nowrap" dir="ltr">
                        {o.whatsapp ? (
                          <a
                            href={`https://wa.me/${o.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              if (draggedFar) e.preventDefault();
                            }}
                            className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-medium text-xs bg-emerald-50/90 hover:bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-200/80 transition shadow-2xs"
                          >
                            <FaWhatsapp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{o.whatsapp}</span>
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Payment Type (Single line) */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {o.installmentType === "installment" ? (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200/70 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                            <Layers className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>تقسيط ({o.months} شهر)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 border border-gray-200/80 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                            <CreditCard className="w-3 h-3 text-gray-500 shrink-0" />
                            <span>كامل</span>
                          </span>
                        )}
                      </td>

                      {/* Total (Single line) */}
                      <td className="py-3 px-3.5 font-bold text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                        {o.total?.toLocaleString("ar-EG")} <span className="text-[11px] font-normal text-gray-500">ر.س</span>
                      </td>

                      {/* Down Payment (Single line) */}
                      <td className="py-3 px-3.5 text-xs text-gray-600 whitespace-nowrap">
                        {o.installmentType === "installment" ? (
                          <span className="font-semibold text-gray-800">
                            {o.downPayment?.toLocaleString("ar-EG")} <span className="text-[10px] font-normal text-gray-500">ر.س</span>
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Created Date (Single line) */}
                      <td className="py-3 px-3.5 text-xs text-gray-500 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="font-mono">
                            {new Date(o.createdAt).toLocaleDateString("ar-EG", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </span>
                      </td>

                      {/* Status Badge (Single line) */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${statusConf.badgeCls}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dotCls}`} />
                          <StatusIcon className="w-3 h-3 shrink-0" />
                          <span>{statusConf.label}</span>
                        </span>
                      </td>

                      {/* Actions (Single line) */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-1">
                          {/* Details Button */}
                          <button
                            onClick={() => safeAction(() => router.push(`/admin/orders/${o._id}`))}
                            className="inline-flex items-center gap-1 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all shadow-2xs active:scale-95"
                            title="تفاصيل الطلب"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>تفاصيل</span>
                          </button>

                          {/* Invoice Button */}
                          <button
                            onClick={() => safeAction(() => window.open(`/admin/orders/${o._id}/invoice`, "_blank"))}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all shadow-2xs active:scale-95"
                            title="فاتورة الطلب"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>فاتورة</span>
                          </button>

                          {/* Receipt Voucher */}
                          <button
                            onClick={() => safeAction(() => window.open(`/admin/orders/${o._id}/receipt`, "_blank"))}
                            className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all shadow-2xs active:scale-95"
                            title="سند قبض"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>سند</span>
                          </button>

                          {/* Contract */}
                          <button
                            onClick={() => safeAction(() => window.open(`/admin/orders/${o._id}/contract`, "_blank"))}
                            className="inline-flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all shadow-2xs active:scale-95"
                            title="عقد التقسيط"
                          >
                            <FileSignature className="w-3.5 h-3.5" />
                            <span>عقد</span>
                          </button>

                          {/* Confirm Status Button */}
                          {o.status === "pending" && (
                            <button
                              disabled={isRowBusy}
                              onClick={() => safeAction(() => changeStatus(o._id, "confirmed"))}
                              className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all shadow-2xs active:scale-95"
                              title="تأكيد الطلب"
                            >
                              {isRowBusy ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>تأكيد</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Cancel Status Button */}
                          {o.status !== "cancelled" && (
                            <button
                              disabled={isRowBusy}
                              onClick={() => safeAction(() => changeStatus(o._id, "cancelled"))}
                              className="inline-flex items-center gap-1 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all shadow-2xs active:scale-95"
                              title="إلغاء الطلب"
                            >
                              {isRowBusy ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <X className="w-3.5 h-3.5" />
                                  <span>إلغاء</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Cancellation Invoice */}
                          {o.status === "cancelled" && (
                            <button
                              onClick={() => safeAction(() => window.open(`/admin/orders/${o._id}/cancellation`, "_blank"))}
                              className="inline-flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all shadow-2xs active:scale-95"
                              title="فاتورة الإلغاء"
                            >
                              <FileX className="w-3.5 h-3.5" />
                              <span>فاتورة إلغاء</span>
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            disabled={isRowBusy}
                            onClick={() => safeAction(() => setConfirmDelete({ id: o._id, name: o.customer || o.orderId }))}
                            className="inline-flex items-center justify-center text-rose-500 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-50 p-1.5 rounded-lg transition-all"
                            title="حذف الطلب نهائياً"
                          >
                            <Trash2 className="w-4 h-4" />
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-gray-50/80 border-t border-gray-100 text-xs text-gray-600">
            <span>
              عرض الصفحة <strong className="text-purple-700 font-bold">{page}</strong> من إجمالي{" "}
              <strong className="text-gray-800">{totalPages}</strong> صفحات ({totalCount} طلب)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium shadow-2xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>السابق</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                  let pageNum = idx + 1;
                  if (totalPages > 5 && page > 3) {
                    pageNum = Math.min(totalPages - 4 + idx, page - 2 + idx);
                  }
                  const isActive = page === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-purple-600 text-white shadow-xs"
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
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium shadow-2xs"
              >
                <span>التالي</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modern Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150" dir="rtl">
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 w-full max-w-sm text-center border border-gray-100 transform transition-all">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3.5 border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1">تأكيد حذف الطلب</h2>
            <p className="text-xs text-gray-500 mb-3">هل أنت متأكد من رغبتك في حذف طلب العميل؟</p>
            <div className="text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50/70 py-2 px-3 rounded-xl mb-5 border border-rose-100 break-words">
              « {confirmDelete.name} »
            </div>
            <div className="flex gap-2 justify-center">
              <button
                disabled={actionLoadingId !== null}
                onClick={() => deleteOrder(confirmDelete.id)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl transition-all shadow-xs"
              >
                {actionLoadingId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>نعم، حذف</span>
                  </>
                )}
              </button>
              <button
                disabled={actionLoadingId !== null}
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-200 text-gray-700 text-xs sm:text-sm font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-all"
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
