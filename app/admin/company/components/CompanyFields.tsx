"use client";
import React, { memo } from "react";
import { basicFields, contactFields, operationalFields, paymentOptions } from "../constants";
import type { CompanyData, CompanyFieldDefinition } from "../types";

interface CompanyFieldsProps {
  data: CompanyData;
  onChange: (key: keyof CompanyData, value: string) => void;
}

const inputClass =
  "w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition duration-150";

const SingleField = memo(function SingleField({
  field,
  value,
  onChange,
}: {
  field: CompanyFieldDefinition;
  value: string;
  onChange: (k: keyof CompanyData, v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs sm:text-sm font-semibold text-gray-700">
        {field.label}
      </label>
      <input
        type={field.type || "text"}
        value={value || ""}
        placeholder={field.placeholder}
        dir={field.dir}
        onChange={(e) => onChange(field.key, e.target.value)}
        className={inputClass}
      />
    </div>
  );
});

const SectionCard = memo(function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50/60 border border-gray-100 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-gray-200/70 pb-2.5">
        <span className="text-lg">{icon}</span>
        <h2 className="text-sm sm:text-base font-bold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
});

function CompanyFieldsComponent({ data, onChange }: CompanyFieldsProps) {
  return (
    <div className="space-y-6">
      {/* 1. Basic Info */}
      <SectionCard title="المعلومات الأساسية والعملة" icon="🏢">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {basicFields.map((field) => (
            <SingleField
              key={field.key}
              field={field}
              value={data[field.key] || ""}
              onChange={onChange}
            />
          ))}
        </div>
      </SectionCard>

      {/* 2. Contact Information */}
      <SectionCard title="بيانات التواصل والموقع الإلكتروني" icon="📞">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contactFields.map((field) => (
            <SingleField
              key={field.key}
              field={field}
              value={data[field.key] || ""}
              onChange={onChange}
            />
          ))}
        </div>
      </SectionCard>

      {/* 3. Operational, Shipping & Payment */}
      <SectionCard title="العناوين والشحن والدفع والضرائب" icon="🚚">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {operationalFields.map((field) => (
            <SingleField
              key={field.key}
              field={field}
              value={data[field.key] || ""}
              onChange={onChange}
            />
          ))}

          {/* Payment Method Selector */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700">
              طريقة الدفع الافتراضية
            </label>
            <select
              value={data.paymentMethod || ""}
              onChange={(e) => onChange("paymentMethod", e.target.value)}
              className={inputClass}
            >
              {paymentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
              {/* Support custom value if not in standard list */}
              {data.paymentMethod &&
                !paymentOptions.some((o) => o.value === data.paymentMethod) && (
                  <option value={data.paymentMethod}>{data.paymentMethod}</option>
                )}
            </select>
          </div>
        </div>
      </SectionCard>

      {/* 4. Details / Notes */}
      <SectionCard title="ملاحظات وتفاصيل إضافية (تظهر في المستندات)" icon="📝">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-semibold text-gray-700">
            تفاصيل إضافية أو شروط الخدمة المختصرة
          </label>
          <textarea
            value={data.details || ""}
            onChange={(e) => onChange("details", e.target.value)}
            rows={3}
            placeholder="أدخل أي ملاحظات أو شروط تظهر أسفل الفواتير ومستندات الشركة..."
            className={inputClass}
          />
        </div>
      </SectionCard>
    </div>
  );
}

export default memo(CompanyFieldsComponent);
