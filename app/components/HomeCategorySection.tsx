"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { IoChevronForward, IoChevronBack } from "react-icons/io5";
import ProductCard from "./products/ProductCard";
import type { Product } from "./products/types";

const AUTO_PLAY_MS = 5000;

function CategoryBannerSlider({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const touchStart = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const goTo = useCallback(
    (i: number) => setCurrent((i + images.length) % images.length),
    [images.length]
  );

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % images.length), AUTO_PLAY_MS);
  }, [images.length]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const handleGoTo = (i: number) => { goTo(i); resetTimer(); };

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl group"
      style={{ boxShadow: "0 8px 40px rgba(37,99,235,0.15), 0 0 0 1px rgba(37,99,235,0.08)" }}
      onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const diff = touchStart.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) handleGoTo(current + (diff > 0 ? 1 : -1));
      }}
    >
      {/* Slides */}
      <div className="relative bg-white" style={{ aspectRatio: ratios[images[current]] ?? 3 }}>
        {images.map((src, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          >
            <Image
              src={src}
              alt={`banner ${i + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 1200px"
              onLoad={(event) => {
                const image = event.currentTarget;
                if (image.naturalWidth && image.naturalHeight) {
                  const ratio = image.naturalWidth / image.naturalHeight;
                  setRatios((previous) => previous[src] === ratio ? previous : { ...previous, [src]: ratio });
                }
              }}
              priority={i === 0}
              unoptimized
            />
          </div>
        ))}


      </div>

      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => handleGoTo(current + 1)}
            aria-label="التالي"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-sm border border-white shadow-lg text-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-110"
          >
            <IoChevronForward size={16} />
          </button>
          <button
            onClick={() => handleGoTo(current - 1)}
            aria-label="السابق"
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-sm border border-white shadow-lg text-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-110"
          >
            <IoChevronBack size={16} />
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => handleGoTo(i)}
              aria-label={`slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-400 ${
                i === current ? "w-7 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  categoryName: string;
  categoryHref: string;
  bannerImages: string[];
  products: Product[];
}

export default function HomeCategorySection({ categoryName, categoryHref, bannerImages, products }: Props) {
  const hasBanner = bannerImages.length > 0;
  const hasProducts = products.length > 0;

  if (!hasBanner && !hasProducts) return null;

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Banner */}
      {hasBanner && <CategoryBannerSlider images={bannerImages} />}

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Blue accent bar */}
          <div className="w-1 h-6 sm:h-7 rounded-full shrink-0" style={{ background: "linear-gradient(to bottom, #0889A2, #024A65)" }} />
          <h2 className="text-base sm:text-xl font-black leading-tight" style={{ color: "#003048" }}>{categoryName}</h2>
          {hasProducts && (
            <span className="hidden sm:inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ color: "#0889A2", background: "rgba(8,137,162,0.08)", border: "1px solid rgba(8,137,162,0.18)" }}>
              {products.length} منتج
            </span>
          )}
        </div>

        <Link
          href={categoryHref}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all duration-200 shadow-sm shrink-0 hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #0889A2, #024A65)", color: "#fff" }}
        >
          عرض الكل
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
      </div>

      {/* Products */}
      {hasProducts && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}


