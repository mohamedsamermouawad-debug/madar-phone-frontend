"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoCartOutline, IoCheckmark } from "react-icons/io5";
import toast from "react-hot-toast";
import type { Product } from "./types";
import { useCartStore } from "../../store/cartStore";
import "./product-card.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const fmt = (n: number) => n.toLocaleString("en-US");

function storageLabel(value: string) {
  return String(value ?? "").trim().replace(/جيجابايت|جيجا بايت|جيجا|GB/gi, " GB").replace(/تيرابايت|تيرا بايت|تيرا|TB/gi, " TB").replace(/\s+/g, " ").trim();
}

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();
  const href = `/product/${product._id}`;
  const image = product.images?.[0] || product.image;
  const imageUrl = image ? (image.startsWith("http") ? image : `${API}${image.startsWith("/") ? image : `/${image}`}`) : undefined;
  const options = product.variants?.flatMap((variant) => variant?.storageOptions ?? []) ?? [];
  const capacities = [...new Set(options.map((option) => storageLabel(option.storage)).filter(Boolean))];
  const nameStorage = product.name.match(/[\d٠-٩]+\s*(?:GB|TB|جيجابايت|جيجا بايت|جيجا|تيرابايت|تيرا بايت|تيرا)/i)?.[0];
  const capacity = storageLabel(product.storage || product.specs?.storage || product.variants?.[0]?.defaultStorage || nameStorage || "");
  const prices = options.map((option) => option.salePrice || option.originalPrice).filter((price) => price > 0);
  const original = product.originalPrice || product.price || 0;
  const price = prices.length ? Math.min(...prices) : product.salePrice || original;
  const hasVariants = !!product.variants?.length;
  const canInstall = price >= 1000;

  function handleAddToCart() {
    if (!available || added) return;
    if (hasVariants) {
      router.push(href);
      return;
    }
    addItem(product);
    setAdded(true);
    toast.success("تمت الإضافة للسلة ✓", { duration: 2000 });
    setTimeout(() => router.push("/cart"), 800);
  }

  return (
    <article className="catalog-card" dir="rtl">
      <Link href={href} className="catalog-image" aria-label={title}>
        {imageUrl ? <Image src={imageUrl} alt={title} fill priority={priority} sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 240px" className="object-contain"/> : <span className="catalog-no-image">الصورة غير متاحة</span>}
        {!available ? <span className="catalog-badge">غير متوفر</span> : product.discountPercent > 0 && <span className="catalog-badge">خصم {product.discountPercent}%</span>}
      </Link>
      <div className="catalog-content">
        <h3><Link href={href} title={title}>{title}</Link></h3>
        <div className="catalog-specs">
          {capacities.length > 1 ? <span className="catalog-storage" title={capacities.join(" / ")}>سعات متعددة · <bdi>{capacities[0]}</bdi> +</span> : capacity || capacities[0] ? <span className="catalog-storage" aria-label={`سعة التخزين ${capacity || capacities[0]}`}><bdi>{capacity || capacities[0]}</bdi></span> : null}
          {product.color && <span className="catalog-color" title={product.color}>{product.color}</span>}
        </div>
        <div className="catalog-price"><div>{prices.length > 1 && <small>من </small>}<strong>{fmt(price)}</strong><Image src="/money-icon.webp" alt="ريال سعودي" width={32} height={32} className="catalog-currency-icon" aria-hidden="true" unoptimized/></div>{!prices.length && original > price && <del>{fmt(original)}</del>}</div>
        {canInstall ? (
          <div className="catalog-installment"><span>مقدم <b>1000</b> ريال</span><span className="catalog-installment-note"><IoCheckmark aria-hidden="true" />بدون فوائد</span></div>
        ) : (
          <div className="catalog-installment"><span>سعر الكاش</span><span className="catalog-installment-note"><IoCheckmark aria-hidden="true" />شحن مجاني</span></div>
        )}
        <button
          type="button"
          className="catalog-action"
          disabled={!available || added}
          onClick={handleAddToCart}
          aria-label={`أضف ${title} إلى السلة`}
        >
          {added
            ? <><IoCheckmark size={16}/>تمت الإضافة</>
            : <><IoCartOutline size={16}/>{available ? (hasVariants ? "اطلبه الآن" : "أضف للسلة") : "غير متوفر"}</>
          }
        </button>
        <span className="sr-only" role="status">{added ? "تمت إضافة المنتج للسلة" : ""}</span>
      </div>
    </article>
  );
}
