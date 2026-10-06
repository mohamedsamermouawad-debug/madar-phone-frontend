"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Lock, CreditCard, Clock } from "lucide-react";
import { normalizeDigits, isValidLuhn, validateExpiry, validateCvv } from "./cardValidation";

interface CheckoutPaymentProps {
  shippingConfirmed: boolean;
  selectedPayment: "mada" | "mastercard" | "applepay" | null;
  setSelectedPayment: (v: "mada" | "mastercard" | "applepay" | null) => void;
  cardNumber: string; setCardNumber: (v: string) => void;
  cardExpiry: string; setCardExpiry: (v: string) => void;
  cardCvv: string; setCardCvv: (v: string) => void;
  cardHolder: string; setCardHolder: (v: string) => void;
  cardNumberError: string; setCardNumberError: (v: string) => void;
  cardExpiryError: string; setCardExpiryError: (v: string) => void;
  cardCvvError?: string; setCardCvvError?: (v: string) => void;
  cardHolderError?: string; setCardHolderError?: (v: string) => void;
  loading: boolean; blocked: boolean; fmtTime: string;
  onCardSubmit: () => void;
  submitLabel?: string;
}

export default function CheckoutPayment({
  shippingConfirmed, selectedPayment, setSelectedPayment,
  cardNumber, setCardNumber, cardExpiry, setCardExpiry,
  cardCvv, setCardCvv, cardHolder, setCardHolder,
  cardNumberError, setCardNumberError, cardExpiryError, setCardExpiryError,
  cardCvvError = "", setCardCvvError,
  cardHolderError = "", setCardHolderError,
  loading, blocked, fmtTime, onCardSubmit, submitLabel,
}: CheckoutPaymentProps) {
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const cardExpiryRef = useRef<HTMLInputElement>(null);
  const cardCvvRef = useRef<HTMLInputElement>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const markLoaded = (key: string) => setLoadedImages(p => ({ ...p, [key]: true }));

  useEffect(() => {
    if (shippingConfirmed && !selectedPayment) setSelectedPayment("mada");
  }, [shippingConfirmed, selectedPayment, setSelectedPayment]);

  const paymentLabel = selectedPayment === "mada" ? "مدى" : selectedPayment === "mastercard" ? "بطاقة ائتمانية" : selectedPayment === "applepay" ? "Apple Pay" : "مدى أو بطاقة ائتمانية";

  const cleanCard = normalizeDigits(cardNumber).replace(/\D/g, "");
  const cleanExpiry = normalizeDigits(cardExpiry).replace(/\D/g, "");
  const cleanCvv = normalizeDigits(cardCvv).replace(/\D/g, "");
  const expiryCheck = validateExpiry(cleanExpiry);

  const isFormValid =
    cleanCard.length === 16 &&
    isValidLuhn(cleanCard) &&
    cleanExpiry.length === 4 &&
    expiryCheck.valid &&
    cleanCvv.length === 3 &&
    cardHolder.trim().length > 0 &&
    !cardNumberError &&
    !cardExpiryError &&
    !cardCvvError &&
    !cardHolderError;

  if (!shippingConfirmed) return (
    <div className="px-4 sm:px-6 py-5">
      <div className="flex items-center gap-2 mb-0.5">
        <CreditCard size={14} className="text-gray-500" />
        <p className="text-sm sm:text-base font-bold text-[#173e48]">الدفع</p>
      </div>
      <p className="text-xs sm:text-sm text-gray-400 mr-6">مدى أو بطاقة ائتمانية</p>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 py-5">
      <div className="flex items-center gap-2 mb-0.5">
        <CreditCard size={14} className="text-gray-500" />
        <p className="text-sm sm:text-base font-bold text-[#173e48]">الدفع</p>
      </div>
      <p className="text-xs sm:text-sm text-gray-400 mr-6">{paymentLabel}</p>

      <div className="flex gap-2 mt-4">
        {(["mada", "mastercard"] as const).map(method => (
          <button key={method} onClick={() => setSelectedPayment(method)}
            className="flex-1 flex items-center justify-center px-2 sm:px-7 py-2 sm:py-4 border-2 transition-all"
            style={{ borderColor: selectedPayment === method ? "#65E0CD" : "#e5e7eb", background: selectedPayment === method ? "#f0fdf9" : "#fff" }}>
            <div className="w-10 h-5 sm:w-16 sm:h-9 relative shrink-0">
              {!loadedImages[method] && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse rounded" />
              )}
              <Image
                src={method === "mada" ? "/mada.svg" : "/master.svg"}
                alt={method}
                fill
                priority
                onLoad={() => markLoaded(method)}
                className={`object-contain transition-opacity duration-300 ${loadedImages[method] ? "opacity-100" : "opacity-0"}`}
              />
            </div>
          </button>
        ))}
        <button onClick={() => setSelectedPayment(selectedPayment === "applepay" ? "mada" : "applepay")}
          className="flex-1 flex items-center justify-center px-2 sm:px-6 py-2 sm:py-4 border-2 transition-all"
          style={{ borderColor: selectedPayment === "applepay" ? "#173e48" : "#e5e7eb", background: selectedPayment === "applepay" ? "#f5f7fa" : "#fff" }}>
          <div className="w-14 h-7 sm:w-22 sm:h-12 relative shrink-0">
            {!loadedImages["applepay"] && (
              <div className="absolute inset-0 bg-gray-100 animate-pulse rounded" />
            )}
            <Image
              src="/Apple-Pay-01.png"
              alt="Apple Pay"
              fill
              priority
              onLoad={() => markLoaded("applepay")}
              className={`object-contain transition-opacity duration-300 ${loadedImages["applepay"] ? "opacity-100" : "opacity-0"}`}
            />
          </div>
        </button>
      </div>

      {selectedPayment === "applepay" && (
        <div className="mt-3 flex items-center gap-2.5 px-4 py-3 border border-gray-100 bg-gray-50">
          <div className="w-8 h-8 relative shrink-0">
            <Image src="/Apple-Pay-01.png" alt="Apple Pay" fill priority className="object-contain" />
          </div>
          <div>
            <p className="text-sm font-black text-[#173e48]">Apple Pay قريباً</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">نعمل على إضافة Apple Pay، ترقّب التحديثات! في الوقت الحالي يمكنك الدفع بمدى أو بطاقة ائتمانية.</p>
          </div>
        </div>
      )}

      {selectedPayment && selectedPayment !== "applepay" && (
        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs sm:text-sm font-bold text-gray-600 mb-2 block">بيانات البطاقة <span className="text-red-400">*</span></label>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col w-full gap-1">
                {/* Card Number */}
                <input
                  ref={cardNumberRef}
                  type="text"
                  inputMode="numeric"
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  dir="ltr"
                  value={cardNumber}
                  onChange={e => {
                    const digits = normalizeDigits(e.target.value).replace(/\D/g, "").slice(0, 16);
                    const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
                    setCardNumber(formatted);
                    
                    if (digits.length === 16) {
                      if (!isValidLuhn(digits)) {
                        setCardNumberError("رقم البطاقة غير صحيح (تحقق من صحة الرقم)");
                      } else {
                        setCardNumberError("");
                        setTimeout(() => {
                          cardExpiryRef.current?.focus();
                        }, 50);
                      }
                    } else {
                      setCardNumberError("");
                    }
                  }}
                  onBlur={e => {
                    const digits = normalizeDigits(e.target.value).replace(/\D/g, "");
                    if (digits.length === 0) {
                      setCardNumberError("");
                    } else if (digits.length < 16) {
                      setCardNumberError("رقم البطاقة يجب أن يكون 16 رقمًا");
                    } else if (!isValidLuhn(digits)) {
                      setCardNumberError("رقم البطاقة غير صحيح (تحقق من صحة الرقم)");
                    } else {
                      setCardNumberError("");
                    }
                  }}
                  className={`w-full px-3 py-3 text-sm sm:text-base font-mono border focus:outline-none focus:border-[#65E0CD] transition ${cardNumberError ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                />
                {cardNumberError && (
                  <p className="text-red-500 text-xs font-bold flex items-center gap-1">⚠ {cardNumberError}</p>
                )}

                {/* Expiry + CVV row */}
                <div className="flex gap-3">
                  <div className="flex flex-col flex-1 gap-1">
                    <input
                      ref={cardExpiryRef}
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/YY"
                      maxLength={5}
                      dir="ltr"
                      value={cardExpiry}
                      onChange={e => {
                        const digits = normalizeDigits(e.target.value).replace(/\D/g, "").slice(0, 4);
                        const formatted = digits.length >= 3
                          ? digits.slice(0, 2) + "/" + digits.slice(2)
                          : digits;
                        setCardExpiry(formatted);
                        setCardExpiryError("");

                        if (digits.length === 4) {
                          const check = validateExpiry(digits);
                          if (!check.valid) {
                            setCardExpiryError(check.error);
                          } else {
                            setCardExpiryError("");
                            setTimeout(() => {
                              cardCvvRef.current?.focus();
                            }, 50);
                          }
                        }
                      }}
                      onBlur={e => {
                        const digits = normalizeDigits(e.target.value).replace(/\D/g, "");
                        if (digits.length === 0) {
                          setCardExpiryError("");
                          return;
                        }
                        const check = validateExpiry(digits);
                        if (!check.valid) {
                          setCardExpiryError(check.error);
                        } else {
                          setCardExpiryError("");
                        }
                      }}
                      className={`w-full px-3 py-3 text-sm sm:text-base font-mono border focus:outline-none focus:border-[#65E0CD] transition text-center ${cardExpiryError ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                    />
                    {cardExpiryError && (
                      <p className="text-red-500 text-xs font-bold flex items-center gap-1">⚠ {cardExpiryError}</p>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 gap-1">
                    <input
                      ref={cardCvvRef}
                      type="password"
                      inputMode="numeric"
                      placeholder="CVV"
                      maxLength={3}
                      dir="ltr"
                      value={cardCvv}
                      onChange={e => {
                        const digits = normalizeDigits(e.target.value).replace(/\D/g, "").slice(0, 3);
                        setCardCvv(digits);
                        if (setCardCvvError) setCardCvvError("");
                      }}
                      onBlur={e => {
                        const digits = normalizeDigits(e.target.value).replace(/\D/g, "");
                        if (digits.length === 0) {
                          if (setCardCvvError) setCardCvvError("");
                          return;
                        }
                        const check = validateCvv(digits);
                        if (!check.valid && setCardCvvError) {
                          setCardCvvError(check.error);
                        } else if (setCardCvvError) {
                          setCardCvvError("");
                        }
                      }}
                      className={`w-full px-3 py-3 text-sm sm:text-base font-mono border focus:outline-none focus:border-[#65E0CD] transition text-center ${cardCvvError ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                    />
                    {cardCvvError && (
                      <p className="text-red-500 text-xs font-bold flex items-center gap-1">⚠ {cardCvvError}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col w-full gap-1">
                <label className="text-xs sm:text-sm font-bold text-gray-600 mb-2 block">اسم حامل البطاقة <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="AHMED MOHAMMED"
                  dir="ltr"
                  value={cardHolder}
                  onChange={e => {
                    setCardHolder(e.target.value.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, "").toUpperCase());
                    if (setCardHolderError) setCardHolderError("");
                  }}
                  onBlur={e => {
                    if (e.target.value.trim().length === 0 && setCardHolderError) {
                      setCardHolderError("يرجى إدخال اسم حامل البطاقة");
                    } else if (setCardHolderError) {
                      setCardHolderError("");
                    }
                  }}
                  className={`flex-1 px-3 py-3 text-sm sm:text-base border focus:border-[#65E0CD] focus:outline-none font-mono ${cardHolderError ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                />
                {cardHolderError && (
                  <p className="text-red-500 text-xs font-bold flex items-center gap-1">⚠ {cardHolderError}</p>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onCardSubmit}
            disabled={!isFormValid || loading || blocked}
            className="w-full py-4 text-white font-black text-base flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90 transition"
            style={{ background: blocked ? "#9ca3af" : "linear-gradient(135deg,#65E0CD,#1B7174)" }}>
            <Lock size={15} />
            {loading ? "جاري الإرسال..." : blocked ? (
              <span className="flex items-center gap-1.5"><Clock size={14} />يمكنك الطلب بعد {fmtTime}</span>
            ) : (submitLabel ?? "تأكيد الدفع الآن")}
          </button>

          {blocked && (
            <div className="flex items-start gap-2 px-3 py-2.5 border border-gray-200 bg-gray-50">
              <Clock size={14} className="text-gray-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-gray-800">لقد تجاوزت الحد المسموح به من الطلبات</p>
                <p className="text-xs text-gray-600 mt-0.5">يمكنك إرسال طلب جديد خلال <span className="font-black tabular-nums">{fmtTime}</span></p>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-gray-300 flex items-center justify-center gap-1">
            <Lock size={9} /> اتصال مشفّر وآمن · PCI DSS
          </p>
        </div>
      )}
    </div>
  );
}
