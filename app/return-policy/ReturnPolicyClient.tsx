"use client";
import { useEffect, useRef, useState } from "react";
import ContactSection from "../components/ContactSection";

/* ─── brand ─── */
const BRAND  = "#0889A2";
const BRAND2 = "#003048";

/* ─── Reveal ─── */
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

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(26px)",
      transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

/* ─── icons ─── */
const IconBox = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconBan = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const cards = [
  {
    num: "01", Icon: IconBox,
    title: "حالة المنتج",
    accent: BRAND,
    body: "المنتج لازم يكون بحالته الأصلية ما استخدم، ومعه تغليفه والملحقات والفاتورة — هذا شرط أساسي لقبول طلب الاسترجاع.",
  },
  {
    num: "02", Icon: IconClock,
    title: "مدة الاسترجاع",
    accent: "#16a34a",
    body: "تقدر تطلب الاستبدال أو الاسترجاع خلال ١٤ يوم من يوم استلامك الطلب — بعد مراجعة حالة المنتج.",
  },
  {
    num: "03", Icon: IconBan,
    title: "منتجات ما تنرجع",
    accent: "#dc2626",
    body: "بعض المنتجات ما تنقبل للاسترجاع بعد الفتح أو الاستخدام — خاصةً الشخصية والرقمية واللي طلبتها بمواصفات خاصة.",
  },
  {
    num: "04", Icon: IconX,
    title: "إلغاء الطلب",
    accent: "#d97706",
    body: "تقدر تلغي طلبك قبل التجهيز والشحن. لو الطلب اتشحن، نتعامل معه حسب سياسة الاسترجاع المعتمدة عندنا.",
  },
];

type Company = { whatsapp?: string; email?: string; phone?: string };

export default function ReturnPolicyClient() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);

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
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, ${BRAND}, #a8d8e0, ${BRAND})` }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 70% 55% at 50% -10%, rgba(8,137,162,0.06) 0%, transparent 70%)` }} />

        <div className="relative max-w-4xl mx-auto px-5 sm:px-10 pt-20 sm:pt-28 pb-16 sm:pb-20 text-center">
          <div {...anim(80)} className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-6 tracking-widest uppercase"
            style={{ background: "rgba(8,137,162,0.07)", border: "1px solid rgba(8,137,162,0.18)", color: BRAND }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: BRAND }} />
            الشروط والسياسات
          </div>

          <h1 {...anim(200)} className="text-3xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight tracking-tight" style={{ color: BRAND2 }}>
            الاستبدال
            <span className="block" style={{ color: BRAND }}>والاسترجاع</span>
          </h1>

          <p {...anim(340)} className="text-sm sm:text-lg max-w-xl mx-auto leading-loose" style={{ color: "#4a6072" }}>
            شروطنا في الإلغاء والاستبدال والاسترجاع — واضحة ومباشرة ومحترمة
          </p>

          {/* quick-fact chips */}
          <div {...anim(440)} className="flex flex-wrap justify-center gap-2 mt-7">
            {[
              { label: "١٤ يوم استرجاع", color: BRAND },
              { label: "منتج أصلي فقط",   color: "#16a34a" },
              { label: "بدون تعقيد",      color: "#d97706" },
            ].map((f) => (
              <span key={f.label} className="inline-flex items-center text-xs font-semibold rounded-full px-4 py-1.5"
                style={{ background: `${f.color}0f`, border: `1px solid ${f.color}28`, color: f.color }}>
                {f.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ POLICY CARDS ══ */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-4">
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={i * 110}>
            <div className="group rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300"
              style={{ background: "#ffffff", border: "1px solid #e8f0f4" }}>
              <div className="flex flex-col sm:flex-row">
                {/* number strip */}
                <div className="hidden sm:flex flex-col items-center pt-7 px-5 shrink-0 gap-2">
                  <span className="text-2xl font-black" style={{ color: `${c.accent}28` }}>{c.num}</span>
                  <div className="w-px flex-1 mb-5" style={{ background: `linear-gradient(to bottom, ${c.accent}30, transparent)` }} />
                </div>
                {/* mobile top accent */}
                <div className="sm:hidden h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${c.accent}, transparent)` }} />

                <div className="flex-1 p-5 sm:p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300"
                      style={{ background: `${c.accent}10`, color: c.accent, border: `1px solid ${c.accent}22` }}>
                      <c.Icon />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-xl font-extrabold" style={{ color: BRAND2 }}>{c.title}</h2>
                      <div className="h-px w-10 mt-1.5 rounded-full" style={{ background: `linear-gradient(90deg, ${c.accent}, transparent)` }} />
                    </div>
                  </div>
                  <p className="text-sm sm:text-base leading-loose" style={{ color: "#4a6072" }}>{c.body}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ══ CONTACT ══ */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 pb-16">
        <ContactSection
          title="تواصل معنا بخصوص طلبك"
          phone={company?.phone}
          whatsapp={company?.whatsapp}
          email={company?.email}
          fadeDelay={200}
        />
      </div>
    </main>
  );
}
