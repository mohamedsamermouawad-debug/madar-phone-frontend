"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function IPhone18Popup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("i18banner")) setVisible(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("i18banner", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="w-full bg-black text-white text-sm flex items-center justify-between gap-3 px-4 py-2.5" dir="rtl">
      <span className="flex items-center gap-2">
        🎉 <span className="font-semibold">iPhone 18 Pro Max وصل أخيراً!</span>
        <span className="text-gray-300 hidden sm:inline">— متاح الآن للطلب الفوري</span>
      </span>
      <div className="flex items-center gap-3 shrink-0">
        <Link href="/smartphones/iphone-18-pro-max" className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full hover:bg-gray-200 transition">
          اطلب الآن
        </Link>
        <button onClick={dismiss} className="text-gray-400 hover:text-white transition text-base leading-none">✕</button>
      </div>
    </div>
  );
}
