"use client";

import { useState } from "react";
import Image from "next/image";
import { IoCartOutline, IoShieldCheckmark, IoCarOutline, IoRemove, IoAdd, IoArrowBack, IoCheckmarkCircle } from "react-icons/io5";
import type { Product } from "../../../components/products/types";

function SAR({ className }: { className?: string }) {
  return (
    <Image
      src="/money-icon.webp"
      alt="ر.س"
      width={32}
      height={32}
      className={`inline-block align-middle ${className ?? ""}`}
    />
  );
}

const fmt = (n: number) => n.toLocaleString("en-US");
interface Props {
  product: Product;
  addedToCart: boolean;
  onAddToCart: (qty: number) => void;
  onBuyNow: (qty: number) => void;
  onVariantChange?: (images: string[]) => void;
}

export default function ProductInfo({ product, addedToCart, onAddToCart, onBuyNow, onVariantChange }: Props) {
  const variants = product.variants ?? [];
  const [colorIdx, setColorIdx] = useState(0);
  const [storage, setStorage] = useState(variants[0]?.defaultStorage ?? product.storage ?? "");
  const [qty, setQty] = useState(1);
  const variant = variants[colorIdx];
  const options = variant?.storageOptions ?? [];
  const selected = options.find((s) => s.storage === storage) ?? options[0];
  const original = selected?.originalPrice ?? product.originalPrice;
  const price = (selected?.salePrice ?? product.salePrice) || original || product.price || 0;
  const available = product.inStock !== false;

  return (
    <div className="product-info" dir="rtl" id="product-options">
      <div className="product-eyebrow">
        {product.brand?.toLowerCase().includes("apple") && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "#f5f5f7" }}>
            <Image src="/Apple_Logo_0.svg" alt="Apple" width={7} height={8} className="product-brand-logo" style={{ opacity: 0.8 }} />
          </span>
        )}
        <span className={available ? "stock-label" : ""}>{available ? "متوفر للطلب" : "غير متوفر حاليًا"}</span>
      </div>
      <h1>{variant?.name || product.name.replace(/^"|"$/g, "")}</h1>
      <div className="product-price"><span className="field-label">سعر الجهاز</span><div><strong>{fmt(price)}</strong> <SAR className="mb-0.5" />{original > price && <del>{fmt(original)} <SAR className="opacity-50 mb-0.5" /></del>}</div>{product.taxIncluded && <small>شامل ضريبة القيمة المضافة</small>}</div>

      <section className="installment-card" aria-label="التقسيط بسعر الكاش">
        <div className="installment-heading"><span className="installment-icon"><IoCheckmarkCircle size={22}/></span><div><h2>تقسيط بسعر الكاش</h2><p>على سنتين بدون فوائد</p></div></div>
        <div className="installment-numbers"><div><span>الدفعة الأولى</span><p><strong>1,000</strong> <SAR className="mb-0.5" /></p></div><div><span>المتبقي للتقسيط</span><p><strong>{fmt(Math.max(0, price - 1000))}</strong> <SAR className="mb-0.5" /></p></div></div>
        <div className="installment-foot"><span>نفس سعر الكاش</span><span>24 شهر · بدون فوائد</span></div>
      </section>

      <div className="product-choices">
        <div className="choices-row">
          {variants.length > 0 && (
            <fieldset className="choices-field">
              <legend>اللون <span>— {variant?.color}</span></legend>
              <div className="color-options">
                {variants.map((v, i) => (
                  <button key={i} aria-label={v.color} aria-pressed={i === colorIdx} title={v.color}
                    className={i === colorIdx ? "color-option selected" : "color-option"}
                    onClick={() => { setColorIdx(i); setStorage(v.defaultStorage); onVariantChange?.(v.images); }}>
                    <span style={{ background: v.colorCode }} />
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          <fieldset className="choices-field quantity-field">
            <legend>الكمية</legend>
            <div className="quantity-control">
              <button aria-label="تقليل الكمية" disabled={qty === 1} onClick={() => setQty(Math.max(1, qty - 1))}><IoRemove /></button>
              <output>{qty}</output>
              <button aria-label="زيادة الكمية" onClick={() => setQty(qty + 1)}><IoAdd /></button>
            </div>
          </fieldset>
        </div>
        {options.length > 0
          ? <fieldset><legend>سعة التخزين</legend><div className="storage-options">{options.map((opt) => <button key={opt.storage} aria-pressed={selected?.storage === opt.storage} className={selected?.storage === opt.storage ? "selected" : ""} onClick={() => setStorage(opt.storage)}>{opt.storage}</button>)}</div></fieldset>
          : product.storage && <div className="single-storage"><span>سعة التخزين</span><strong>{product.storage}</strong></div>
        }
      </div>

      <div className="purchase-actions">
        <button disabled={!available} className="primary-purchase" onClick={() => onBuyNow(qty)}>اطلبه بالتقسيط <IoArrowBack size={19}/></button>
        <button disabled={!available} className="secondary-purchase" onClick={() => onAddToCart(qty)}><IoCartOutline size={20}/>{addedToCart ? "تمت الإضافة للسلة ✓" : "أضف إلى السلة"}</button>
      </div>
      <div className="product-assurances">{product.freeDelivery && <span><IoCarOutline size={19}/>شحن مجاني{product.deliveryTime ? ` · ${product.deliveryTime}` : ""}</span>}{product.warrantyYears > 0 && <span><IoShieldCheckmark size={18}/>ضمان {product.warrantyYears === 1 ? "سنة" : product.warrantyYears === 2 ? "سنتين" : `${product.warrantyYears} سنوات`}</span>}</div>
      {!!product.installment?.conditions?.length && <details className="installment-conditions"><summary>شروط وتفاصيل التقسيط</summary><ul>{product.installment.conditions.map((condition, i) => <li key={i}>{condition}</li>)}</ul><p>يتم تفعيل التقسيط بعد مراجعة البيانات والموافقة.</p></details>}
    </div>
  );
}

