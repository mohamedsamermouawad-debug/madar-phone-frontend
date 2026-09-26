"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Props { images: string[]; name: string; discountPercent?: number; }

export default function ProductImages({ images: raw, name, discountPercent = 0 }: Props) {
  const images = raw.filter((src) => { try { return !!new URL(src); } catch { return false; } });
  const [sel, setSel] = useState(0);
  const touchX = useRef(0);
  const go = (i: number) => setSel((i + images.length) % images.length);

  if (!images.length) return null;

  return (
    <div className="product-gallery flex flex-col gap-2.5">

      {/* Main image */}
      <div
        className="relative rounded-[24px] overflow-hidden group"
        style={{ background: "#ffffff", border: "1px solid #e2e8e2" }}
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const d = touchX.current - e.changedTouches[0].clientX;
          if (Math.abs(d) > 44 && images.length > 1) go(sel + (d > 0 ? 1 : -1));
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={sel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="product-image-stage relative w-full"
          >
            <Image src={images[sel]} alt={name} fill priority
              className="object-contain p-6 sm:p-8"
              sizes="(max-width: 767px) 90vw, 440px"
            />
          </motion.div>
        </AnimatePresence>

        {/* Discount badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 right-2.5 z-10 text-[11px] font-black px-2 py-0.5 rounded-full text-white bg-red-500">
            -{discountPercent}%
          </span>
        )}

        {/* Counter */}
        {images.length > 1 && (
          <span className="absolute top-2.5 left-2.5 z-10 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(0,48,72,0.07)", color: "#003048" }}>
            {sel + 1}/{images.length}
          </span>
        )}

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            {[{ dir: -1, side: "right-2" }, { dir: 1, side: "left-2" }].map(({ dir, side }) => (
              <button key={dir} aria-label={dir === -1 ? "الصورة السابقة" : "الصورة التالية"} onClick={() => go(sel + dir)}
                className={`absolute ${side} top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center opacity-100 transition-opacity`}
                style={{ background: "rgba(255,255,255,0.88)", border: "1px solid #D4E8F2", color: "#003048" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={dir === -1 ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} />
                </svg>
              </button>
            ))}
          </>
        )}

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} aria-label={`عرض الصورة ${i + 1}`} aria-pressed={i === sel} onClick={() => setSel(i)}
                className="rounded-full transition-all duration-250"
                style={{ width: i === sel ? 18 : 6, height: 6, background: i === sel ? "#0889A2" : "rgba(0,48,72,0.18)" }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="product-thumbnails flex gap-2 overflow-x-auto py-2 scrollbar-hide">
          {images.map((img, i) => (
            <motion.button key={i} aria-label={`صورة المنتج ${i + 1}`} aria-pressed={i === sel} whileTap={{ scale: 0.93 }} onClick={() => setSel(i)}
              className="relative shrink-0 w-12 h-12 rounded-xl overflow-hidden transition-all duration-200"
              style={i === sel
                ? { border: "2px solid #0889A2", background: "#F0F7FA" }
                : { border: "1.5px solid #D4E8F2", background: "#F0F7FA", opacity: 0.55 }
              }
            >
              <Image src={img} alt="" fill className="object-contain p-1.5" sizes="56px" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}


