"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  User, Phone, IdCard, CheckCircle2, ArrowLeft, MapPin,
} from "lucide-react";
import type { CustomerInfo } from "../../store/cartStore";
import type { MapAddressData } from "./AddressMap";

const AddressMapPicker = dynamic(() => import("./AddressMap"), { ssr: false });

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

interface CustomerFormProps {
  total: number;
  itemCount: number;
  initialData?: CustomerInfo | null;
  onSubmit: (info: Omit<CustomerInfo, "installmentType" | "months" | "downPayment">) => void;
}

export default function CustomerForm({
  total,
  initialData,
  onSubmit,
}: CustomerFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [nationalId, setNationalId] = useState(initialData?.nationalId ?? "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [addressDetails, setAddressDetails] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mapAddressData, setMapAddressData] = useState<MapAddressData | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleAddressSelect = (data: MapAddressData) => {
    setMapAddressData(data);
    const base = data.formattedAddress || data.address;
    const full = addressDetails.trim() ? `${base} - ${addressDetails.trim()}` : base;
    setAddress(full);
    setErrors((p) => ({ ...p, address: "" }));
  };

  const handleAddressDetailsChange = (v: string) => {
    setAddressDetails(v);
    if (mapAddressData) {
      const base = mapAddressData.formattedAddress || mapAddressData.address;
      setAddress(v.trim() ? `${base} - ${v.trim()}` : base);
    }
  };

  const handleSubmit = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "الاسم مطلوب";
    if (!nationalId.trim()) e.nationalId = "رقم الهوية مطلوب";
    else if (!/^[12]\d{9}$/.test(nationalId.trim()))
      e.nationalId = "هوية سعودية: 10 أرقام تبدأ بـ 1 أو 2";
    if (!whatsapp.trim()) e.whatsapp = "رقم الواتساب مطلوب";
    else if (!/^05\d{8}$/.test(whatsapp.trim()))
      e.whatsapp = "يبدأ بـ 05 ويتكون من 10 أرقام";
    if (!address.trim()) e.address = "يرجى تحديد موقعك أو كتابة العنوان";
    setErrors(e);
    if (Object.keys(e).length) {
      const firstKey = Object.keys(e)[0];
      const el = formRef.current?.querySelector(
        `[data-field="${firstKey}"]`
      ) as HTMLElement | null;
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
      return;
    }
    onSubmit({ name, nationalId, whatsapp, address });
  };

  const allDone =
    name.trim() && nationalId.trim() && whatsapp.trim() && address.trim() &&
    !errors.name && !errors.nationalId && !errors.whatsapp && !errors.address;

  return (
    <div
      ref={formRef}
      className="bg-white rounded-2xl sm:rounded-3xl border border-[#dce8eb] overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 sm:p-6 lg:p-7">
        <div className="flex items-center gap-2.5 sm:gap-3 mb-5 sm:mb-6">
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
            allDone ? "bg-emerald-500" : "bg-gradient-to-br from-[#e4f3f6] to-[#d3eaf0]"
          }`}>
            {allDone
              ? <CheckCircle2 size={16} className="text-white" />
              : <span className="text-[#053132] text-xs sm:text-sm font-black">1</span>}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-[#173e48]">معلوماتك</h3>
            <p className="text-[10px] sm:text-[11px] text-[#657e86] mt-0.5">
              الاسم والهوية والتواصل والموقع
            </p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <FloatingInput
            fieldName="name"
            label="الاسم الكامل"
            icon={<User size={15} />}
            value={name}
            error={errors.name}
            placeholder="محمد أحمد العلي"
            onChange={(v) => {
              setName(v.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, ""));
              setErrors((p) => ({ ...p, name: "" }));
            }}
          />
          <FloatingInput
            fieldName="nationalId"
            label="رقم الهوية / الإقامة"
            icon={<IdCard size={15} />}
            value={nationalId}
            error={errors.nationalId}
            placeholder="1XXXXXXXXX"
            maxLength={10}
            inputMode="numeric"
            onChange={(v) => {
              setNationalId(v.replace(/\D/g, "").slice(0, 10));
              setErrors((p) => ({ ...p, nationalId: "" }));
            }}
          />
          <FloatingInput
            fieldName="whatsapp"
            label="رقم الواتساب"
            icon={<Phone size={15} />}
            value={whatsapp}
            error={errors.whatsapp}
            placeholder="05XXXXXXXX"
            maxLength={10}
            inputMode="numeric"
            dir="ltr"
            onChange={(v) => {
              setWhatsapp(v.replace(/\D/g, "").slice(0, 10));
              setErrors((p) => ({ ...p, whatsapp: "" }));
            }}
          />
        </div>

        {/* Address Map */}
        <div className="mt-3 sm:mt-4" data-field="address">
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin size={14} className="text-[#65E0CD]" />
            <span className="text-[10px] sm:text-[11px] font-bold text-[#52717a]">
              عنوان التوصيل
            </span>
            {errors.address && (
              <span className="text-red-500 text-[10px] mr-auto">⚠ {errors.address}</span>
            )}
          </div>
          <AddressMapPicker
            onSelect={handleAddressSelect}
            initialAddress={address}
          />
          {mapAddressData && (
            <input
              value={addressDetails}
              onChange={(e) => handleAddressDetailsChange(e.target.value)}
              placeholder="تفاصيل إضافية: رقم الشقة، الدور..."
              className="mt-2 w-full px-3 py-2 text-xs border border-[#dce8eb] rounded-xl focus:outline-none focus:border-[#65E0CD] transition"
            />
          )}
          {address && !errors.address && (
            <p className="mt-1.5 text-[10px] text-[#52717a] leading-relaxed truncate">
              📍 {address}
            </p>
          )}
        </div>

        {/* Total */}
        <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-[#dce8eb] flex items-center justify-between">
          <span className="text-xs sm:text-sm text-[#657e86]">إجمالي الأجهزة</span>
          <span className="text-base sm:text-xl font-black text-[#173e48] flex items-center gap-1">
            {fmt(total)} <SAR className="w-6 h-6 sm:w-7 sm:h-7" />
          </span>
        </div>
      </div>

      {/* Submit */}
      <div className="px-4 sm:px-6 lg:px-7 pb-5 sm:pb-6 lg:pb-7">
        <button
          onClick={handleSubmit}
          className="w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-sm sm:text-base font-black transition hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#65E0CD,#1B7174)", color: "#053132" }}
        >
          التالي — اختر طريقة الدفع
          <ArrowLeft size={16} />
        </button>
      </div>
    </div>
  );
}

/* ── Floating Input ── */
function FloatingInput({
  fieldName, label, icon, value, error, placeholder,
  maxLength, inputMode, dir, onChange,
}: {
  fieldName: string; label: string; icon: React.ReactNode;
  value: string; error?: string; placeholder?: string;
  maxLength?: number; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  dir?: string; onChange: (v: string) => void;
}) {
  return (
    <div data-field={fieldName}>
      <label className="block text-[10px] sm:text-[11px] font-bold text-[#52717a] mb-1 sm:mb-1.5 flex items-center gap-1">
        <span className="text-[#65E0CD]">{icon}</span>
        {label}
        {error && <span className="text-red-500 mr-auto text-[10px]">⚠ {error}</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        dir={dir}
        className={`w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border-2 transition focus:outline-none bg-[#f3f7f8] ${
          error
            ? "border-red-300 bg-red-50"
            : "border-transparent focus:border-[#65E0CD] focus:bg-white"
        } text-[#173e48]`}
      />
    </div>
  );
}
