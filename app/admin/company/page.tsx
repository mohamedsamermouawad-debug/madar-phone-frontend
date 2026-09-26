"use client";
import React from "react";
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  RotateCw,
  RotateCcw,
  Save,
  Loader2,
} from "lucide-react";
import { useCompany } from "./hooks/useCompany";
import CompanyFields from "./components/CompanyFields";
import CompanyImages from "./components/CompanyImages";

export default function CompanyPage() {
  const {
    data,
    loading,
    saving,
    isDirty,
    uploadingKey,
    deletingKey,
    handleChange,
    handleImageChange,
    handleImageDelete,
    handleSave,
    handleReset,
    refetch,
  } = useCompany();

  if (loading) {
    return (
      <div className="pt-1 max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-pulse" dir="rtl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded-lg w-40 sm:w-56"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-60 sm:w-80"></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 space-y-4 border border-gray-100">
          <div className="h-32 sm:h-40 bg-gray-100 rounded-xl"></div>
          <div className="h-32 sm:h-40 bg-gray-100 rounded-xl"></div>
          <div className="h-32 sm:h-40 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-1 max-w-5xl mx-auto pb-24 sm:pb-16" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 mb-4 sm:mb-6">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 sm:p-3 rounded-xl bg-purple-100/80 text-purple-700 shrink-0 shadow-sm">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-2xl font-bold text-gray-900 leading-tight">
              إعدادات الشركة والمتجر
            </h1>
            <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 mt-0.5">
              إدارة الهوية التجارية، العناوين، معلومات التواصل، والأختام الرسمية للفواتير
            </p>
          </div>
        </div>

        {/* Action Status Bar */}
        <div className="flex items-center gap-2 justify-between sm:justify-end w-full sm:w-auto">
          {isDirty ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 sm:px-3 py-1.5 rounded-full animate-pulse shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>يوجد تغييرات غير محفوظة</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 sm:px-3 py-1.5 rounded-full shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span>جميع البيانات محدثة</span>
            </span>
          )}

          <button
            type="button"
            onClick={refetch}
            className="flex items-center gap-1.5 text-gray-600 hover:text-purple-700 bg-white border border-gray-200 hover:bg-purple-50/50 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium transition shadow-sm active:scale-95"
            title="إعادة تحميل البيانات من السيرفر"
          >
            <RotateCw className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/80 p-3.5 sm:p-6 md:p-7 space-y-5 sm:space-y-8">
        {/* Form Fields Component */}
        <CompanyFields data={data} onChange={handleChange} />

        {/* Brand Images & Stamps Component */}
        <CompanyImages
          data={data}
          uploadingKey={uploadingKey}
          deletingKey={deletingKey}
          onImageChange={handleImageChange}
          onImageDelete={handleImageDelete}
        />

        {/* Bottom Save Bar (Sticky & Mobile Responsive) */}
        <div className="sticky bottom-3 sm:bottom-4 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 shadow-xl z-20 transition-all">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-center sm:text-right w-full sm:w-auto">
              {isDirty ? (
                <span className="text-amber-700 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>تذكر حفظ التعديلات لتطبيقها مباشرة في المتجر والفواتير.</span>
                </span>
              ) : (
                <span className="text-gray-500 flex items-center justify-center sm:justify-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>تم حفظ آخر التعديلات بنجاح.</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {isDirty && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={saving}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 font-semibold text-xs sm:text-sm transition disabled:opacity-50 shadow-sm"
                >
                  <RotateCcw className="w-4 h-4 shrink-0 text-gray-500" />
                  <span>تراجع</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !isDirty}
                className={`flex-1 sm:flex-initial min-w-0 sm:min-w-[170px] text-white font-bold py-2.5 px-4 sm:px-6 rounded-xl transition text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md ${
                  isDirty
                    ? "bg-purple-600 hover:bg-purple-700 active:scale-95 shadow-purple-200"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 shrink-0" />
                    <span>حفظ التعديلات</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
