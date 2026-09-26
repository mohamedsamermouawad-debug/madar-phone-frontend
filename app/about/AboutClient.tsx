"use client";
import { useEffect, useRef, useState } from "react";
import ContactSection from "../components/ContactSection";

/* ─── animation hook ─── */
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

/* ─── icons ─── */
const IconStore = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
    <path d="M9 22V12h6v10"/>
  </svg>
);
const IconTarget = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);
const IconHeadset = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0118 0v6"/>
    <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z"/>
  </svg>
);
const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <path d="M16 8h4l3 5v4h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconPercent = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="5" x2="5" y2="19"/>
    <circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
  </svg>
);

/* ─── brand ─── */
const BRAND  = "#0889A2";
const BRAND2 = "#003048";

const stats = [
  { value: "١٠٠٪", label: "ضمان الجودة",  Icon: IconShield  },
  { value: "٢٤/٧",  label: "دعم على طول", Icon: IconHeadset },
  { value: "٠٪",    label: "بدون فوايد",  Icon: IconPercent },
  { value: "سريع",  label: "توصيل لبيتك", Icon: IconTruck   },
];

const sections = [
  {
    Icon: IconStore, num: "01",
    title: "مين إحنا؟",
    body: [
      "مدار للإلكترونيات متجرك الأول للأجهزة بالتقسيط في المملكة. عندنا تلاقي اللي تبيه من جوالات ولابتوبات وساعات وإكسسوارات — بأسعار منافسة وأقساط مريحة ما تحسّ فيها.",
      "من أول ما تتصفح لحين ما يوصلك طلبك على بابك، إحنا معك خطوة بخطوة. خدمة عملاء سعودية، شحن سريع، وضمان موثوق.",
    ],
  },
  {
    Icon: IconTarget, num: "02",
    title: "وش هي رؤيتنا؟",
    body: [
      "نبي نكون الخيار الأول لكل سعودي يدور جهاز بسعر عادل وتجربة شراء سهلة — بدون تعقيد، بدون فوايد، وبدون قلق.",
    ],
  },
  {
    Icon: IconStar, num: "03",
    title: "رسالتنا",
    body: [
      "نبني ثقة حقيقية مع عملائنا من خلال منتجات أصلية، وشفافية كاملة، ودعم ما ينقطع. لأن عميلنا المرتاح هو نجاحنا.",
    ],
  },
];

export default function AboutClient() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [company, setCompany] = useState<{ whatsapp?: string; email?: string; phone?: string } | null>(null);

  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 60); return () => clearTimeout(t); }, []);
  useEffect(() => {
    fetch("/api/admin/company").then(r => r.json()).then(setCompany).catch(() => {});
  }, []);

  const anim = (d: number) => ({
    style: {
      opacity: heroVisible ? 1 : 0,
      transform: heroVisible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${d}ms, transform 0.7s cubic-bezier(.16,1,.3,1) ${d}ms`,
    },
  } as React.HTMLAttributes<HTMLElement>);

  return (
    <main dir="rtl" className="min-h-screen overflow-x-hidden bg-white">

      {/* ══ HERO ══ */}
      <section className="relative w-full overflow-hidden bg-white" style={{ borderBottom: "1px solid #edf2f7" }}>
        {/* soft top accent line */}
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, ${BRAND}, #a8d8e0, ${BRAND})` }} />

        {/* faint radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 70% 55% at 50% -10%, rgba(8,137,162,0.06) 0%, transparent 70%)` }} />

        <div className="relative max-w-4xl mx-auto px-5 sm:px-10 pt-20 sm:pt-28 pb-16 sm:pb-20 text-center">

          {/* eyebrow badge */}
          <div {...anim(80)} className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-6 tracking-widest uppercase"
            style={{ background: "rgba(8,137,162,0.07)", border: "1px solid rgba(8,137,162,0.18)", color: BRAND }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: BRAND }} />
            تعرّف علينا
          </div>

          <h1 {...anim(200)} className="text-3xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight tracking-tight" style={{ color: BRAND2 }}>
            عن مدار
            <span className="block" style={{ color: BRAND }}>للإلكترونيات</span>
          </h1>

          <p {...anim(340)} className="text-sm sm:text-lg max-w-xl mx-auto leading-loose" style={{ color: "#4a6072" }}>
            متجرك السعودي الأول للأجهزة بالتقسيط — بدون فوايد وبدون تعقيد
          </p>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="group relative rounded-2xl p-4 sm:p-6 text-center overflow-hidden hover:-translate-y-1 transition-transform duration-300"
                style={{ background: "#f7fbfc", border: "1px solid #d8eef2" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: "rgba(8,137,162,0.08)", color: BRAND }}>
                  <s.Icon />
                </div>
                <p className="text-2xl sm:text-3xl font-black mb-0.5" style={{ color: BRAND2 }}>{s.value}</p>
                <p className="text-[11px] sm:text-xs font-semibold" style={{ color: "#7a9bac" }}>{s.label}</p>
                {/* bottom accent */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: BRAND }} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ SECTIONS ══ */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-8 pb-10 space-y-4">
        {sections.map((s, i) => (
          <Reveal key={s.title} delay={i * 110}>
            <div className="group rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300"
              style={{ background: "#ffffff", border: "1px solid #e8f0f4" }}>
              <div className="flex flex-col sm:flex-row">
                {/* left number strip */}
                <div className="hidden sm:flex flex-col items-center pt-7 px-5 shrink-0 gap-2">
                  <span className="text-2xl font-black" style={{ color: "rgba(8,137,162,0.15)" }}>{s.num}</span>
                  <div className="w-px flex-1 mb-5" style={{ background: "linear-gradient(to bottom, rgba(8,137,162,0.18), transparent)" }} />
                </div>
                {/* top accent mobile */}
                <div className="sm:hidden h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${BRAND}, transparent)` }} />

                <div className="flex-1 p-5 sm:p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300"
                      style={{ background: "rgba(8,137,162,0.07)", color: BRAND, border: "1px solid rgba(8,137,162,0.15)" }}>
                      <s.Icon />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-xl font-extrabold" style={{ color: BRAND2 }}>{s.title}</h2>
                      <div className="h-px w-10 mt-1.5 rounded-full" style={{ background: `linear-gradient(90deg, ${BRAND}, transparent)` }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {s.body.map((p, j) => (
                      <p key={j} className="text-sm sm:text-base leading-loose" style={{ color: "#4a6072" }}>{p}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ══ CONTACT ══ */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 pb-16">
        <ContactSection
          title="تواصل معنا"
          phone={company?.phone}
          whatsapp={company?.whatsapp}
          email={company?.email}
          fadeDelay={200}
        />
      </div>
    </main>
  );
}
