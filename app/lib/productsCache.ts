import { unstable_cache } from "next/cache";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

export const PRODUCTS_TAG = "products";

export const getAllProducts = unstable_cache(
  async () => {
    const res = await fetch(`${BACKEND}/api/products`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },
  ["all-products"],
  { tags: [PRODUCTS_TAG], revalidate: 60 }
);

export async function getProductById(id: string) {
  try {
    const res = await fetch(`${BACKEND}/api/products/${id}`, { next: { tags: [PRODUCTS_TAG] } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export const getSimilarProducts = unstable_cache(
  async (id: string, category?: string, subCategory?: string, limit: number = 8) => {
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (subCategory) params.set("subCategory", subCategory);
      params.set("limit", String(limit));
      const res = await fetch(`${BACKEND}/api/products/${id}/similar?${params.toString()}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
  ["similar-products"],
  { tags: [PRODUCTS_TAG], revalidate: 120 }
);

