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
const IconDoc = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="8.01" strokeWidth="2.5"/>
    <line x1="12" y1="12" x2="12" y2="16"/>
  </svg>
);
const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);
const IconBuilding = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 3v18M3 9h6M3 15h6M15 9h6M15 15h6"/>
  </svg>
);

const sections = [
  {
    num: "01", Icon: IconDoc,
    accent: BRAND,
    title: "استخدام الموقع",
    body: "لما تتصفح موقعنا أو تطلب منه، معناها إنك وافقت على شروط وسياسات مؤسسة مدار للإلكترونيات — وهذا عهد بيننا وبينك.",
  },
  {
    num: "02", Icon: IconShield,
    accent: "#16a34a",
    title: "خصوصيتك أمانة عندنا",
    body: "بياناتك الشخصية ما تُستخدم إلا لتنفيذ طلبك وتحسين خدمتنا. ما نشاركها مع أي جهة خارجية وما نبيعها — نقطة.",
  },
  {
    num: "03", Icon: IconInfo,
    accent: "#7c3aed",
    title: "دقة المعلومات والأسعار",
    body: "نحرص أن كل المنتجات والأسعار تكون دقيقة ومحدّثة. لكن ممكن يصير تغيير من غير إشعار مسبق — وهذا طبيعي في أي متجر.",
  },
  {
    num: "04", Icon: IconChat,
    accent: "#d97706",
    title: "الطلبات والتواصل",
    body: "بعد ما تسجّل طلبك، ممكن يتواصل معك فريقنا لتأكيد بياناتك أو تنسيق الشحن والدفع — دايماً في خدمتك.",
  },
];

type Company = {
  nameAr?: string; addressAr?: string; phone?: string;
  whatsapp?: string; email?: string; taxNumber?: string;
};

export default function PrivacyClient({ company }: { company?: Company | null }) {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 60); return () => clearTimeout(t); }, []);

  const anim = (d: number) => ({
    style: {
      opacity: heroVisible ? 1 : 0,
      transform: heroVisible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${d}ms, transform 0.7s cubic-bezier(.16,1,.3,1) ${d}ms`,
    },
  } as React.HTMLAttributes<HTMLElement>);

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
            الشروط والسياسات
          </div>

          <h1 {...anim(200)} className="text-3xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight tracking-tight" style={{ color: BRAND2 }}>
            سياسة الخصوصية
            <span className="block" style={{ color: BRAND }}>واتفاقية الاستخدام</span>
          </h1>

          <p {...anim(320)} className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "#4a6072" }}>
            حقوقك وخصوصيتك أولويتنا. هذي شروط استخدام الموقع وسياسة التعامل مع بياناتك بكل وضوح وشفافية.
          </p>
        </div>
      </section>

      {/* ══ CARDS ══ */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-14 space-y-4">
        {sections.map((s, i) => (
          <Reveal key={s.num} delay={i * 90}>
            <div className="group rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:shadow-md"
              style={{ background: "#ffffff", border: "1px solid #e8f0f4" }}>
              <div className="flex items-start gap-4 sm:gap-5">
                {/* Icon box */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300"
                  style={{ background: `${s.accent}12`, color: s.accent, border: `1px solid ${s.accent}25` }}>
                  <s.Icon />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base sm:text-lg font-extrabold" style={{ color: BRAND2 }}>{s.title}</h2>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full"
                      style={{ background: `${s.accent}10`, color: s.accent }}>
                      {s.num}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base leading-loose" style={{ color: "#4a6072" }}>
                    {s.body}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}

        {/* Legal block */}
        <Reveal delay={400}>
          <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8"
            style={{ background: "linear-gradient(135deg, #003048, #024a65)", color: "#fff" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-teal-300"
                style={{ background: "rgba(255,255,255,0.08)" }}>
                <IconBuilding />
              </div>
              <h2 className="text-base sm:text-lg font-bold">بيانات المنشأة القانونية</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.06)" }}>
                <p className="opacity-60 text-[11px] mb-1">الاسم التجاري</p>
                <p className="font-bold">{company?.nameAr || "مؤسسة مدار الاجهزة الالكترونية"}</p>
              </div>
              <div className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.06)" }}>
                <p className="opacity-60 text-[11px] mb-1">الرقم الضريبي</p>
                <p className="font-bold font-mono">{company?.taxNumber || "—"}</p>
              </div>
              <div className="rounded-xl p-3.5 sm:col-span-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                <p className="opacity-60 text-[11px] mb-1">العنوان والمقر</p>
                <p className="font-bold">{company?.addressAr || "المملكة العربية السعودية"}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══ CONTACT ══ */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 pb-16">
        <ContactSection
          title="عندك استفسار عن السياسات؟"
          phone={company?.phone}
          whatsapp={company?.whatsapp}
          email={company?.email}
          fadeDelay={200}
        />
      </div>
    </main>
  );
}
