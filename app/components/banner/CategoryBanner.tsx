"use client";
import { useState, useRef, useCallback, useEffect } from "react";

const AUTO_PLAY_MS = 4000;
const SWIPE_THRESHOLD = 50;

function CategoryBannerSlider({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const touchStart = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const goTo = useCallback((i: number) => setCurrent((i + images.length) % images.length), [images.length]);

  useEffect(() => {
    intervalRef.current = setInterval(() => setCurrent((c) => (c + 1) % images.length), AUTO_PLAY_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [images.length]);

  return (
    <div
      onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const diff = touchStart.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > SWIPE_THRESHOLD) goTo(current + (diff > 0 ? 1 : -1));
      }}
    >
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`banner ${i + 1}`}
          style={{ display: i === current ? "block" : "none", width: "100%", height: "auto" }}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}
      {images.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 8 }}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{ width: 10, height: 10, borderRadius: "50%", border: "none", cursor: "pointer", background: i === current ? "#555" : "#ccc" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryBanner({ images: propImages }: { category?: string; images?: string[] }) {
  const images = propImages ?? [];
  if (!images.length) return null;
  return <CategoryBannerSlider images={images} />;
}
