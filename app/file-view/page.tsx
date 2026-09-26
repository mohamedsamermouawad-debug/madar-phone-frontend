"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useState, useMemo, useEffect } from "react";
import {
  FiDownload,
  FiExternalLink,
  FiPrinter,
  FiArrowRight,
  FiFileText,
  FiImage,
  FiZoomIn,
  FiZoomOut,
  FiRotateCw,
  FiEye,
} from "react-icons/fi";

function FileViewer() {
  const params = useSearchParams();
  const url = params.get("url");

  const proxyUrl = url ? `/api/file-proxy?url=${encodeURIComponent(url)}` : "";

  useEffect(() => {
    if (proxyUrl) {
      window.location.replace(proxyUrl);
    }
  }, [proxyUrl]);

  const [viewerMode, setViewerMode] = useState<"proxy" | "google">("proxy");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const isImage = useMemo(() => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
      lower.endsWith(".png") ||
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".webp") ||
      lower.endsWith(".svg") ||
      lower.endsWith(".gif")
    );
  }, [url]);

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4" dir="rtl">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto">
            <FiFileText size={32} />
          </div>
          <h2 className="text-xl font-bold">لا يوجد ملف لعرضه</h2>
          <p className="text-slate-400 text-sm">الرابط المطلوب غير متوفر أو تم حذفه</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition"
          >
            <FiArrowRight size={16} />
            العودة للمتجر
          </Link>
        </div>
      </div>
    );
  }

  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950 text-white overflow-hidden select-none" dir="rtl">
      {/* Top Header */}
      <header className="shrink-0 bg-[#053132] border-b border-teal-900/50 px-4 py-3 flex items-center justify-between gap-3 shadow-md z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition shrink-0"
            title="العودة للرئيسية"
          >
            <FiArrowRight size={15} />
            <span className="hidden sm:inline">الرئيسية</span>
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            {isImage ? (
              <FiImage className="text-teal-300 shrink-0" size={18} />
            ) : (
              <FiFileText className="text-teal-300 shrink-0" size={18} />
            )}
            <h1 className="text-xs sm:text-sm font-bold truncate text-slate-100">
              {isImage ? "عرض الصورة والمستند" : "عرض ملف الـ PDF والوثائق"}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {!isImage && (
            <button
              onClick={() => setViewerMode(viewerMode === "proxy" ? "google" : "proxy")}
              className="hidden md:flex items-center gap-1.5 text-xs bg-slate-800/80 hover:bg-slate-700 text-teal-200 border border-teal-800/50 px-3 py-1.5 rounded-lg transition"
              title="تبديل وضع العرض"
            >
              <FiEye size={13} />
              <span>{viewerMode === "proxy" ? "المعاينة السريعة" : "العرض الافتراضي"}</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition"
            title="طباعة"
          >
            <FiPrinter size={13} />
            <span>طباعة</span>
          </button>

          <a
            href={proxyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition"
            title="فتح بنافذة جديدة"
          >
            <FiExternalLink size={13} />
            <span className="hidden sm:inline">نافذة جديدة</span>
          </a>

          <a
            href={proxyUrl}
            download
            className="flex items-center gap-1.5 text-xs bg-teal-600 hover:bg-teal-500 text-white font-medium px-3.5 py-1.5 rounded-lg transition shadow-sm"
            title="تحميل الملف على جهازك"
          >
            <FiDownload size={13} />
            <span>تحميل</span>
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-slate-900">
        {isImage ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
            {/* Image Zoom / Rotate toolbar */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-slate-800/90 backdrop-blur border border-slate-700 p-1.5 rounded-xl shadow-lg">
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                className="p-1.5 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                title="تكبير"
              >
                <FiZoomIn size={16} />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                className="p-1.5 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                title="تصغير"
              >
                <FiZoomOut size={16} />
              </button>
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                title="تدوير"
              >
                <FiRotateCw size={16} />
              </button>
              <button
                onClick={() => {
                  setZoom(1);
                  setRotation(0);
                }}
                className="text-xs px-2 py-1 hover:bg-slate-700 text-slate-300 rounded-lg transition font-mono"
                title="إعادة الضبط"
              >
                100%
              </button>
            </div>

            {/* Rendered Image */}
            <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proxyUrl}
                alt="Document preview"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col relative bg-slate-900">
            {/* PDF Viewer Iframe */}
            <iframe
              src={viewerMode === "proxy" ? proxyUrl : googleViewerUrl}
              className="w-full h-full flex-1 border-0 bg-white"
              title="file-viewer"
            />

            {/* Mobile Fallback helper banner */}
            <div className="bg-slate-800/95 border-t border-slate-700 px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300 truncate">
                <span className="shrink-0 w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span className="truncate">إذا لم يظهر ملف الـ PDF تلقائياً في هاتفك، يمكنك فتحه مباشرة</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={proxyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-teal-600 hover:bg-teal-500 text-white font-medium px-3 py-1 rounded-md transition flex items-center gap-1"
                >
                  <FiExternalLink size={12} />
                  <span>فتح الملف مباشرة</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function FileViewPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white" dir="rtl">
          <div className="flex flex-col items-center gap-3">
            <span className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">جاري تحميل الملف والوثائق...</p>
          </div>
        </div>
      }
    >
      <FileViewer />
    </Suspense>
  );
}
