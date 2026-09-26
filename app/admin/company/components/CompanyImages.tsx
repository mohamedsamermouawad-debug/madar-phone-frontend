"use client";
import React, { memo, useRef } from "react";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Eye,
  Loader2,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between hover:border-purple-300/80 hover:shadow-sm transition duration-150">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-1">{field.label}</h3>
          {url ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>مرفوع</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
              <AlertCircle className="w-3 h-3 text-gray-400" />
              <span>غير محدد</span>
            </span>
          )}
        </div>
        <p className="text-[11px] sm:text-xs text-gray-500 mb-3 min-h-[32px] line-clamp-2">
          {field.description}
        </p>
      </div>

      {/* Preview Area */}
      <div className="relative w-full h-32 sm:h-36 bg-gray-50/80 border border-dashed border-gray-300/80 rounded-xl flex items-center justify-center overflow-hidden mb-3 group">
        {isUploading ? (
          <div className="flex flex-col items-center justify-center text-purple-600 gap-1.5 p-2">
            <Loader2 className="animate-spin h-6 w-6 text-purple-600" />
            <span className="text-xs font-semibold">جاري الرفع...</span>
          </div>
        ) : isDeleting ? (
          <div className="flex flex-col items-center justify-center text-red-600 gap-1.5 p-2">
            <Loader2 className="animate-spin h-6 w-6 text-red-600" />
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
            {/* Desktop Quick Actions Overlay */}
            <div className="hidden sm:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/95 hover:bg-white text-gray-800 p-2 rounded-lg text-xs font-semibold shadow transition flex items-center gap-1"
                title="عرض بالحجم الكامل"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>عرض</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`هل أنت متأكد من حذف ${field.label}؟`)) {
                    onImageDelete(field.key);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg text-xs font-semibold shadow transition flex items-center gap-1"
                title="حذف الصورة"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف</span>
              </button>
            </div>
          </>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:text-purple-600 transition p-2 text-center"
          >
            <CloudUpload className="w-7 h-7 sm:w-8 sm:h-8 mb-1 text-gray-400 group-hover:text-purple-500 transition" />
            <span className="text-xs font-medium">انقر لاختيار ملف</span>
            <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WebP (حد أقصى 5MB)</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
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
          className="flex-1 bg-purple-50 hover:bg-purple-100 active:bg-purple-200 text-purple-700 font-semibold text-xs py-2.5 px-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Upload className="w-3.5 h-3.5 shrink-0" />
          <span>{url ? "تغيير الصورة" : "رفع صورة"}</span>
        </button>

        {url && !isUploading && !isDeleting && (
          <>
            {/* View on Mobile */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-xl transition flex items-center justify-center"
              title="عرض الصورة"
            >
              <Eye className="w-4 h-4" />
            </a>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`هل أنت متأكد من حذف ${field.label}؟`)) {
                  onImageDelete(field.key);
                }
              }}
              className="bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 p-2.5 rounded-xl transition flex items-center justify-center"
              title="حذف الصورة"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {field.aspectHint && (
        <span className="text-[10px] text-gray-400 mt-2 block text-center leading-tight">
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
    <div className="bg-gray-50/80 border border-gray-100 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200/70 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-100/80 text-purple-700 flex items-center justify-center shrink-0">
            <ImageIcon className="w-4 h-4" />
          </div>
          <h2 className="text-xs sm:text-base font-bold text-gray-800">
            الشعارات والأختام الرسمية
          </h2>
        </div>
        <span className="text-[11px] sm:text-xs text-gray-500 bg-white px-2.5 py-1 rounded-lg border border-gray-200/80 self-start sm:self-auto">
          يتم حفظ ورفع الصور مباشرة إلى السحابة
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
