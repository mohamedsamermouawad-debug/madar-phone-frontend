"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { IoArrowForward, IoArrowBack } from "react-icons/io5";
import ProductCard from "../../../components/products/ProductCard";
import type { Product } from "../../../components/products/types";

const ITEMS_PER_PAGE = 12;

interface Props {
  products: Product[];
  loading: boolean;
  page: number;
  onPageChange: (p: number) => void;
  emoji?: string;
  reserveMode?: boolean;
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden bg-white"
      style={{ border: "1px solid #EAF3F8", boxShadow: "0 2px 16px rgba(0,48,72,0.04)" }}
    >
      <div className="w-full aspect-square bg-gray-50 animate-pulse" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-2.5 bg-gray-100 animate-pulse rounded-full w-2/3" />
        <div className="h-3.5 bg-gray-100 animate-pulse rounded-full w-5/6" />
        <div className="h-3 bg-gray-100 animate-pulse rounded-full w-1/2" />
        <div className="h-9 bg-gray-100 animate-pulse rounded-xl mt-3" />
      </div>
    </div>
  );
}

export default function ProductsGrid({
  products,
  loading,
  page,
  onPageChange,
  emoji = "📦",
  reserveMode = false,
}: Props) {
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginated = products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const goTo = (p: number) => {
    onPageChange(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div
        className={`grid gap-2.5 sm:gap-4 ${
          reserveMode
            ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
            : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
        }`}
      >
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  /* ── Empty ── */
  if (!products.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-28 gap-5 text-center"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl"
          style={{
            background: "linear-gradient(135deg, #EAF6FA, #D4EEF5)",
            border: "1px solid rgba(8,137,162,0.18)",
          }}
        >
          {emoji}
        </motion.div>
        <div>
          <p className="text-lg font-black mb-1.5" style={{ color: "#003048" }}>
            لا توجد منتجات حالياً
          </p>
          <p className="text-sm" style={{ color: "#90AEBA" }}>
            سيتم إضافة منتجات قريباً
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-bold flex items-center gap-1.5 px-5 py-2.5 rounded-full transition-all hover:opacity-85"
          style={{
            background: "linear-gradient(135deg, #0889A2, #024A65)",
            color: "#fff",
            boxShadow: "0 4px 16px rgba(8,137,162,0.3)",
          }}
        >
          <IoArrowForward size={13} />
          العودة للرئيسية
        </Link>
      </motion.div>
    );
  }

  /* ── Grid ── */
  return (
    <div dir="rtl">
      <div
        className={`grid gap-2.5 sm:gap-4 ${
          reserveMode
            ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
            : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
        }`}
      >
        <AnimatePresence mode="wait">
          {paginated.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, delay: i * 0.035 }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex justify-center items-center gap-2 mt-12"
        >
          {/* Prev */}
          <button
            onClick={() => goTo(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-30 hover:opacity-80"
            style={{
              background: "#EAF3F8",
              border: "1px solid #D4E8F2",
              color: "#003048",
            }}
          >
            <IoArrowForward size={13} />
            السابق
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => goTo(n)}
              className="w-10 h-10 rounded-xl text-xs font-black transition-all duration-200"
              style={
                page === n
                  ? {
                      background: "linear-gradient(135deg, #0889A2, #024A65)",
                      color: "#fff",
                      boxShadow: "0 4px 14px rgba(8,137,162,0.35)",
                      transform: "scale(1.1)",
                    }
                  : {
                      background: "#EAF3F8",
                      border: "1px solid #D4E8F2",
                      color: "#003048",
                    }
              }
            >
              {n}
            </button>
          ))}

          {/* Next */}
          <button
            onClick={() => goTo(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-30 hover:opacity-80"
            style={{
              background: "#EAF3F8",
              border: "1px solid #D4E8F2",
              color: "#003048",
            }}
          >
            التالي
            <IoArrowBack size={13} />
          </button>
        </motion.div>
      )}
    </div>
  );
}

