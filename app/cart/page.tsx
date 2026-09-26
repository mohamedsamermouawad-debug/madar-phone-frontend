"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  ReceiptText,
} from "lucide-react";
import { useCartStore } from "../store/cartStore";
import CartItem from "./components/CartItem";
import "./cart.css";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQty,
    totalItems,
  } = useCartStore();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) return <main className="basket-page" aria-busy="true" />;

  const count = totalItems();

  return (
    <main className="basket-page" dir="rtl">
      <div className="basket-shell">
        <Link href="/store" className="basket-back">
          <ArrowRight size={15} />
          متابعة التسوق
        </Link>

        {/* Heading */}
        <div className="basket-heading">
          <div>
            <span className="basket-eyebrow">اختياراتك من مدار</span>
            <h1>سلة مشترياتك</h1>
            <p>راجع أجهزتك، أكمل بياناتك، ثم اختر خطة السداد.</p>
          </div>
          <span className="basket-heading-icon">
            <ShoppingBag size={25} />
          </span>
        </div>

        {/* Empty */}
        {!items.length ? (
          <section className="basket-empty">
            <ShoppingBag size={48} />
            <h2>سلتك في انتظار اختياراتك</h2>
            <p>تصفّح الأجهزة وأضف الجهاز المناسب لك.</p>
            <Link className="basket-primary" href="/store">
              تصفّح المنتجات <ArrowLeft size={16} />
            </Link>
          </section>
        ) : (
          <div className="basket-layout">
            {/* ── Main column ── */}
            <div className="basket-main">

              {/* منتجات السلة */}
              <section className="basket-products">
                <div className="basket-section-title">
                  <h2>الأجهزة المختارة</h2>
                  <span>{count} قطعة</span>
                </div>
                <div className="basket-items">
                  {items.map(({ product, qty }) => (
                    <CartItem
                      key={product._id}
                      product={product}
                      qty={qty}
                      onUpdateQty={updateQty}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
                <div className="basket-next-note">
                  <ReceiptText size={20} />
                  <div>
                    <strong>قسّط جهازك بسعر الكاش بدون أي فوائد</strong>
                  </div>
                </div>
              </section>

              {/* زر الانتقال للدفع */}
              <button
                onClick={() => router.push("/payment-method")}
                className="basket-primary w-full flex items-center justify-center gap-2"
              >
                اختيار طريقة التقسيط
                <ArrowLeft size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
