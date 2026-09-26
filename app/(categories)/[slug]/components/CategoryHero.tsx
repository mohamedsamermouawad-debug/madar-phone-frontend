"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface Props {
  label: string;
  parentLabel: string;
  parentHref: string;
  productCount: number;
  loading: boolean;
  heroImages?: string[];
}

export default function CategoryHero({
  label,
  parentLabel,
  parentHref,
  productCount,
  loading,
  heroImages = [],
}: Props) {
  const [current, setCurrent] = useState(0);
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const total = heroImages.length;

  const go = (idx: number) => setCurrent((idx + total) % total);

  useEffect(() => {
    if (total <= 1) return;
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % total), 4500);
    return () => clearInterval(timerRef.current);
  }, [total]);

  const pause = () => clearInterval(timerRef.current);
  const resume = () => {
    if (total <= 1) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % total), 4500);
  };

  return (
    <section className="w-full" dir="rtl">
      {/* ── Banner Slider ── */}
      {total > 0 && (
        <div
          className="mt-16 sm:mt-20 px-2 sm:px-3 pt-1"
        >
        <div
          className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl group"
          style={{ boxShadow: "0 8px 40px rgba(37,99,235,0.15), 0 0 0 1px rgba(37,99,235,0.08)" }}
          onMouseEnter={pause}
          onMouseLeave={resume}
        >
          <div className="relative w-full bg-white" style={{ aspectRatio: ratios[heroImages[current]] ?? 3 }}>
            {heroImages.map((src, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-700"
                style={{
                  opacity: i === current ? 1 : 0,
                  pointerEvents: i === current ? "auto" : "none",
                }}
              >
                <Image
                  src={src}
                  alt={`${label} ${i + 1}`}
                  fill
                  priority={i === 0}
                  className="object-contain"
                  sizes="(min-width: 640px) calc(100vw - 24px), calc(100vw - 16px)"
                  onLoad={(event) => {
                    const img = event.currentTarget;
                    if (img.naturalWidth && img.naturalHeight) {
                      setRatios((prev) => {
                        const r = img.naturalWidth / img.naturalHeight;
                        return prev[src] === r ? prev : { ...prev, [src]: r };
                      });
                    }
                  }}
                />
              </div>
            ))}
            {/* bottom fog */}
            <div
              className="absolute inset-x-0 bottom-0 h-20 pointer-events-none z-[1]"
              style={{ background: "linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 50%, transparent 100%)" }}
            />
          </div>

          {/* Arrows */}
          {total > 1 && (
            <>
              <button
                onClick={() => go(current - 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                  border: "1px solid rgba(0,48,72,0.1)",
                }}
                aria-label="السابق"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#003048" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
              <button
                onClick={() => go(current + 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                  border: "1px solid rgba(0,48,72,0.1)",
                }}
                aria-label="التالي"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#003048" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            </>
          )}

          {/* Dots */}
          {total > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`عرض الصورة ${i + 1}`}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? 20 : 7,
                    height: 7,
                    background: i === current ? "#0889A2" : "rgba(0,48,72,0.25)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="w-full px-4 sm:px-8 lg:px-12 pt-6 pb-4">
        <div className="max-w-7xl mx-auto">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs mb-5" style={{ color: "#90AEBA" }} aria-label="breadcrumb">
            <Link href="/" className="hover:text-[#0889A2] transition-colors font-medium">
              الرئيسية
            </Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <Link href={parentHref} className="hover:text-[#0889A2] transition-colors font-medium">
              {parentLabel}
            </Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="font-bold" style={{ color: "#003048" }}>{label}</span>
          </nav>

          {/* Title row */}
          <div className="flex items-center gap-4">
            {/* Accent bar */}
            <div
              className="w-1 shrink-0 rounded-full"
              style={{
                height: 44,
                background: "linear-gradient(to bottom, #0889A2, #024A65)",
              }}
            />

            <div className="flex-1">
              <p
                className="text-xs font-bold mb-0.5 uppercase tracking-widest"
                style={{ color: "#0889A2" }}
              >
                {parentLabel}
              </p>
              <h1
                className="text-2xl sm:text-3xl font-black leading-tight"
                style={{ color: "#003048" }}
              >
                {label}
              </h1>
            </div>

            {/* Product count badge */}
            {!loading && productCount > 0 && (
              <div
                className="shrink-0 flex flex-col items-center justify-center rounded-2xl px-4 py-2.5"
                style={{
                  background: "linear-gradient(135deg, #EAF6FA, #D4EEF5)",
                  border: "1px solid rgba(8,137,162,0.18)",
                }}
              >
                <span className="text-xl font-black leading-none" style={{ color: "#0889A2" }}>
                  {productCount}
                </span>
                <span className="text-[10px] font-bold mt-0.5" style={{ color: "#024A65" }}>
                  منتج
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div
            className="mt-5 h-px"
            style={{ background: "linear-gradient(to left, transparent, #D4E8F2 50%, transparent)" }}
          />
        </div>
      </div>
    </section>
  );
}
