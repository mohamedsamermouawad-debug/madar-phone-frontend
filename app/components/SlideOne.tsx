"use client";
import Link from "next/link";
import Image from "next/image";

interface Props {
  visible: boolean;
}

export default function SlideOne({ visible }: Props) {
  return (
    <section
      className="hero-slide"
      style={{
        position: "absolute",
        inset: 0,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <Image
        src="/hhhhhhhhhh.webp"
        alt="hero background"
        fill
        className="object-cover slide-img"
        priority
        unoptimized
      />

      {/* Overlay - desktop: side gradient | mobile: bottom gradient */}
      <div className="slide-overlay slide1-overlay" />

      {/* Glow ring - hidden on mobile */}
      <div className="glow-ring slide1-ring" />

      <div className="slide-content">
        <div className="slide-inner">
          <span className="slide-badge slide1-badge">
            كل ما تحتاجه في مكان واحد ✦
          </span>
          <h1 className="slide-title">
            تكنولوجيا <br />
            <span className="slide1-accent">تدور حولك</span>
          </h1>
          <p className="slide-desc">
            اكتشف أحدث أجهزة الآيفون، الآيباد، الماكبوك،
            <br className="hide-mobile" />
            السماعات والإكسسوارات بتجربة فاخرة.
          </p>
          <div className="slide-btns">
            <Link
              href="/smartphones"
              className="btn-primary slide1-btn-primary"
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              تسوق الآن
            </Link>
            <Link
              href="/products"
              className="btn-secondary slide1-btn-secondary"
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(101,224,205,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              تصفح المنتجات
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .slide1-overlay {
          background: linear-gradient(
            to left,
            rgba(2,16,18,0.92) 0%,
            rgba(2,16,18,0.7) 40%,
            rgba(2,16,18,0.2) 75%,
            transparent 100%
          );
        }
        .slide1-ring {
          border-color: rgba(101,224,205,0.2);
          box-shadow: 0 0 100px rgba(101,224,205,0.1);
        }
        .slide1-badge {
          border-color: rgba(101,224,205,0.4);
          color: #65e0cd;
        }
        .slide1-accent {
          color: #65e0cd;
          text-shadow: 0 0 20px rgba(101,224,205,0.5);
        }
        .slide1-btn-primary {
          background: #65e0cd;
          color: #000;
          font-weight: bold;
          box-shadow: 0 0 30px rgba(101,224,205,0.4);
        }
        .slide1-btn-secondary {
          border: 1px solid rgba(101,224,205,0.35);
          color: white;
        }

        /* ── Shared slide styles ── */
        .slide-img { object-position: center center; }
        .slide-overlay {
          position: absolute;
          inset: 0;
        }
        .glow-ring {
          position: absolute;
          right: 5%;
          top: 50%;
          transform: translateY(-50%);
          width: 700px;
          height: 700px;
          border-radius: 50%;
          border: 1.5px solid;
          pointer-events: none;
          z-index: 1;
        }
        .slide-content {
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
        .slide-inner {
          width: 65%;
          max-width: 850px;
          text-align: right;
          color: #f5ffff;
        }
        .slide-badge {
          display: inline-block;
          padding: 10px 22px;
          border: 1px solid;
          border-radius: 40px;
          margin-bottom: 25px;
          font-size: 15px;
        }
        .slide-title {
          font-size: clamp(42px, 7vw, 90px);
          line-height: 1.1;
          font-weight: 800;
          margin-bottom: 25px;
          color: #f5ffff;
        }
        .slide-desc {
          font-size: clamp(15px, 1.4vw, 20px);
          line-height: 1.9;
          color: #d6d6d6;
          margin-bottom: 40px;
        }
        .slide-btns {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          flex-wrap: wrap;
        }
        .btn-primary, .btn-secondary {
          padding: 14px 32px;
          border-radius: 14px;
          font-size: 16px;
          text-decoration: none;
          display: inline-block;
          transition: transform 0.3s, background 0.3s;
        }
        .btn-secondary { background: transparent; }

        /* ── Tablet (≤ 900px) ── */
        @media (max-width: 900px) {
          .glow-ring { width: 450px; height: 450px; }
          .slide-inner { width: 80%; }
        }

        /* ── Mobile (≤ 768px) ── */
        @media (max-width: 768px) {
          .slide-img { object-position: top center; }
          .slide1-overlay {
            background: linear-gradient(
              to top,
              rgba(2,16,18,0.98) 0%,
              rgba(2,16,18,0.6) 45%,
              rgba(2,16,18,0.05) 100%
            );
          }
          .glow-ring { display: none; }
          .slide-content {
            min-height: 85svh;
            justify-content: center;
            align-items: flex-end;
            padding: 0 0 36px 0;
          }
          .slide-inner {
            width: 100%;
            text-align: center;
            padding: 0 20px;
          }
          .slide-btns { justify-content: center; }
          .slide-badge { font-size: 12px; padding: 7px 14px; margin-bottom: 12px; }
          .slide-title { font-size: clamp(28px, 8vw, 42px); margin-bottom: 12px; }
          .slide-desc { font-size: 13px; line-height: 1.7; margin-bottom: 20px; }
          .btn-primary, .btn-secondary { padding: 11px 24px; font-size: 14px; }
          .hide-mobile { display: none; }
        }

        /* ── Small mobile (≤ 480px) ── */
        @media (max-width: 480px) {
          .slide-content { min-height: 80svh; padding: 0 0 28px 0; }
          .slide-title { font-size: clamp(24px, 9vw, 34px); }
          .slide-btns { flex-direction: column; align-items: center; }
          .btn-primary, .btn-secondary { width: 100%; text-align: center; }
        }
      `}</style>
    </section>
  );
}
