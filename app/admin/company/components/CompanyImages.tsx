"use client";
import React, { memo, useRef } from "react";
import { imageFields } from "../constants";
import type { CompanyData, CompanyImageFieldDefinition } from "../types";

interface CompanyImagesProps {
  data: CompanyData;
  uploadingKey: string | null;
  deletingKey: string | null;
  onImageChange: (key: string, file: File) => void;
  onImageDelete: (key: string) => void;
}

const SingleImageCard = memo(function SingleImageCard({
  field,
  url,
  isUploading,
  isDeleting,
  onImageChange,
  onImageDelete,
}: {
  field: CompanyImageFieldDefinition;
  url: string;
  isUploading: boolean;
  isDeleting: boolean;
  onImageChange: (key: string, file: File) => void;
  onImageDelete: (key: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange(field.key, file);
    }
    // Reset file input value so user can upload the same file again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between hover:border-gray-300 transition shadow-sm">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-gray-800">{field.label}</h3>
          {url ? (
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              مرفوع
            </span>
          ) : (
            <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              غير محدد
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-3">{field.description}</p>
      </div>

      {/* Preview Area */}
      <div className="relative w-full h-32 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden mb-3 group">
        {isUploading ? (
          <div className="flex flex-col items-center justify-center text-blue-600 gap-2">
            <svg
              className="animate-spin h-7 w-7 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span className="text-xs font-semibold">جاري الرفع...</span>
          </div>
        ) : isDeleting ? (
          <div className="flex flex-col items-center justify-center text-red-600 gap-2">
            <svg
              className="animate-spin h-7 w-7 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span className="text-xs font-semibold">جاري الحذف...</span>
          </div>
        ) : url ? (
          <>
            <img
              src={url}
              alt={field.label}
              className="max-h-full max-w-full object-contain p-2 transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/90 hover:bg-white text-gray-800 p-1.5 rounded-lg text-xs font-medium shadow transition"
                title="عرض بالحجم الكامل"
              >
                🔍 عرض
              </a>
              <button
                type="button"
                onClick={() => onImageDelete(field.key)}
                className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg text-xs font-medium shadow transition"
                title="حذف الصورة"
              >
                🗑️ حذف
              </button>
            </div>
          </>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:text-blue-600 transition"
          >
            <span className="text-2xl mb-1">📁</span>
            <span className="text-xs font-medium">انقر لاختيار ملف</span>
            <span className="text-[10px] text-gray-400 mt-0.5">حد أقصى 5MB</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/svg+xml"
          onChange={handleFileSelected}
          className="hidden"
          disabled={isUploading || isDeleting}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isDeleting}
          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-xs sm:text-sm py-2 px-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <span>⬆️</span>
          <span>{url ? "تغيير الصورة" : "رفع صورة"}</span>
        </button>

        {url && !isUploading && !isDeleting && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`هل أنت متأكد من حذف ${field.label}؟`)) {
                onImageDelete(field.key);
              }
            }}
            className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition text-xs sm:text-sm"
            title="حذف الصورة"
          >
            🗑️
          </button>
        )}
      </div>
      {field.aspectHint && (
        <span className="text-[10px] text-gray-400 mt-2 block text-center">
          {field.aspectHint}
        </span>
      )}
    </div>
  );
});

function CompanyImagesComponent({
  data,
  uploadingKey,
  deletingKey,
  onImageChange,
  onImageDelete,
}: CompanyImagesProps) {
  return (
    <div className="bg-gray-50/60 border border-gray-100 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200/70 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🖼️</span>
          <h2 className="text-sm sm:text-base font-bold text-gray-800">
            الشعارات والأختام الرسمية
          </h2>
        </div>
        <span className="text-xs text-gray-500 bg-white px-2.5 py-1 rounded-md border border-gray-200">
          يتم حفظ ورفع الصور مباشرة إلى السحابة (Cloudinary)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {imageFields.map((field) => (
          <SingleImageCard
            key={field.key}
            field={field}
            url={data[field.key] || ""}
            isUploading={uploadingKey === field.key}
            isDeleting={deletingKey === field.key}
            onImageChange={onImageChange}
            onImageDelete={onImageDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(CompanyImagesComponent);
