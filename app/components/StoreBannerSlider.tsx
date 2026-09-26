"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Props {
  images: string[];
}

export default function StoreBannerSlider({ images }: Props) {
  const [current, setCurrent] = useState(0);
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const total = images.length;

  const go = (idx: number) => setCurrent((idx + total) % total);

  // Auto-advance
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

  if (!total) return null;

  return (
    <section className="w-full mt-16 sm:mt-20 px-2 sm:px-3 pt-1" aria-label="عروض المتجر">
    <div
      className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl group"
      style={{ boxShadow: "0 8px 40px rgba(37,99,235,0.15), 0 0 0 1px rgba(37,99,235,0.08)" }}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {/* الصور */}
      <div className="relative w-full bg-white" style={{ aspectRatio: ratios[images[current]] ?? 3 }}>
        {images.map((src, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? "auto" : "none" }}
          >
            <Image
              src={src}
              alt={`banner-${i + 1}`}
              fill
              priority={i === 0}
              className="object-contain"
              sizes="(min-width: 640px) calc(100vw - 24px), calc(100vw - 16px)"
              onLoad={(event) => {
                const image = event.currentTarget;
                if (image.naturalWidth && image.naturalHeight) {
                  const ratio = image.naturalWidth / image.naturalHeight;
                  setRatios((previous) => previous[src] === ratio ? previous : { ...previous, [src]: ratio });
                }
              }}
              unoptimized
            />
          </div>
        ))}

      </div>

      {/* أسهم التنقل */}
      {total > 1 && (
        <>
          <button
            onClick={() => go(current - 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: "rgba(255,255,255,0.85)", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", border: "1px solid rgba(0,48,72,0.1)" }}
            aria-label="السابق"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#003048" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <button
            onClick={() => go(current + 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: "rgba(255,255,255,0.85)", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", border: "1px solid rgba(0,48,72,0.1)" }}
            aria-label="التالي"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#003048" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </>
      )}

      {/* نقاط */}
      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`عرض البانر ${i + 1}`}
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
    </section>
  );
}
