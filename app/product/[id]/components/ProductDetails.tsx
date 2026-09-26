"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { IoStar } from "react-icons/io5";
import type { Product } from "../../../components/products/types";

interface Props {
  description?: string;
  specs?: Product["specs"];
  gallery?: Product["gallery"];
  specifications?: Product["specifications"];
  specGroups?: Product["specGroups"];
  sections?: Product["sections"];
  rating?: Product["rating"];
  reviews?: Product["reviews"];
}

const SPEC_LABELS: Record<string, string> = {
  screen: "الشاشة", processor: "المعالج", ram: "الرام", storage: "التخزين",
  rearCamera: "الكاميرا الخلفية", frontCamera: "الكاميرا الأمامية",
  battery: "البطارية", batteryLife: "عمر البطارية",
  charging: "الشحن", os: "نظام التشغيل", extras: "مميزات إضافية",
};

/* ── Gallery card ── */
function GalleryCard({ image, caption }: { image: string; caption?: string }) {
  return (
    <div className="relative rounded-2xl overflow-hidden group" style={{ aspectRatio: "4/3" }}>
      <Image src={image} alt={caption ?? ""} fill unoptimized
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      {caption && (
        <div className="absolute inset-x-0 bottom-0 px-4 py-3"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
          <p className="text-sm font-semibold text-white leading-snug">{caption}</p>
        </div>
      )}
    </div>
  );
}

