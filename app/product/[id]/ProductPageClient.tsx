"use client";

import { useState, useEffect } from "react";
import "./product.css";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IoArrowForward, IoShareSocial, IoHomeOutline, IoChevronBack } from "react-icons/io5";
import Link from "next/link";
import type { Product } from "../../components/products/types";
import { useCartStore } from "../../store/cartStore";
import ProductImages from "./components/ProductImages";
import ProductInfo from "./components/ProductInfo";
import ProductDetails from "./components/ProductDetails";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProductPageClient({ id }: { id: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [variantImages, setVariantImages] = useState<string[] | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => { if (!r.ok) throw new Error("Product not found"); return r.json(); })
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Skeleton ── */
  if (loading)
    return (
      <main className="min-h-screen bg-[#F7FAFC]" dir="rtl">
        <div className="bg-white border-b border-[#EAF3F8] px-4 py-2.5">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
            <div className="h-2.5 w-40 bg-gray-100 animate-pulse rounded-full" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            <div className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
            <div className="space-y-4 pt-2">
              {[20, 60, 32, 80, 48].map((w, i) => (
                <div key={i} className="h-3 bg-gray-100 animate-pulse rounded-full" style={{ width: `${w}%` }} />
              ))}
              <div className="h-11 w-full bg-gray-100 animate-pulse rounded-xl mt-4" />
            </div>
          </div>
        </div>
      </main>
    );

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC]">
        <p className="text-sm font-semibold text-[#90AEBA]">المنتج غير موجود</p>
      </div>
    );

  const resolveImg = (src: string) => src.startsWith("http") ? src : `${BACKEND}${src}`;
  const merged = [...(product.images || []), ...(product.image ? [product.image] : [])];
  const baseImages = [...new Set(merged)].map(resolveImg);
  const allImages = variantImages ? variantImages.map(resolveImg) : baseImages;

  const handleShare = async () => {
    try { await navigator.share({ title: product.name, url: window.location.href }); } catch {}
  };

  return (
    <main className="product-page min-h-screen pb-10" dir="rtl">

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm"
        style={{ borderBottom: "1px solid #EAF3F8", boxShadow: "0 1px 8px rgba(0,48,72,0.04)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.back()}
              aria-label="رجوع"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EAF6FA] transition-colors"
              style={{ color: "#0889A2" }}
            >
              <IoArrowForward size={17} />
            </button>
            <nav className="hidden sm:flex items-center gap-1 text-[11px]" style={{ color: "#90AEBA" }}>
              <Link href="/" className="flex items-center gap-0.5 hover:text-[#0889A2] transition-colors">
                <IoHomeOutline size={11} />الرئيسية
              </Link>
              <IoChevronBack size={9} />
              {product.category && <><span>{product.category}</span><IoChevronBack size={9} /></>}
              <span className="font-semibold truncate max-w-[160px]" style={{ color: "#003048" }}>{product.name}</span>
            </nav>
          </div>
          <button
            onClick={handleShare}
            aria-label="مشاركة"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EAF6FA] transition-colors"
            style={{ color: "#0889A2" }}
          >
            <IoShareSocial size={15} />
          </button>
        </div>
      </motion.header>

      {/* ── Two-column layout ── */}
      <div className="product-shell">
        <div className="product-layout">

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ProductImages key={allImages.join("|")} images={allImages} name={product.name} discountPercent={product.discountPercent} />

          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.07 }}
          >
            <ProductInfo
              product={product}
              addedToCart={addedToCart}
              onAddToCart={(qty) => { addItem(product, qty); setAddedToCart(true); }}
              onBuyNow={(qty) => { addItem(product, qty); router.push("/cart"); }}
              onVariantChange={(imgs) => setVariantImages(imgs)}
            />
          </motion.div>
        </div>

        {/* ── Details section ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45 }}
        >
          <ProductDetails
            description={product.description}
            specs={product.specs}
            gallery={product.gallery}
            specifications={product.specifications}
            specGroups={product.specGroups}
            sections={product.sections}
            rating={product.rating}
            reviews={product.reviews}
          />
        </motion.div>
      </div>


    </main>
  );
}


