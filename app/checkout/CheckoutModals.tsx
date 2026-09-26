"use client";

import Link from "next/link";
import { BadgeCheck } from "lucide-react";

export function LoadingOverlay({ show, title = "جاري معالجة الدفع" }: { show: boolean; title?: string }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 px-6 bg-white">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#173e48]" style={{ animation: "spin 0.85s linear infinite" }} />
      </div>
      <div className="text-center space-y-2">
        <p className="text-black font-black text-base sm:text-lg">{title}</p>
        <p className="text-black text-sm">الرجاء عدم تغيير أو تحديث الصفحة</p>
        <p className="text-black text-xs pt-2">
          انقر{" "}
          <Link href="/cart" className="text-black underline underline-offset-2 font-bold">
            هنا
          </Link>
          {" "}إذا لم يتم تحميل الصفحة خلال 60 ثانية
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function SuccessModal({ show, onClose }: { show: boolean; onClose: () => void }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-white" onClick={e => e.stopPropagation()}>
        <div className="h-1" style={{ background: "linear-gradient(90deg,#65E0CD,#1B7174,#65E0CD)" }} />
        <div className="p-7 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#f0fdf9" }}>
            <BadgeCheck className="w-7 h-7 text-[#65E0CD]" />
          </div>
          <h2 className="text-xl font-black text-[#173e48] mb-1">تم استلام طلبك! 🎉</h2>
          <p className="text-[#65E0CD] font-bold text-sm mb-5" style={{ color: "#1B7174" }}>سيتم التواصل معك قريباً على واتساب</p>
          <button onClick={onClose} className="w-full py-3 rounded-xl text-white font-black text-sm hover:opacity-90 transition" style={{ background: "linear-gradient(135deg,#65E0CD,#1B7174)" }}>
            حسناً، شكراً! ✓
          </button>
        </div>
      </div>
    </div>
  );
}