/* ── Design section ── */
function DesignSection({ section }: { section: NonNullable<Product["sections"]>[0] }) {
  type ColorEntry = { name: string; colorCode: string; image: string; title: string };
  type Feature    = { id: string; label: string; title: string; image: string; colors?: ColorEntry[] };
  const features: Feature[] = (section.content as { features?: Feature[] })?.features ?? [];

  const [activeF, setActiveF] = useState(0);
  const [activeC, setActiveC] = useState(0);

  if (!features.length) return null;

  const current      = features[activeF];
  const colorList    = current?.colors;
  const displayImage = colorList ? colorList[activeC]?.image : current?.image;
  const displayTitle = colorList ? colorList[activeC]?.title : current?.title;

  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#9ca3af" }}>التصميم</p>

      {/* Feature pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-nowrap sm:flex-wrap">
        {features.map((f, i) => (
          <button key={f.id} onClick={() => { setActiveF(i); setActiveC(0); }}
            className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap"
            style={activeF === i
              ? { background: "#111827", color: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.18)" }
              : { background: "#f3f4f6", color: "#6b7280" }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Hero image */}
      <AnimatePresence mode="wait">
        <motion.div key={`${activeF}-${activeC}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          {displayImage && (
            <div className="relative w-full rounded-2xl overflow-hidden group" style={{ aspectRatio: "16/10" }}>
              <Image src={displayImage} alt={current?.label ?? ""} fill unoptimized
                className="object-cover transition-transform duration-600 group-hover:scale-[1.03]"
                sizes="100vw"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }} />
              <span className="absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", color: "#fff" }}>
                {current?.label}
              </span>
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 flex flex-col gap-2.5">
                {displayTitle && (
                  <p className="text-sm sm:text-base font-bold text-white leading-snug max-w-xl drop-shadow">
                    {displayTitle}
                  </p>
                )}
                {colorList?.length && (
                  <div className="flex items-center gap-2">
                    {colorList.map((c, ci) => (
                      <button key={c.name} onClick={(e) => { e.preventDefault(); setActiveC(ci); }}
                        title={c.name} className="rounded-full transition-all duration-200"
                        style={activeC === ci
                          ? { width: 22, height: 22, backgroundColor: c.colorCode, outline: "2px solid #fff", outlineOffset: 2 }
                          : { width: 16, height: 16, backgroundColor: c.colorCode, opacity: 0.6 }
                        }
                      />
                    ))}
                    <AnimatePresence mode="wait">
                      <motion.span key={activeC}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-xs text-white/70"
                      >
                        {colorList[activeC]?.name}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Spec table ── */
function SpecTable({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
      {rows.map((r, i) => (
        <div key={i}
          className="flex items-center justify-between gap-4 px-5 py-4"
          style={{
            background: i % 2 === 0 ? "#fafafa" : "#fff",
            borderBottom: i < rows.length - 1 ? "1px solid #e5e7eb" : "none",
          }}
        >
          <span className="text-sm shrink-0 w-32" style={{ color: "#9ca3af" }}>{r.label}</span>
          <span className="text-sm font-semibold text-left leading-snug" style={{ color: "#111827" }}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══ MAIN ═══ */
export default function ProductDetails({ description, specs, gallery, specifications, specGroups, sections, rating, reviews }: Props) {
  const TABS = [
    { key: "overview", label: "نظرة عامة" },
    { key: "specs",    label: "المواصفات" },
    { key: "reviews",  label: "التقييمات" },
  ];
  const [active, setActive] = useState("overview");

  const hasSpecGroups  = !!specGroups?.length;
  const hasSpecs       = !!specifications?.length;
  const hasLegacy      = specs && Object.values(specs).some(Boolean);
  const designSection  = sections?.find((s) => s.isActive && s.type === "design");

  return (
    <div className="product-details-card mb-6" dir="rtl">

      {/* ── Tab bar ── */}
      <div
        className="flex gap-1 p-1 rounded-2xl mb-8"
        style={{ background: "#f3f4f6" }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className="relative flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={active === t.key
              ? { background: "#fff", color: "#111827", boxShadow: "0 1px 6px rgba(0,0,0,0.10)" }
              : { color: "#9ca3af" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >

          {/* Overview */}
          {active === "overview" && (
            <div className="space-y-5">
              {description && (
                <p className="text-sm sm:text-base leading-loose" style={{ color: "#374151" }}>{description}</p>
              )}
              {!!gallery?.length && (
                <div className={`grid gap-3 ${gallery.length === 1 ? "" : gallery.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
                  {gallery.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}>
                      <GalleryCard image={item.url} caption={item.caption} />
                    </motion.div>
                  ))}
                </div>
              )}
              {designSection && <DesignSection section={designSection} />}
              {!description && !gallery?.length && !designSection && (
                <p className="text-sm" style={{ color: "#9ca3af" }}>لا توجد نظرة عامة متاحة.</p>
              )}
            </div>
          )}

          {/* Specs */}
          {active === "specs" && (
            hasSpecGroups ? (
              <div className="space-y-6">
                {specGroups!.map((g, gi) => (
                  <div key={gi}>
                    <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#9ca3af" }}>{g.group}</p>
                    <SpecTable rows={g.items.map((it) => ({ label: it.key, value: it.value }))} />
                  </div>
                ))}
              </div>
            ) : hasSpecs ? (
              <div className="space-y-6">
                {specifications!.map((g, gi) => (
                  <div key={gi}>
                    <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#9ca3af" }}>{g.groupName}</p>
                    <SpecTable rows={g.items.map((it) => ({ label: it.label, value: it.value }))} />
                  </div>
                ))}
              </div>
            ) : hasLegacy ? (
              <SpecTable rows={Object.entries(specs!).filter(([, v]) => v).map(([k, v]) => ({ label: SPEC_LABELS[k] ?? k, value: String(v) }))} />
            ) : (
              <p className="text-sm" style={{ color: "#9ca3af" }}>لا توجد مواصفات متاحة.</p>
            )
          )}

          {/* Reviews */}
          {active === "reviews" && (
            reviews?.length ? (
              <div className="space-y-4">
                {rating && (
                  <div className="flex items-center gap-2 mb-5 p-4 rounded-2xl" style={{ background: "#fafafa", border: "1px solid #e5e7eb" }}>
                    <IoStar size={20} style={{ color: "#f59e0b" }} />
                    <span className="text-2xl font-black" style={{ color: "#111827" }}>{rating.average}</span>
                    <span className="text-sm" style={{ color: "#9ca3af" }}>من 5 · {rating.count} تقييم</span>
                  </div>
                )}
                {reviews.map((r, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid #e5e7eb" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                          style={{ background: "#111827" }}>
                          {r.name[0]}
                        </div>
                        <div>
                          <span className="text-sm font-bold block" style={{ color: "#111827" }}>{r.name}</span>
                          <div className="flex gap-0.5 mt-0.5">
                            {Array.from({ length: 5 }).map((_, si) => (
                              <IoStar key={si} size={11} style={{ color: si < r.rate ? "#f59e0b" : "#e5e7eb" }} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs" style={{ color: "#9ca3af" }}>{r.date}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "#4b5563" }}>{r.comment}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "#9ca3af" }}>لا توجد تقييمات بعد.</p>
            )
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
