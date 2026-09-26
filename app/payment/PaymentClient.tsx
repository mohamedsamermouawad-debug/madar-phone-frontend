"use client";
import { useState, useEffect, useRef, ReactNode } from "react";
import Image from "next/image";
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
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function setVis(v: boolean) { setVisible(v); }
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

/* ─── info-section icons ─── */
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);
const IconCoin = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v12M9 9h4.5a1.5 1.5 0 010 3H9h5a1.5 1.5 0 010 3H9"/>
  </svg>
);
const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <path d="M16 8h4l3 5v4h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="8.01" strokeWidth="2.5"/>
    <line x1="12" y1="12" x2="12" y2="16"/>
  </svg>
);

/* ─── footer payment logos (same files as Footer.tsx) ─── */
const paymentLogos = [
  { src: "/visa.webp",          alt: "Visa",       w: 48,  h: 30 },
  { src: "/mastercard.webp",    alt: "Mastercard", w: 48,  h: 30 },
  { src: "/mada.svg",           alt: "مدى",        w: 52,  h: 30 },
  { src: "/stc.svg",            alt: "STC Pay",    w: 52,  h: 30 },
  { src: "/Apple-Pay-01.png",   alt: "Apple Pay",  w: 130, h: 68 },
];

/* ─── payment method cards ─── */
const IconInstall = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h2M10 15h4"/>
  </svg>
);

const methods: {
  title: string;
  desc: string;
  logo?: { src: string; alt: string; w: number; h: number } | null;
  logos?: { src: string; alt: string; w: number; h: number }[];
  Icon?: () => React.JSX.Element;
}[] = [
  { title: "بطاقة مدى",     desc: "ادفع فوري بأي بطاقة مدى سعودية.",    logo: { src: "/mada.svg",        alt: "مدى",       w: 72, h: 44 } },
  { title: "فيزا / ماستر", desc: "نقبل جميع البطاقات الائتمانية.",        logos: [
      { src: "/visa.webp",   alt: "Visa",       w: 52, h: 32 },
      { src: "/master.svg",  alt: "Mastercard", w: 52, h: 40 },
    ]},
  { title: "Apple Pay",    desc: "لمسة وخلاص — الأسرع والأسهل.",         logo: { src: "/Apple-Pay-01.png", alt: "Apple Pay", w: 120, h: 64 } },
  { title: "STC Pay",      desc: "ادفع مباشرة من تطبيق STC Pay.",         logo: { src: "/stc.svg",          alt: "STC Pay",   w: 72, h: 44 } },
  { title: "التقسيط",      desc: "دفعات شهرية مريحة بدون فوايد.",          logo: null, Icon: IconInstall },
];

const infoSections = [
  { num: "01", Icon: IconShield,  title: "طرق الدفع المعتمدة",  body: "كل طرق الدفع عندنا آمنة ومشفّرة — تدفع براحة بالك." },
  { num: "02", Icon: IconCoin,    title: "العملة المستخدمة",     body: "جميع الأسعار بالريال السعودي (SAR) — ما فيه رسوم خفية." },
  { num: "03", Icon: IconTruck,   title: "التسليم والشحن",       body: "بعد تأكيد طلبك نتواصل معك لتنسيق الشحن على موقعك." },
  { num: "04", Icon: IconInfo,    title: "تنبيه مهم",            body: "ممكن يتواصل معك فريقنا بعد الطلب لتأكيد بياناتك — هذا جزء من خدمتنا وما فيه داعي للقلق." },
];

interface Company { phone?: string; whatsapp?: string; email?: string; [k: string]: string | undefined; }

