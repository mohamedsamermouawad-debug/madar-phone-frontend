"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Loader2, X, MapPin, Locate, PenLine } from "lucide-react";
import { reverseGeocode } from "../../lib/geocoding";

export interface MapAddressData {
  address: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  country?: string;
}

interface Props {
  onSelect: (data: MapAddressData) => void;
  initialAddress?: string;
}

interface Suggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
    initGoogleMapCart?: () => void;
  }
}

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!;
const isSaudi = (country: string) => /saudi|arabia|سعودي|السعودية/i.test(country);

export default function AddressMap({ onSelect, initialAddress }: Props) {
  const [mode, setMode] = useState<"search" | "manual">("search");
  const [query, setQuery] = useState(initialAddress ?? "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [manualText, setManualText] = useState(initialAddress ?? "");
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [mapLoading, setMapLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [pendingAddress, setPendingAddress] = useState<MapAddressData | null>(null);
  const [countryError, setCountryError] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initMap = useCallback(() => {
    if (!containerRef.current || mapRef.current) return;
    try {
      const map = new window.google.maps.Map(containerRef.current, {
        center: { lat: 24.7136, lng: 46.6753 },
        zoom: 6,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.addListener("click", async (e: any) => {
        if (!e.latLng) return;
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        placeMarkerAt(map, lat, lng);
        setGeocoding(true);
        setCountryError("");
        try {
          const parsed = await reverseGeocode(lat, lng);
          if (!parsed) return;
          if (parsed.country && !isSaudi(parsed.country)) {
            setCountryError("نوفر التوصيل داخل المملكة العربية السعودية فقط");
            return;
          }
          const data: MapAddressData = {
            address: parsed.formattedAddress || parsed.address,
            formattedAddress: parsed.formattedAddress || parsed.address,
            latitude: lat, longitude: lng,
            city: parsed.city, state: parsed.state, country: parsed.country,
          };
          setPendingAddress(data);
        } finally { setGeocoding(false); }
      });
      mapRef.current = map;
      setMapReady(true);
      setMapLoading(false);
    } catch { setMapError("تعذر تحميل الخريطة"); setMapLoading(false); }
  }, []);

  const loadMap = useCallback(() => {
    if (!KEY) { setMapError("مفتاح الخرائط غير متوفر"); return; }
    setMapLoading(true);
    if (window.google?.maps) { initMap(); return; }
    window.initGoogleMapCart = initMap;
    if (!document.getElementById("google-maps-script-cart")) {
      const script = document.createElement("script");
      script.id = "google-maps-script-cart";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&callback=initGoogleMapCart&language=ar`;
      script.async = true; script.defer = true;
      script.onerror = () => { setMapError("تعذر تحميل خدمة الخرائط"); setMapLoading(false); };
      document.head.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if (window.google?.maps) { clearInterval(interval); initMap(); }
      }, 200);
    }
  }, [initMap]);

  function placeMarkerAt(map: unknown, lat: number, lng: number) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = map as any;
    if (markerRef.current) {
      markerRef.current.setPosition({ lat, lng });
    } else {
      const G = window.google.maps;
      markerRef.current = new G.Marker({ position: { lat, lng }, map: m, draggable: true, animation: G.Animation?.DROP });
      markerRef.current.addListener("dragend", async () => {
        const pos = markerRef.current.getPosition();
        const lt = pos.lat(), ln = pos.lng();
        setGeocoding(true); setCountryError("");
        try {
          const parsed = await reverseGeocode(lt, ln);
          if (!parsed) return;
          if (parsed.country && !isSaudi(parsed.country)) { setCountryError("نوفر التوصيل داخل المملكة فقط"); return; }
          setPendingAddress({ address: parsed.formattedAddress || parsed.address, formattedAddress: parsed.formattedAddress || parsed.address, latitude: lt, longitude: ln, city: parsed.city, state: parsed.state, country: parsed.country });
        } finally { setGeocoding(false); }
      });
    }
    m.panTo({ lat, lng });
    m.setZoom(15);
  }

  const fetchSuggestions = useCallback(async (val: string) => {
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/places?type=autocomplete&input=${encodeURIComponent(val)}`);
      const data = await res.json();
      const results: Suggestion[] = (data.predictions ?? []).map((p: {
        place_id: string; description: string;
        structured_formatting?: { main_text: string; secondary_text: string };
      }) => ({
        place_id: p.place_id, description: p.description,
        main_text: p.structured_formatting?.main_text ?? p.description,
        secondary_text: p.structured_formatting?.secondary_text ?? "",
      }));
      setSuggestions(results); setOpen(results.length > 0);
    } catch { setSuggestions([]); }
    finally { setSearchLoading(false); }
  }, []);

  const handleSearchChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(() => fetchSuggestions(val.trim()), 400);
  };

  const handleSuggestionSelect = async (s: Suggestion) => {
    setQuery(s.description); setOpen(false); setSuggestions([]);
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/places?type=details&place_id=${encodeURIComponent(s.place_id)}`);
      const data = await res.json();
      const loc = data.result?.geometry?.location;
      if (!loc) return;
      const lat = loc.lat as number, lng = loc.lng as number;
      const addr: MapAddressData = {
        address: data.result.formatted_address ?? s.description,
        formattedAddress: data.result.formatted_address ?? s.description,
        latitude: lat, longitude: lng,
      };
      onSelect(addr);
      if (mode === "search" && mapRef.current) placeMarkerAt(mapRef.current, lat, lng);
    } catch {}
    finally { setSearchLoading(false); }
  };

  const handleCurrentLocation = () => {
    setCountryError("");
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocating(false);
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        if (mapRef.current) placeMarkerAt(mapRef.current, lat, lng);
        setGeocoding(true);
        try {
          const parsed = await reverseGeocode(lat, lng);
          if (!parsed) return;
          if (parsed.country && !isSaudi(parsed.country)) { setCountryError("نوفر التوصيل داخل المملكة فقط"); return; }
          setPendingAddress({ address: parsed.formattedAddress || parsed.address, formattedAddress: parsed.formattedAddress || parsed.address, latitude: lat, longitude: lng, city: parsed.city, state: parsed.state, country: parsed.country });
        } finally { setGeocoding(false); }
      },
      () => setLocating(false),
      { timeout: 10000 }
    );
  };

  const handleConfirmMap = () => {
    if (!pendingAddress) return;
    onSelect(pendingAddress);
    setPendingAddress(null);
  };

  const handleManualSubmit = () => {
    if (!manualText.trim()) return;
    onSelect({ address: manualText.trim(), formattedAddress: manualText.trim() });
  };

  return (
    <div className="space-y-2">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button onClick={() => { setMode("search"); if (!mapRef.current) loadMap(); }}
          className={`flex-1 py-1.5 text-[11px] font-black border rounded-lg flex items-center justify-center gap-1 transition ${mode === "search" ? "border-[#65E0CD] text-[#1B7174] bg-[#f0fdf9]" : "border-gray-200 text-gray-400 bg-white hover:border-gray-300"}`}>
          <MapPin size={11} /> الخريطة
        </button>
        <button onClick={() => setMode("manual")}
          className={`flex-1 py-1.5 text-[11px] font-black border rounded-lg flex items-center justify-center gap-1 transition ${mode === "manual" ? "border-[#65E0CD] text-[#1B7174] bg-[#f0fdf9]" : "border-gray-200 text-gray-400 bg-white hover:border-gray-300"}`}>
          <PenLine size={11} /> إدخال يدوي
        </button>
      </div>

      {mode === "search" && (
        <>
          {/* Search Box */}
          <div ref={wrapperRef} className="relative">
            <div className="relative">
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                {searchLoading ? <Loader2 size={13} className="animate-spin text-[#65E0CD]" /> : <Search size={13} className="text-gray-300" />}
              </div>
              <input ref={inputRef} value={query} onChange={e => handleSearchChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setOpen(true)}
                placeholder="ابحث عن عنوانك في المملكة..."
                className="w-full pr-9 pl-8 py-2.5 text-xs border border-[#dce8eb] rounded-xl focus:border-[#65E0CD] focus:outline-none transition placeholder:text-gray-300 bg-[#f3f7f8]"
                dir="rtl"
              />
              {query && (
                <button onMouseDown={() => { setQuery(""); setSuggestions([]); setOpen(false); inputRef.current?.focus(); }}
                  className="absolute inset-y-0 left-2.5 flex items-center text-gray-300 hover:text-gray-500">
                  <X size={12} />
                </button>
              )}
            </div>
            {open && suggestions.length > 0 && (
              <ul className="absolute z-[1100] w-full bg-white border border-gray-200 shadow-lg mt-1 max-h-56 overflow-y-auto rounded-xl" style={{ top: "100%" }}>
                {suggestions.map(s => (
                  <li key={s.place_id} onMouseDown={() => handleSuggestionSelect(s)}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-0 flex items-start gap-2">
                    <MapPin size={12} className="text-gray-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#173e48] truncate">{s.main_text}</p>
                      {s.secondary_text && <p className="text-[11px] text-gray-400 truncate">{s.secondary_text}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Map container — loads on first mode=search */}
          {(mapLoading || mapReady || mapError) && (
            <div className="relative border border-[#dce8eb] rounded-xl overflow-hidden">
              {mapLoading && (
                <div className="w-full h-[220px] flex items-center justify-center bg-gray-50">
                  <Loader2 size={20} className="animate-spin text-[#65E0CD]" />
                </div>
              )}
              {mapError && (
                <div className="w-full h-[220px] flex items-center justify-center bg-red-50">
                  <p className="text-xs text-red-500">⚠ {mapError}</p>
                </div>
              )}
              <div ref={containerRef} className="w-full h-[220px]" style={{ display: mapLoading || mapError ? "none" : "block" }} />
              {mapReady && !mapError && (
                <button onClick={handleCurrentLocation} disabled={locating}
                  className="absolute bottom-3 left-3 z-[1000] flex items-center gap-1 bg-white border border-gray-200 shadow px-2.5 py-1.5 text-[11px] font-bold text-[#173e48] hover:bg-gray-50 transition disabled:opacity-60 rounded-lg">
                  {locating ? <Loader2 size={11} className="animate-spin" /> : <Locate size={11} />}
                  موقعي
                </button>
              )}
            </div>
          )}

          {!mapReady && !mapLoading && !mapError && (
            <button onClick={loadMap}
              className="w-full py-2 text-[11px] font-bold border border-dashed border-[#65E0CD] text-[#1B7174] rounded-xl hover:bg-[#f0fdf9] transition flex items-center justify-center gap-1">
              <MapPin size={12} /> افتح الخريطة لتحديد موقعك
            </button>
          )}

          {geocoding && <p className="text-[11px] text-blue-500 flex items-center gap-1"><Loader2 size={11} className="animate-spin" /> جارٍ تحديد العنوان...</p>}
          {countryError && <p className="text-[11px] text-red-500 font-bold">⚠ {countryError}</p>}

          {pendingAddress && !geocoding && !countryError && (
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-green-50 border border-green-100 rounded-xl">
              <p className="text-[11px] text-green-700 font-medium truncate flex-1">
                📍 {pendingAddress.formattedAddress || pendingAddress.address}
              </p>
              <button onClick={handleConfirmMap}
                className="shrink-0 px-2.5 py-1 text-[11px] font-black text-white rounded-lg transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#65E0CD,#1B7174)", color: "#053132" }}>
                تأكيد
              </button>
            </div>
          )}
        </>
      )}

      {mode === "manual" && (
        <div className="space-y-2">
          <textarea
            value={manualText}
            onChange={e => setManualText(e.target.value)}
            placeholder="مثال: الرياض - حي النزهة - شارع الأمير سلطان - عمارة رقم 5"
            rows={3}
            className="w-full px-3 py-2.5 text-xs border border-[#dce8eb] rounded-xl focus:border-[#65E0CD] focus:outline-none transition placeholder:text-gray-300 bg-[#f3f7f8] resize-none text-[#173e48]"
          />
          <button onClick={handleManualSubmit} disabled={!manualText.trim()}
            className="w-full py-2 text-[11px] font-black rounded-xl transition disabled:opacity-50 hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#65E0CD,#1B7174)", color: "#053132" }}>
            حفظ العنوان
          </button>
        </div>
      )}
    </div>
  );
}
