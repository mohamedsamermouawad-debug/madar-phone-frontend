import Link from "next/link";
import { IoArrowBack, IoShieldCheckmarkOutline, IoCarOutline, IoChatbubbleEllipsesOutline } from "react-icons/io5";
import "./hero.css";

export default function HeroSection() {
  return (
    <section className="madar-hero" dir="rtl" aria-labelledby="hero-title">
      <div className="madar-hero-photo" aria-hidden="true" />

      <div className="madar-hero-inner">
        <div className="madar-hero-copy">

          <h1 id="hero-title">آيفونك الآن.<br/><span>بسعر الكاش، بالتقسيط.</span></h1>
          <p className="hero-description">اختر آيفونك المفضل، وخلّ الباقي على دفعات مريحة.</p>
          <div className="hero-payment" aria-label="دفعة أولى ألف ريال وتقسيط على سنتين بدون فوائد">
            <div><span>دفعة أولى فقط</span><p><strong>1,000</strong> ريال</p></div>
            <div><span>قسّط على</span><p><strong>24</strong> شهر <small>بدون فوائد</small></p></div>
          </div>
          <div className="hero-actions"><Link href="/store" className="hero-shop">تسوّق الآيفون <IoArrowBack size={18}/></Link><Link href="/store" className="hero-explore">اكتشف عروضنا</Link></div>
          <div className="hero-promises"><span><IoCarOutline/>شحن سريع</span><span><IoShieldCheckmarkOutline/>ضمان رسمي</span><span><IoChatbubbleEllipsesOutline/>دعم سعودي</span></div>
        </div>
      </div>
    </section>
  );
}

