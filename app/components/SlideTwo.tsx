"use client";
import Link from "next/link";
import Image from "next/image";

interface Props {
  visible: boolean;
}

const features = [
  { icon: "🚚", label: "شحن سريع" },
  { icon: "🛡️", label: "ضمان رسمي" },
  { icon: "🔒", label: "دفع آمن" },
  { icon: "🎧", label: "دعم متميز" },
];

export default function SlideTwo({ visible }: Props) {
  return (
    <section
      style={{
        position: "absolute",
        inset: 0,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
        pointerEvents: visible ? "auto" : "none",
        overflow: "hidden",
      }}
    >
      <Image
        src="/hhhh1111.webp"
        alt="iPhone 17 background"
        fill
        className="object-cover s2-img"
        unoptimized
      />

      <div className="slide2-overlay" />
      <div className="slide2-ring" />

      <div className="s2-content">
        <div className="s2-inner">
          <span className="s2-badge">✦ الجديد كليًا</span>
          <h4 className="s2-subtitle">iPhone 17 Pro Max</h4>
          <h1 className="s2-title">
            قوة تُلهم.<br />
            <span className="s2-accent">تصميم يتفوق.</span>
          </h1>
          <p className="s2-desc">
            أداء غير مسبوق، تصميم متطور، وتجربة iPhone
            <br className="s2-hide-mobile" />
            متكاملة لاكتشاف المستقبل بين يديك.
          </p>
          <div className="s2-btns">
            <Link
              href="/smartphones"
              className="s2-btn-primary"
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              تسوق الآن
            </Link>
            <Link
              href="/products"
              className="s2-btn-secondary"
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,120,0,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              استكشف المزيد
            </Link>
          </div>
          <div className="s2-features">
            {features.map((f) => (
              <div key={f.label} className="s2-feature-item">
                <span className="s2-feature-icon">{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .s2-img { object-position: center center; }
        .slide2-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to left,
            rgba(5,5,5,0.92) 0%,
            rgba(5,5,5,0.7) 40%,
            rgba(5,5,5,0.2) 75%,
            transparent 100%
          );
        }
        .slide2-ring {
          position: absolute;
          right: 5%;
          top: 50%;
          transform: translateY(-50%);
          width: 700px;
          height: 700px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,120,0,0.2);
          box-shadow: 0 0 100px rgba(255,120,0,0.1);
          pointer-events: none;
          z-index: 1;
        }
        .s2-content {
          position: relative;
          z-index: 2;
          width: 100%;
          padding: 0 5% 0 0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          direction: ltr;
        }
        .s2-inner {
          width: 65%;
          max-width: 850px;
          text-align: right;
          color: #fff;
        }
        .s2-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 24px;
          border: 1px solid rgba(255,120,0,0.4);
          border-radius: 40px;
          color: #ff7a00;
          margin-bottom: 20px;
          font-size: 16px;
        }
        .s2-subtitle {
          color: #ff7a00;
          font-size: clamp(18px, 3vw, 40px);
          margin-bottom: 10px;
        }
        .s2-title {
          font-size: clamp(38px, 7vw, 90px);
          line-height: 1.05;
          font-weight: 900;
          margin-bottom: 20px;
        }
        .s2-accent {
          color: #ff7a00;
          text-shadow: 0 0 20px rgba(255,120,0,0.5);
        }
        .s2-desc {
          color: #bdbdbd;
          font-size: clamp(15px, 1.4vw, 20px);
          line-height: 1.9;
          margin-bottom: 40px;
        }
        .s2-btns {
          display: flex;
          justify-content: flex-end;
          gap: 20px;
          margin-bottom: 50px;
          flex-wrap: wrap;
        }
        .s2-btn-primary {
          padding: 14px 36px;
          border-radius: 14px;
          font-size: 16px;
          background: #ff7a00;
          color: #fff;
          font-weight: bold;
          box-shadow: 0 0 35px rgba(255,120,0,0.45);
          text-decoration: none;
          transition: transform 0.3s;
        }
        .s2-btn-secondary {
          padding: 14px 36px;
          border-radius: 14px;
          font-size: 16px;
          background: transparent;
          border: 1px solid rgba(255,120,0,0.35);
          color: #fff;
          text-decoration: none;
          transition: background 0.3s;
        }
        .s2-features {
          display: flex;
          justify-content: flex-end;
          gap: 30px;
          flex-wrap: wrap;
        }
        .s2-feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #d6d6d6;
          font-size: 15px;
        }
        .s2-feature-icon { font-size: 20px; }

        /* ── Tablet (≤ 900px) ── */
        @media (max-width: 900px) {
          .slide2-ring { width: 450px; height: 450px; }
          .s2-inner { width: 80%; }
        }

        /* ── Mobile (≤ 768px) ── */
        @media (max-width: 768px) {
          .s2-img { object-position: top center; }
          .slide2-overlay {
            background: linear-gradient(
              to top,
              rgba(5,5,5,0.98) 0%,
              rgba(5,5,5,0.6) 45%,
              rgba(5,5,5,0.05) 100%
            );
          }
          .slide2-ring { display: none; }
          .s2-content {
            min-height: 85svh;
            justify-content: center;
            align-items: flex-end;
            padding: 0 0 36px 0;
          }
          .s2-inner {
            width: 100%;
            text-align: center;
            padding: 0 20px;
          }
          .s2-btns, .s2-features { justify-content: center; }
          .s2-badge { font-size: 12px; padding: 7px 14px; margin-bottom: 12px; }
          .s2-subtitle { font-size: clamp(14px, 4vw, 20px); margin-bottom: 6px; }
          .s2-title { font-size: clamp(26px, 8vw, 40px); margin-bottom: 10px; }
          .s2-desc { font-size: 13px; line-height: 1.7; margin-bottom: 20px; }
          .s2-btn-primary, .s2-btn-secondary { padding: 11px 24px; font-size: 14px; }
          .s2-btns { margin-bottom: 20px; gap: 12px; }
          .s2-features { gap: 14px; }
          .s2-feature-item { font-size: 12px; }
          .s2-hide-mobile { display: none; }
        }

        /* ── Small mobile (≤ 480px) ── */
        @media (max-width: 480px) {
          .s2-content { min-height: 80svh; padding: 0 0 28px 0; }
          .s2-title { font-size: clamp(22px, 9vw, 32px); }
          .s2-btns { flex-direction: column; align-items: center; gap: 10px; }
          .s2-btn-primary, .s2-btn-secondary { width: 100%; text-align: center; }
          .s2-features { gap: 10px; }
        }
      `}</style>
    </section>
  );
}
