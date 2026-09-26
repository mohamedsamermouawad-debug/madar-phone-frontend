"use client";
import React from "react";
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
      <div className="pt-2 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 border border-gray-100">
          <div className="h-40 bg-gray-100 rounded-xl"></div>
          <div className="h-40 bg-gray-100 rounded-xl"></div>
          <div className="h-40 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            إعدادات الشركة والمتجر
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            إدارة الهوية التجارية، العناوين، معلومات التواصل، والأختام الرسمية للفواتير
          </p>
        </div>

        {/* Action Status Bar */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isDirty ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full animate-bounce">
              <span>⚠️</span>
              <span>يوجد تغييرات غير محفوظة</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <span>✓</span>
              <span>جميع البيانات محدثة</span>
            </span>
          )}

          <button
            type="button"
            onClick={refetch}
            className="text-gray-500 hover:text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 p-2 rounded-lg text-xs font-medium transition shadow-sm"
            title="إعادة تحميل البيانات من السيرفر"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 sm:p-7 space-y-8">
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

        {/* Bottom Save Bar */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border shadow-lg z-20">
          <div className="text-xs text-gray-500 text-center sm:text-right">
            {isDirty ? (
              <span className="text-amber-600 font-medium">
                تذكر حفظ البيانات لتطبيقها مباشرة في واجهة المتجر وفواتير الطلبات.
              </span>
            ) : (
              <span>تم حفظ آخر التعديلات بنجاح.</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isDirty && (
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold text-sm transition disabled:opacity-50"
              >
                تراجع
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !isDirty}
              className={`w-full sm:w-auto min-w-[160px] text-white font-bold py-2.5 px-6 rounded-lg transition text-sm flex items-center justify-center gap-2 shadow-md ${
                isDirty
                  ? "bg-blue-600 hover:bg-blue-700 active:scale-95"
                  : "bg-gray-400 cursor-not-allowed opacity-75"
              }`}
            >
              {saving ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>حفظ التعديلات</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
