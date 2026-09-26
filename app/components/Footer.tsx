import Link from "next/link";
import Image from "next/image";
import { FaWhatsapp, FaMobileAlt, FaEnvelope } from "react-icons/fa";
import { IoChevronBack } from "react-icons/io5";
import { getCompanyData } from "../lib/companyCache";

export default async function Footer() {
  const c = await getCompanyData();


  function ensureAbsolute(url: string) {
    if (!url) return "";
    return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
  }

  function toInlineUrl(url: string) {
    if (!url) return "";
    return `/api/file-proxy?url=${encodeURIComponent(url)}`;
  }

  const qrSrc: string = c.qrImage || "";
  const isQrFile = c.qrLinkType === "file" || (!c.qrLink && !!c.qrFile);
  const qrLink: string = isQrFile ? (c.qrFile ? toInlineUrl(c.qrFile) : "") : ensureAbsolute(c.qrLink || "");

  const footerItems: { image: string; linkType?: string; link?: string; file?: string }[] =
    (c.footerItems || []).filter((item: { image: string }) => item.image);

  const img1: string = c.img1 || "";
  const isFile1 = c.link1Type === "file" || c.linkType1 === "file" || (!c.link1 && !c.linkType1 && !c.link1Type && !!c.file1);
  const link1: string = isFile1 ? (c.file1 ? toInlineUrl(c.file1) : "") : ensureAbsolute(c.link1 || "");

  const img2: string = c.img2 || "";
  const isFile2 = c.link2Type === "file" || c.linkType2 === "file" || (!c.link2 && !c.linkType2 && !c.link2Type && !!c.file2);
  const link2: string = isFile2 ? (c.file2 ? toInlineUrl(c.file2) : "") : ensureAbsolute(c.link2 || "");

  function getHref(item: { linkType?: string; link?: string; file?: string }) {
    const isFile = item.linkType === "file" || (!item.linkType && !!item.file && !item.link);
    if (isFile) {
      return item.file ? toInlineUrl(item.file) : "";
    }
    return item.link ? ensureAbsolute(item.link) : "";
  }

  const links = [
    { label: "عن المتجر", href: "/about" },
    { label: "طرق الدفع", href: "/payment" },
    { label: "سياسة الاستبدال والاسترجاع", href: "/return-policy" },
    { label: "سياسة الخصوصية واتفاقية الاستخدام", href: "/privacy" },
  ];

  return (
    <footer dir="rtl" className="mt-16" style={{ background: "#fff", borderTop: "1px solid #eaf3f8" }}>

      <div className="max-w-6xl mx-auto px-5 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">

        {/* من نحن */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-black tracking-wide" style={{ color: "#003048" }}>
            من نحن
          </h3>
          <div className="w-6 h-0.5 rounded-full" style={{ background: "#0889A2" }} />
          <p className="text-sm leading-7" style={{ color: "#6b7280" }}>
            {c.details || "مؤسسة مدار الاجهزة الالكترونية هي اختيارك الأول لشراء أجهزتك بالأقساط داخل السعودية، ضمان موثوق وخدمة محلية."}
          </p>
        </div>

        {/* روابط مهمة */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-black tracking-wide" style={{ color: "#003048" }}>
            روابط مهمة
          </h3>
          <div className="w-6 h-0.5 rounded-full" style={{ background: "#0889A2" }} />
          <ul className="flex flex-col gap-2">
            {links.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-2 text-sm transition-colors group"
                  style={{ color: "#6b7280" }}
                >
                  <IoChevronBack size={11} style={{ color: "#0889A2" }} className="group-hover:translate-x-[-2px] transition-transform" />
                  <span className="group-hover:text-[#0889A2] transition-colors">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* تواصل معنا */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-black tracking-wide" style={{ color: "#003048" }}>
            تواصل معنا
          </h3>
          <div className="w-6 h-0.5 rounded-full" style={{ background: "#0889A2" }} />
          <ul className="flex flex-col gap-3">
            {c.whatsapp && (
              <li>
                <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 text-sm transition-colors hover:text-[#0889A2]"
                  style={{ color: "#6b7280" }} dir="ltr">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
                    style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    <FaWhatsapp style={{ color: "#16a34a" }} size={14} />
                  </span>
                  {c.whatsapp}
                </a>
              </li>
            )}
            {c.phone && (
              <li>
                <a href={`tel:${c.phone}`}
                  className="flex items-center gap-3 text-sm transition-colors hover:text-[#0889A2]"
                  style={{ color: "#6b7280" }} dir="ltr">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
                    style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}>
                    <FaMobileAlt style={{ color: "#0889A2" }} size={14} />
                  </span>
                  {c.phone}
                </a>
              </li>
            )}
            {c.email && (
              <li>
                <a href={`mailto:${c.email}`}
                  className="flex items-center gap-3 text-sm transition-colors hover:text-[#0889A2]"
                  style={{ color: "#6b7280" }} dir="ltr">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
                    style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}>
                    <FaEnvelope style={{ color: "#0889A2" }} size={13} />
                  </span>
                  {c.email}
                </a>
              </li>
            )}
          </ul>

          {/* Images row */}
          <div className="flex gap-2 items-center flex-wrap mt-1">
            {qrSrc && (
              qrLink
                ? <a href={qrLink} target="_blank" rel="noreferrer" className="shrink-0">
                    <Image src={qrSrc} alt="qr" width={200} height={200}
                      className="rounded-xl border bg-white p-1 h-auto w-auto max-h-14"
                      style={{ borderColor: "#e5e7eb" }} />
                  </a>
                : <Image src={qrSrc} alt="qr" width={200} height={200}
                    className="rounded-xl border bg-white p-1 shrink-0 h-auto w-auto max-h-14"
                    style={{ borderColor: "#e5e7eb" }} />
            )}
            {footerItems.map((item, i) => {
              const href = getHref(item);
              const el = <Image key={i} src={item.image} alt={`footer-item-${i}`} width={200} height={200} className="rounded-xl h-auto w-auto max-h-14" />;
              return href
                ? <a key={i} href={href} target="_blank" rel="noreferrer" className="shrink-0">{el}</a>
                : <span key={i} className="shrink-0">{el}</span>;
            })}
            {img1 && (
              link1
                ? <a href={link1} target="_blank" rel="noreferrer" className="shrink-0">
                    <Image src={img1} alt="img1" width={200} height={200} className="rounded-xl h-auto w-auto max-h-14" />
                  </a>
                : <Image src={img1} alt="img1" width={200} height={200} className="rounded-xl shrink-0 h-auto w-auto max-h-14" />
            )}
            {img2 && (
              link2
                ? <a href={link2} target="_blank" rel="noreferrer" className="shrink-0">
                    <Image src={img2} alt="img2" width={200} height={200} className="rounded-xl h-auto w-auto max-h-14" />
                  </a>
                : <Image src={img2} alt="img2" width={200} height={200} className="rounded-xl shrink-0 h-auto w-auto max-h-14" />
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid #eaf3f8", background: "#fafbfc" }}>
        <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex gap-4 items-center flex-wrap">
            <Image src="/visa.webp" alt="Visa" width={30} height={18} className="object-contain" style={{ width: "auto", height: "14px", opacity: 0.8 }} />
            <Image src="/mastercard.webp" alt="Mastercard" width={30} height={18} className="object-contain" style={{ width: "auto", height: "14px", opacity: 0.8 }} />
            <Image src="/mada.svg" alt="Mada" width={30} height={18} className="object-contain" style={{ width: "auto", height: "14px", opacity: 0.8 }} />
            <Image src="/stc.svg" alt="STC Pay" width={30} height={18} className="object-contain" style={{ width: "auto", height: "14px", opacity: 0.8 }} />
            <Image src="/Apple-Pay-01.png" alt="Apple Pay" width={80} height={50} className="object-contain" style={{ width: "auto", height: "46px", opacity: 0.8 }} />
          </div>
          <span className="text-xs" style={{ color: "#9ca3af" }}>
            الحقوق محفوظة مؤسسة مدار الاجهزة الالكترونية © 2026
          </span>
        </div>
      </div>
    </footer>
  );
}
