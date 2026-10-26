import type { Product } from "../components/products/types";

const COLOR_ORDER: string[] = [
  "برتقالي",
  "برتقالي كوني",
  "برتقالي تيتانيوم",
  "أزرق داكن",
  "أزرق",
  "ازرق",
  "سيلفر",
  "سيبفلر",
  "أزرق تيتانيوم",
  "أزرق فاتح",
  "أسود تيتانيوم",
  "أسود",
  "أبيض تيتانيوم",
  "أبيض",
  "بينك",
  "جولد",
  "رصاصي",
  "رمادي تيتانيوم",
  "صحراوي",
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function colorPriority(color?: string, name?: string): number {
  const src = (color && color.trim()) ? color.trim() : "";
  if (!src) {
    const n = (name || "").toLowerCase();
    if (n.includes("برتقال") || n.includes("orange")) return 0;
    return 999;
  }
  // exact match first
  const exact = COLOR_ORDER.indexOf(src);
  if (exact !== -1) return exact;
  // partial match (e.g. "برتقالي كوني" matches "برتقالي")
  const partial = COLOR_ORDER.findIndex(c => src.includes(c) || c.includes(src));
  return partial !== -1 ? partial : COLOR_ORDER.length;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseStorage(s?: string, name?: string): number {
  const sources = [s, name].filter(Boolean) as string[];
  for (const raw of sources) {
    const clean = raw.replace(/\s+/g, "");
    // English: 256GB, GB256
    const en = clean.match(/(\d+)(tb|gb)/i) || clean.match(/(gb|tb)(\d+)/i);
    if (en) {
      const num = parseInt(en[1]) || parseInt(en[2]);
      const unit = (en[1].match(/\d/) ? en[2] : en[1]).toLowerCase();
      return unit === "tb" ? num * 1024 : num;
    }
    // Arabic: تيرابايت/تيرا = TB, جيجابايت/جيجا = GB
    const arNum = raw.match(/(\d+)/);
    if (arNum) {
      const num = parseInt(arNum[1]);
      if (/تيرا/.test(raw)) return num * 1024;
      if (/جيجا/.test(raw)) return num;
    }
  }
  return Infinity;
}

export function sortProducts(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    // أولوية خاصة لمنتجات PlayStation المحددة
    const isPriorityA = isPlayStationPriority(a);
    const isPriorityB = isPlayStationPriority(b);
    
    if (isPriorityA && !isPriorityB) return -1;
    if (!isPriorityA && isPriorityB) return 1;
    
    // إذا كلاهما له أولوية، رتب PS5 Pro قبل PS5 Slim
    if (isPriorityA && isPriorityB) {
      const isProA = a.nameAr?.includes("برو") || a.nameAr?.includes("Pro");
      const isProB = b.nameAr?.includes("برو") || b.nameAr?.includes("Pro");
      if (isProA && !isProB) return -1;
      if (!isProA && isProB) return 1;
    }
    
    // الباقي حسب السعر من الأعلى للأقل
    const priceA = (a.salePrice && a.salePrice > 0 ? a.salePrice : a.originalPrice) ?? a.price ?? 0;
    const priceB = (b.salePrice && b.salePrice > 0 ? b.salePrice : b.originalPrice) ?? b.price ?? 0;
    return priceB - priceA;
  });
}

function isPlayStationPriority(product: Product): boolean {
  const name = product.nameAr?.toLowerCase() || "";
  // التحقق من أنه PS5 Pro أو PS5 Slim الأبيض
  const isPS5 = name.includes("بلايستيشن 5") || name.includes("playstation 5");
  const isProOrSlim = name.includes("برو") || name.includes("سليم") || name.includes("pro") || name.includes("slim");
  const isWhite = name.includes("أبيض") || name.includes("white");
  
  return isPS5 && isProOrSlim && isWhite;
}
