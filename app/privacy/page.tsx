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

export default function PrivacyPage() {
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

          <p {...anim(340)} className="text-sm sm:text-lg max-w-xl mx-auto leading-loose" style={{ color: "#4a6072" }}>
            كيف نتعامل مع بياناتك وإيش هي حقوقك عند تعاملك مع مدار للإلكترونيات
          </p>

          {/* chips */}
          <div {...anim(440)} className="flex flex-wrap justify-center gap-2 mt-7">
            {[
              { label: "بياناتك محمية",     color: BRAND },
              { label: "ما نبيع بياناتك",  color: "#16a34a" },
              { label: "شروط واضحة",       color: "#7c3aed" },
            ].map((f) => (
              <span key={f.label} className="inline-flex items-center text-xs font-semibold rounded-full px-4 py-1.5"
                style={{ background: `${f.color}0f`, border: `1px solid ${f.color}28`, color: f.color }}>
                {f.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTIONS ══ */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-4">
        {sections.map((s, i) => (
          <Reveal key={s.title} delay={i * 110}>
            <div className="group rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300"
              style={{ background: "#ffffff", border: "1px solid #e8f0f4" }}>
              <div className="flex flex-col sm:flex-row">
                <div className="hidden sm:flex flex-col items-center pt-7 px-5 shrink-0 gap-2">
                  <span className="text-2xl font-black" style={{ color: `${s.accent}28` }}>{s.num}</span>
                  <div className="w-px flex-1 mb-5" style={{ background: `linear-gradient(to bottom, ${s.accent}30, transparent)` }} />
                </div>
                <div className="sm:hidden h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${s.accent}, transparent)` }} />

                <div className="flex-1 p-5 sm:p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300"
                      style={{ background: `${s.accent}10`, color: s.accent, border: `1px solid ${s.accent}22` }}>
                      <s.Icon />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-xl font-extrabold" style={{ color: BRAND2 }}>{s.title}</h2>
                      <div className="h-px w-10 mt-1.5 rounded-full" style={{ background: `linear-gradient(90deg, ${s.accent}, transparent)` }} />
                    </div>
                  </div>
                  <p className="text-sm sm:text-base leading-loose" style={{ color: "#4a6072" }}>{s.body}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}

        {/* company info */}
        {company && (
          <Reveal delay={sections.length * 110}>
            <div className="group rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300"
              style={{ background: "#ffffff", border: "1px solid #e8f0f4" }}>
              <div className="flex flex-col sm:flex-row">
                <div className="hidden sm:flex flex-col items-center pt-7 px-5 shrink-0 gap-2">
                  <span className="text-2xl font-black" style={{ color: "rgba(100,116,139,0.22)" }}>05</span>
                  <div className="w-px flex-1 mb-5" style={{ background: "linear-gradient(to bottom, rgba(100,116,139,0.2), transparent)" }} />
                </div>
                <div className="sm:hidden h-0.5 w-full" style={{ background: "linear-gradient(90deg, #64748b, transparent)" }} />
                <div className="flex-1 p-5 sm:p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300"
                      style={{ background: "rgba(100,116,139,0.08)", color: "#64748b", border: "1px solid rgba(100,116,139,0.18)" }}>
                      <IconBuilding />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-xl font-extrabold" style={{ color: BRAND2 }}>بيانات المتجر</h2>
                      <div className="h-px w-10 mt-1.5 rounded-full" style={{ background: "linear-gradient(90deg, #64748b, transparent)" }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                    {company.nameAr    && <p className="text-sm leading-relaxed" style={{ color: "#4a6072" }}><span className="font-semibold" style={{ color: BRAND2 }}>اسم الجهة: </span>{company.nameAr}</p>}
                    {company.addressAr && <p className="text-sm leading-relaxed" style={{ color: "#4a6072" }}><span className="font-semibold" style={{ color: BRAND2 }}>العنوان: </span>{company.addressAr}</p>}
                    {company.phone     && <p className="text-sm leading-relaxed" style={{ color: "#4a6072" }}><span className="font-semibold" style={{ color: BRAND2 }}>الهاتف: </span>{company.phone}</p>}
                    {company.email     && <p className="text-sm leading-relaxed break-all" style={{ color: "#4a6072" }}><span className="font-semibold" style={{ color: BRAND2 }}>البريد: </span>{company.email}</p>}
                    {company.taxNumber && <p className="text-sm leading-relaxed" style={{ color: "#4a6072" }}><span className="font-semibold" style={{ color: BRAND2 }}>الرقم الضريبي: </span>{company.taxNumber}</p>}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        )}
      </section>

      {/* ══ CONTACT ══ */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 pb-16">
        <ContactSection
          title="تواصل معنا"
          phone={company?.whatsapp}
          whatsapp={company?.whatsapp}
          email={company?.email}
          fadeDelay={200}
        />
      </div>
    </main>
  );
}
