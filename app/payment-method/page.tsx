"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Wallet,
  Calendar,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { useCartStore } from "../store/cartStore";
import "../cart/cart.css";

const fmt = (n: number) => n.toLocaleString("en-US");

function SAR() {
  return (
    <Image
      src="/money-icon.webp"
      alt="ر.س"
      width={26}
      height={26}
      className="inline-block align-middle"
    />
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: number;
  onChange: (v: string) => void;
  options: { value: number; label: string }[];
}) {
  return (
    <div>
      <label className="block text-[10px] sm:text-[11px] font-bold text-[#52717a] mb-1 sm:mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          aria-label={label}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-[#f3f7f8] border-2 border-transparent rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-[#173e48] focus:outline-none focus:border-[#65E0CD] focus:bg-white cursor-pointer transition-all"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-white text-[#173e48]">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-[#92a4aa] pointer-events-none"
        />
      </div>
    </div>
  );
}

export default function PaymentMethodPage() {
  const router = useRouter();
  const { items, customer, totalPrice, totalItems, setCustomer } = useCartStore();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const total = mounted ? totalPrice() : 0;
  const itemCount = mounted ? totalItems() : 0;

  // خيارات الأشهر: 3، 6، 9، 12، 18، 24 — أو حسب الحد الأقصى للمنتج
  const maxMonths = mounted
    ? Math.max(...items.map((i) => (i.product as { installment?: { months?: number } }).installment?.months ?? 0)) || 24
    : 24;
  const MONTHS_OPTIONS = [3, 6, 9, 12, 18, 24].filter((m) => m <= maxMonths);
  if (!MONTHS_OPTIONS.includes(maxMonths)) MONTHS_OPTIONS.push(maxMonths);

  // الدفعة الأولى: 1000، 1500، 2000 ثابتة
  const DOWN_PAYMENT_OPTIONS = [1000, 1500, 2000];

  const [installmentType, setInstallmentType] = useState<"full" | "installment">(
    customer?.installmentType ?? "installment"
  );
  const [months, setMonths] = useState(() => {
    const saved = customer?.months ?? 0;
    const valid = MONTHS_OPTIONS.includes(saved) ? saved : MONTHS_OPTIONS[MONTHS_OPTIONS.length - 1];
    return valid;
  });
  const [downPayment, setDownPayment] = useState(() => {
    const saved = customer?.downPayment ?? 0;
    return DOWN_PAYMENT_OPTIONS.includes(saved) ? saved : DOWN_PAYMENT_OPTIONS[0];
  });

  const monthlyPayment = useMemo(() => {
    if (installmentType === "full" || months <= 0) return 0;
    const remaining = total - downPayment;
    return remaining > 0 ? Math.ceil(remaining / months) : 0;
  }, [total, months, installmentType, downPayment]);

  // الجدول: كل الدفعات بنفس القيمة — آخر دفعة تأخذ الباقي بالظبط
  const schedule = useMemo(() => {
    if (installmentType === "full" || months <= 0) return [];
    const remaining = total - downPayment;
    if (remaining <= 0) return [];
    const base = Math.floor(remaining / months);
    const lastAmount = remaining - base * (months - 1);
    const now = new Date();
    return Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i + 1, now.getDate());
      return {
        index: i + 1,
        date: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
        amount: i === months - 1 ? lastAmount : base,
      };
    });
  }, [months, total, downPayment, installmentType]);

  if (!mounted) return <main className="basket-page" aria-busy="true" />;

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const handleNext = () => {
    setCustomer({
      name: customer?.name ?? "",
      nationalId: customer?.nationalId ?? "",
      whatsapp: customer?.whatsapp ?? "",
      address: customer?.address ?? "",
      installmentType,
      months,
      downPayment,
    });
    router.push("/checkout");
  };

  return (
    <main className="basket-page" dir="rtl">
      <div className="basket-shell">

        {/* Back */}
        <Link href="/cart" className="basket-back">
          <ArrowRight size={15} />
          سلة المشتريات
        </Link>

        {/* Heading */}
        <div className="basket-heading">
          <div>
            <span className="basket-eyebrow">الخطوة الثانية</span>
            <h1>طريقة السداد</h1>
            <p>اختر بين الدفع الكامل أو التقسيط الشهري بدون فوائد.</p>
          </div>
          <span className="basket-heading-icon">
            <Wallet size={25} />
          </span>
        </div>

        {/* Card */}
        <div className="basket-products">

          {/* Toggle */}
          <div className="flex rounded-xl overflow-hidden border-2 border-[#dce8eb] mb-5">
            <button
              type="button"
              onClick={() => setInstallmentType("full")}
              className="flex-1 py-3 text-sm font-bold transition-all flex items-center justify-center gap-1.5"
              style={{
                backgroundColor: installmentType === "full" ? "#e4f3f6" : "#fff",
                color: installmentType === "full" ? "#173e48" : "#92a4aa",
              }}
            >
              {installmentType === "full" && <CheckCircle2 size={14} className="text-[#65E0CD]" />}
              دفع كامل
            </button>
            <button
              type="button"
              onClick={() => setInstallmentType("installment")}
              className="flex-1 py-3 text-sm font-bold transition-all flex items-center justify-center gap-1.5"
              style={{
                backgroundColor: installmentType === "installment" ? "#e4f3f6" : "#fff",
                color: installmentType === "installment" ? "#173e48" : "#92a4aa",
              }}
            >
              {installmentType === "installment" && <CheckCircle2 size={14} className="text-[#65E0CD]" />}
              تقسيط شهري
            </button>
          </div>

          {/* Full payment summary */}
          {installmentType === "full" && (
            <div className="rounded-xl p-4 text-center bg-[#f3f7f8] border border-[#dce8eb]">
              <p className="text-[11px] text-[#52717a] mb-1.5">إجمالي المبلغ</p>
              <p className="text-3xl font-black text-[#173e48] flex items-center justify-center gap-2">
                {fmt(total)} <SAR />
              </p>
              <p className="text-[10px] text-[#92a4aa] mt-2">يُدفع دفعة واحدة عند التسليم</p>
            </div>
          )}

          {/* Installment options */}
          {installmentType === "installment" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="عدد الأشهر"
                  value={months}
                  onChange={(v) => setMonths(Number(v))}
                  options={MONTHS_OPTIONS.map((m) => ({ value: m, label: `${m} شهر` }))}
                />
                <SelectField
                  label="الدفعة الأولى"
                  value={downPayment}
                  onChange={(v) => setDownPayment(Number(v))}
                  options={DOWN_PAYMENT_OPTIONS.map((v) => ({ value: v, label: `${fmt(v)} ر.س` }))}
                />
              </div>

              {/* Monthly highlight */}
              <div
                className="rounded-xl p-4 text-center"
                style={{
                  background: "linear-gradient(135deg, #e4f3f6, #d3eaf0)",
                  border: "1.5px solid #b3dce5",
                }}
              >
                <p className="text-[10px] font-medium text-[#52717a] mb-1">القسط الشهري</p>
                <p className="text-2xl sm:text-3xl font-black text-[#173e48] flex items-center justify-center gap-2">
                  {fmt(monthlyPayment)} <SAR />
                </p>
                <p className="text-[10px] text-[#52717a] mt-1.5">
                  {months} دفعة · دفعة أولى {fmt(downPayment)} ر.س
                </p>
              </div>

              {/* Schedule */}
              {months > 0 && (
                <div className="rounded-xl overflow-hidden border border-[#dce8eb]">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f3f7f8] border-b border-[#dce8eb]">
                    <Calendar size={13} className="text-[#65E0CD]" />
                    <span className="text-xs font-bold text-[#173e48]">جدول السداد</span>
                    <span className="text-[10px] text-[#92a4aa] mr-auto">{months} دفعة</span>
                  </div>
                  <div className="max-h-52 overflow-y-auto">
                    {schedule.map((row, i) => (
                      <div
                        key={row.index}
                        className="flex items-center justify-between px-4 py-2.5 text-xs border-b border-[#f0f5f6] last:border-0"
                        style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f9fbfb" }}
                      >
                        <span className="font-bold w-6 text-[#65E0CD]">{row.index}</span>
                        <span className="text-[#52717a]">{row.date}</span>
                        <span className="font-black text-[#173e48] flex items-center gap-1">
                          {fmt(row.amount)} <SAR />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5">
          <button
            onClick={handleNext}
            className="basket-primary w-full mt-0 rounded-xl flex items-center justify-center gap-2"
          >
            التالي — إتمام الطلب
            <ArrowLeft size={16} />
          </button>
        </div>

      </div>
    </main>
  );
}
