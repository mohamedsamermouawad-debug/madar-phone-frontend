import type { Product } from "../components/products/types";

function normalize(value = "") {
  return value.toLowerCase().normalize("NFKC")
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[أإآ]/g, "ا").replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F\u0670ـ]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export function productModelKey(product: Product) {
  let name = normalize(product.name)
    .replace(/ايفون|اي فون|i phone/g, "iphone")
    .replace(/برو/g, "pro").replace(/ماكس/g, "max")
    .replace(/بلس/g, "plus").replace(/ميني/g, "mini")
    .replace(/ابل|apple/g, " ");
  // An iPhone model is independent of its storage, finish and SIM version.
  const iphone = name.match(/iphone\s*(\d+\s*(?:pro\s*max|pro|max|plus|mini|air|e)?)(?=\s|$)/);
  if (iphone) return `iphone ${iphone[1].replace(/\s+/g, " ").trim()}`;
  const colors = [product.color, ...(product.colors ?? []).map((color) => color.name), ...(product.variants ?? []).map((variant) => variant.color)];
  for (const color of colors) {
    const normalized = normalize(color);
    if (normalized) name = ` ${name} `.split(` ${normalized} `).join(" ").trim();
  }
  return name
    .replace(/\d+\s*(?:gb|tb|جيجابايت|جيجا بايت|جيجا|تيرابايت|تيرا بايت|تيرا)(?=\s|$)/g, " ")
    .replace(/\b(?:black|white|blue|green|silver|gold|pink|purple|gray|grey|titanium)\b/g, " ")
    .replace(/(?:^|\s)(?:اسود|ابيض|ازرق|اخضر|فضي|ذهبي|وردي|بنفسجي|رمادي|تيتانيوم)(?=\s|$)/g, " ")
    .replace(/\s+/g, " ").trim();
}

export function selectSimilarProducts(product: Product, candidates: Product[], limit = 8): Product[] {
  const currentModel = productModelKey(product);
  const same = (a?: string, b?: string) => Boolean(a && b && normalize(a) === normalize(b));
  const seenIds = new Set([product._id]);
  const seenModels = new Set(currentModel ? [currentModel] : []);
  const price = (p: Product) => p.salePrice || p.originalPrice || p.price || 0;
  const score = (p: Product) => (same(p.subCategory, product.subCategory) ? 4 : 0) + (same(p.brand, product.brand) ? 2 : 0) + (p.inStock !== false ? 1 : 0);
  return candidates.filter((p) => same(p.category, product.category) || same(p.subCategory, product.subCategory))
    .sort((a, b) => score(b) - score(a) || Math.abs(price(a) - price(product)) - Math.abs(price(b) - price(product)))
    .filter((p) => {
      const model = productModelKey(p);
      if (seenIds.has(p._id) || (model && seenModels.has(model))) return false;
      seenIds.add(p._id);
      if (model) seenModels.add(model);
      return true;
    }).slice(0, limit);
}