export default function PaymentClient({ company }: { company: Company }) {
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 60); return () => clearTimeout(t); }, []);

  const anim = (d: number) => ({
    style: {
      opacity: heroVisible ? 1 : 0,
      transform: heroVisible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${d}ms, transform 0.7s cubic-bezier(.16,1,.3,1) ${d}ms`,
    },
  });

  return (
    <main className="min-h-screen overflow-x-hidden bg-white" dir="rtl">

      {/* ══ HERO ══ */}
      <section className="relative w-full overflow-hidden bg-white" style={{ borderBottom: "1px solid #edf2f7" }}>
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, ${BRAND}, #a8d8e0, ${BRAND})` }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 70% 55% at 50% -10%, rgba(8,137,162,0.06) 0%, transparent 70%)` }} />

        <div className="relative max-w-4xl mx-auto px-5 sm:px-10 pt-20 sm:pt-28 pb-16 sm:pb-20 text-center">
          <div {...anim(80)} className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-6 tracking-widest uppercase"
            style={{ background: "rgba(8,137,162,0.07)", border: "1px solid rgba(8,137,162,0.18)", color: BRAND }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: BRAND }} />
            مدار للإلكترونيات
          </div>

          <h1 {...anim(200)} className="text-3xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight tracking-tight" style={{ color: BRAND2 }}>
            ادفع بالطريقة
            <span className="block" style={{ color: BRAND }}>اللي تناسبك</span>
          </h1>

          <p {...anim(340)} className="text-sm sm:text-lg max-w-xl mx-auto leading-loose" style={{ color: "#4a6072" }}>
            مدى، بطاقات، Apple Pay، STC Pay، وتقسيط بدون فوايد — كلها متاحة عندنا
          </p>

          {/* payment logo strip */}
          <div {...anim(460)} className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8">
            {paymentLogos.map((l) => (
              <Image key={l.alt} src={l.src} alt={l.alt} width={l.w} height={l.h}
                className="object-contain"
                style={{
                  width: "auto",
                  height: l.alt === "Apple Pay" ? `${l.h * 0.72}px` : `${l.h * 0.55}px`,
                  opacity: 0.85,
                }} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ METHOD CARDS ══ */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-12">
        <Reveal delay={0}>
          <p className="text-center text-xs font-bold tracking-widest uppercase mb-6" style={{ color: BRAND }}>
            وسائل الدفع المتاحة
          </p>
        </Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {methods.map((m, i) => (
            <Reveal key={m.title} delay={i * 70 + 60}>
              <div className="group relative rounded-2xl p-4 sm:p-5 text-center overflow-hidden hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center h-full"
                style={{ background: "#f7fbfc", border: "1px solid #d8eef2" }}>
                <div className="flex items-center justify-center gap-1.5 mx-auto mb-3 group-hover:scale-105 transition-transform duration-300"
                  style={(!m.logo && !m.logos) ? { background: "rgba(8,137,162,0.08)", color: BRAND, borderRadius: "12px", width: "48px", height: "48px" } : { minHeight: "52px" }}>
                  {m.logos
                    ? m.logos.map((lg) => (
                        <Image key={lg.alt} src={lg.src} alt={lg.alt} width={lg.w} height={lg.h}
                          className="object-contain w-auto h-auto"
                          style={{ maxWidth: `${lg.w * 0.8}px`, maxHeight: `${lg.h * 0.8}px` }} />
                      ))
                    : m.logo
                      ? <Image src={m.logo.src} alt={m.logo.alt} width={m.logo.w} height={m.logo.h}
                          className="object-contain w-auto h-auto"
                          style={{ maxWidth: `${m.logo.w * 0.85}px`, maxHeight: `${m.logo.h * 0.85}px` }} />
                      : m.Icon && <m.Icon />
                  }
                </div>
                <p className="text-xs sm:text-sm font-extrabold mb-1" style={{ color: BRAND2 }}>{m.title}</p>
                <p className="text-[10px] sm:text-xs leading-relaxed" style={{ color: "#7a9bac" }}>{m.desc}</p>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: BRAND }} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ INFO SECTIONS ══ */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-8 pb-10 space-y-4">
        {infoSections.map((s, i) => (
          <Reveal key={s.title} delay={i * 100}>
            <div className="group rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300"
              style={{ background: "#ffffff", border: "1px solid #e8f0f4" }}>
              <div className="flex flex-col sm:flex-row">
                <div className="hidden sm:flex flex-col items-center pt-7 px-5 shrink-0 gap-2">
                  <span className="text-2xl font-black" style={{ color: "rgba(8,137,162,0.15)" }}>{s.num}</span>
                  <div className="w-px flex-1 mb-5" style={{ background: "linear-gradient(to bottom, rgba(8,137,162,0.18), transparent)" }} />
                </div>
                <div className="sm:hidden h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${BRAND}, transparent)` }} />
                <div className="flex-1 p-5 sm:p-7">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300"
                      style={{ background: "rgba(8,137,162,0.07)", color: BRAND, border: "1px solid rgba(8,137,162,0.15)" }}>
                      <s.Icon />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-extrabold" style={{ color: BRAND2 }}>{s.title}</h2>
                      <div className="h-px w-10 mt-1.5 rounded-full" style={{ background: `linear-gradient(90deg, ${BRAND}, transparent)` }} />
                    </div>
                  </div>
                  <p className="text-sm sm:text-base leading-loose" style={{ color: "#4a6072" }}>{s.body}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ══ CONTACT ══ */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 pb-16">
        <ContactSection
          title="تواصل معنا بخصوص الدفع"
          phone={company.phone}
          whatsapp={company.whatsapp}
          email={company.email}
          fadeDelay={200}
        />
      </div>
    </main>
  );
}
