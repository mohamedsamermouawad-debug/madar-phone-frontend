"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { IoArrowBack, IoArrowForward, IoFlame } from "react-icons/io5";

function SAR({ className }: { className?: string }) {
  return (
    <Image
      src="/money-icon.webp"
      alt="ر.س"
      width={32}
      height={32}
      className={`inline-block align-middle ${className ?? ""}`}
    />
  );
}
import type { Product } from "../../../components/products/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const fmt = (n: number) => n.toLocaleString("en-US");
const resolveImg = (src: string) =>
  src.startsWith("http") ? src : `${API}${src.startsWith("/") ? src : "/" + src}`;

export default function SimilarProducts({ product }: { product: Product }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!product.category && !product.subCategory) return;
    fetch(`${API}/api/products`)
      .then((r) => r.json())
      .then((data: Product[]) => {
        const all = (Array.isArray(data) ? data : []).filter((p) => p._id !== product._id);
        const similar = all.filter((p) => {
          const sameCat =
            (p.subCategory && p.subCategory === product.subCategory) ||
            (p.category && p.category === product.category);
          const diff = p.brand !== product.brand || p.name !== product.name;
          return sameCat && diff;
        });
        setProducts(similar.slice(0, 8));
      })
      .catch(() => {});
  }, [product]);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [products]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <section className="mt-12 sm:mt-16 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[#053132]">قد يعجبك أيضاً</h2>
          <p className="text-xs text-gray-400 mt-1">منتجات مشابهة مختارة لك</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              canScrollRight ? "bg-[#053132]/5 text-[#053132] hover:bg-[#053132]/10" : "bg-gray-50 text-gray-300 cursor-not-allowed"
            }`}
          >
            <IoArrowForward size={15} />
          </button>
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              canScrollLeft ? "bg-[#053132]/5 text-[#053132] hover:bg-[#053132]/10" : "bg-gray-50 text-gray-300 cursor-not-allowed"
            }`}
          >
            <IoArrowBack size={15} />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-2 px-2"
      >
        {products.map((p, idx) => {
          const image = p.images?.[0] || p.image;
          const resolvedImage = image ? resolveImg(image) : undefined;
          const originalPrice = p.originalPrice || p.price || 0;
          const salePrice = p.salePrice && p.salePrice > 0 ? p.salePrice : undefined;
          const hasDiscount = salePrice != null && salePrice < originalPrice;
          const displayPrice = hasDiscount ? salePrice : originalPrice;
          const discountPct = hasDiscount ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;

          return (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="snap-start min-w-[160px] w-[160px] sm:min-w-[190px] sm:w-[190px] md:min-w-[220px] md:w-[220px] flex-shrink-0"
            >
              <Link href={`/product/${p._id}`} className="group block">
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#053132]/10 hover:shadow-xl hover:shadow-[#053132]/[0.04] transition-all duration-300">
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-50/50 overflow-hidden">
                    {discountPct > 0 && (
                      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-[#0D202E] text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                        <IoFlame size={10} />
                        %{discountPct}-
                      </div>
                    )}
                    {resolvedImage ? (
                      <Image
                        src={resolvedImage}
                        alt={p.name}
                        fill
                        className="object-contain p-5 transition-transform duration-500 group-hover:scale-110"
                        sizes="220px"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-gray-200">📱</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3.5 sm:p-4">
                    {p.brand && (
                      <span className="text-[9px] font-bold text-[#053132]/60 uppercase tracking-wider">{p.brand}</span>
                    )}
                    <h3 className="text-[12px] sm:text-[13px] font-bold text-[#053132] line-clamp-2 leading-relaxed mt-1 mb-3 group-hover:text-[#092C32]">
                      {p.name}
                    </h3>
                    <div className="flex items-end justify-between">
                      <div>
                        {hasDiscount && (
                          <span className="text-[10px] text-gray-400 line-through block flex items-center gap-0.5">{fmt(originalPrice)} <SAR className="opacity-60" /></span>
                        )}
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-base sm:text-lg font-black text-[#053132]">{fmt(displayPrice)}</span>
                          <SAR className="opacity-60 mb-0.5" />
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-[#053132]/5 flex items-center justify-center group-hover:bg-[#053132] transition-colors">
                        <IoArrowBack size={12} className="text-[#053132] group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
