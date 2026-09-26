"use client";

import { useState, useEffect, useSyncExternalStore, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { navItems } from "./data";
import { SearchIcon, CartIcon, MenuIcon, CloseIcon } from "./icons";

import MobileMenu from "./MobileMenu";
import { useCartStore } from "../../store/cartStore";

const itemCount_selector = (s: { items: { qty: number }[] }) =>
  s.items.reduce((sum, i) => sum + i.qty, 0);

export default function Navbar() {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults]         = useState<{
    _id: string; name: string; images?: string[]; image?: string;
    salePrice?: number; originalPrice?: number; price?: number;
  }[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching]   = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  const searchInputRef  = useRef<HTMLInputElement>(null);
  const searchWrapRef   = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const mounted   = useSyncExternalStore(() => () => {}, () => true, () => false);
  const itemCount = useCartStore(itemCount_selector);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!searchWrapRef.current?.contains(t) && !mobileSearchRef.current?.contains(t)) {
        setSearchOpen(false); setResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res  = await fetch(`/api/products?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } finally { setSearching(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchResults(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery, fetchResults]);



  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Floating pill — single bar, logo overflows top ── */}
      <header
        className="fixed top-0 inset-x-0 z-50 flex justify-center px-2 sm:px-5 pt-2 sm:pt-4 pointer-events-none"
        dir="rtl"
      >
        <div
          className={`pointer-events-auto w-full max-w-7xl flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-1 sm:py-2.5 rounded-2xl transition-all duration-300
            ${scrolled
              ? "bg-white/95 backdrop-blur-md shadow-xl shadow-black/10 border border-gray-100"
              : "bg-white/18 backdrop-blur-md border border-white/22 shadow-md"
            }`}
        >
          {/* Mobile hamburger — يظهر دايماً */}
          <button
            aria-label="القائمة"
            aria-expanded={mobileOpen}
            aria-controls="store-menu"
            className={`p-1.5 rounded-xl transition-colors shrink-0 ${scrolled ? "text-gray-700 hover:bg-gray-100" : "text-gray-900 hover:bg-white/20"}`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          {/* ── Logo — كبير، يطلع فوق بدون ما يأثر على ارتفاع الـ pill ── */}
          <div className="shrink-0 relative h-0 overflow-visible flex items-center">
            <Link href="/" className="flex items-center absolute" style={{ top: "50%", transform: "translateY(-68%)" }}>
              <Image
                src="/logo.webp"
                alt="مدار"
                width={160}
                height={64}
                className="h-14 sm:h-16 w-auto object-contain"
                priority
              />
            </Link>
            {/* spacer عشان يحجز عرض اللوجو */}
            <div className="w-28 sm:w-36" />
          </div>

          {/* ── CENTER: رقم واتساب ── */}
          <div className="nav-desktop-show flex-1 items-center justify-center min-w-0">
            <a
              href="https://wa.me/966599171457"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 font-semibold text-sm transition-colors whitespace-nowrap
                ${scrolled ? "text-gray-700 hover:text-[#0889A2]" : "text-gray-900 hover:text-[#0889A2]"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#25D366] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.882l6.186-1.443A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.371l-.36-.214-3.724.868.936-3.42-.235-.372A9.818 9.818 0 1 1 12 21.818z"/>
              </svg>
              <span dir="ltr" className="whitespace-nowrap hidden sm:inline">+966 59 917 1457</span>
            </a>
          </div>

          {/* spacer على الموبايل فقط */}
          <div className="nav-mobile-hide flex-1" />

          {/* ── RIGHT: Search + Cart ── */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Desktop search */}
            <div ref={searchWrapRef} className="hidden sm:block relative w-44 md:w-56 lg:w-64">
              <div className={`flex items-center rounded-xl border transition-all duration-200 overflow-hidden
                ${scrolled
                  ? "border-gray-200 bg-gray-50 focus-within:border-[#0889A2] focus-within:bg-white"
                  : "border-white/30 bg-white/10 focus-within:border-white/60"
                }`}>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="ابحث..."
                  className={`flex-1 min-w-0 px-3 py-2 text-sm bg-transparent outline-none
                    ${scrolled ? "text-gray-800 placeholder-gray-400" : "text-gray-800 placeholder-gray-500"}`}
                />
                {searching ? (
                  <div className="px-2.5">
                    <div className="w-3.5 h-3.5 border-2 border-[#0889A2] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <button
                    aria-label="بحث"
                    onClick={() => fetchResults(searchQuery)}
                    className="m-1 px-2.5 py-1.5 bg-[#003048] hover:bg-[#0889A2] text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold shrink-0"
                  >
                    <SearchIcon />
                    <span className="hidden lg:inline">بحث</span>
                  </button>
                )}
              </div>

              {/* results dropdown */}
              {searchOpen && results.length > 0 && (
                <ul className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {results.map((p) => {
                    const img   = p.images?.[0] || p.image;
                    const price = p.salePrice ?? p.originalPrice ?? p.price ?? 0;
                    return (
                      <li key={p._id}>
                        <Link
                          href={`/product/${p._id}`}
                          onClick={() => { setSearchOpen(false); setSearchQuery(""); setResults([]); }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          {img && (
                            <Image
                              src={img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${img.startsWith("/") ? img : "/" + img}`}
                              alt={p.name} width={40} height={40}
                              className="object-contain rounded-xl border border-gray-100 bg-white shrink-0" unoptimized
                            />
                          )}
                          <span className="flex-1 text-sm text-gray-800 line-clamp-1 font-medium">{p.name}</span>
                          <span className="text-sm font-bold text-gray-900 shrink-0">{price.toLocaleString("en-US")} ر.س</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
              {searchOpen && !searching && searchQuery.trim() && results.length === 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-7">
                  <p className="text-center text-sm text-gray-400">لا توجد نتائج لـ &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>

            {/* Mobile search icon */}
            <button
              aria-label="بحث"
              className={`sm:hidden p-1.5 rounded-xl transition-colors ${scrolled ? "text-gray-700 hover:bg-gray-100" : "text-gray-800 hover:bg-white/20"}`}
              onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchInputRef.current?.focus(), 50); }}
            >
              <SearchIcon />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label="السلة"
              className={`relative flex items-center p-1.5 rounded-xl transition-colors ${scrolled ? "text-gray-700 hover:bg-gray-100" : "text-gray-800 hover:bg-white/20"}`}
            >
              <div className="relative">
                <CartIcon />
                {mounted && itemCount > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 bg-[#003048] text-white text-[10px] font-bold min-w-[17px] h-[17px] flex items-center justify-center rounded-full px-0.5">
                    {itemCount}
                  </span>
                )}
              </div>
            </Link>

          </div>
        </div>

        {/* ── Mobile search drawer ── */}
        {searchOpen && (
          <div
            ref={mobileSearchRef}
            className="sm:hidden absolute top-full mt-2 right-3 left-3 bg-white rounded-2xl border border-gray-100 shadow-xl p-3"
          >
            <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); }}
                placeholder="ابحث عن منتج..."
                className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
              />
              <button
                aria-label="بحث"
                onClick={() => fetchResults(searchQuery)}
                className="m-1 px-3 py-2 bg-[#003048] hover:bg-[#0889A2] text-white rounded-xl transition-colors flex items-center shrink-0"
              >
                <SearchIcon />
              </button>
            </div>
            {results.length > 0 && (
              <ul className="mt-2 max-h-56 overflow-y-auto divide-y divide-gray-50">
                {results.map((p) => {
                  const img   = p.images?.[0] || p.image;
                  const price = p.salePrice ?? p.originalPrice ?? p.price ?? 0;
                  return (
                    <li key={p._id}>
                      <Link
                        href={`/product/${p._id}`}
                        onClick={() => { setSearchOpen(false); setSearchQuery(""); setResults([]); }}
                        className="flex items-center gap-3 px-2 py-2.5 hover:bg-gray-50 transition-colors rounded-xl"
                      >
                        {img && (
                          <Image
                            src={img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${img.startsWith("/") ? img : "/" + img}`}
                            alt={p.name} width={36} height={36}
                            className="object-contain rounded-xl border border-gray-100 bg-white shrink-0" unoptimized
                          />
                        )}
                        <span className="flex-1 text-sm text-gray-800 line-clamp-1 font-medium">{p.name}</span>
                        <span className="text-sm font-bold text-gray-900 shrink-0">{price.toLocaleString("en-US")} ر.س</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </header>

      <MobileMenu items={navItems} isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

