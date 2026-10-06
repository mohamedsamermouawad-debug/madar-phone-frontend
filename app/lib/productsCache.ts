import { cache } from "react";
import { unstable_cache } from "next/cache";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

export const PRODUCTS_TAG = "products";
export const REVIEWS_TAG = "reviews";

export const getAllProducts = cache(
  unstable_cache(
    async () => {
      try {
        const res = await fetch(`${BACKEND}/api/products`, {
          next: { tags: [PRODUCTS_TAG] },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
    ["all-products"],
    { tags: [PRODUCTS_TAG], revalidate: 60 }
  )
);

export const getProductById = cache(
  (id: string) =>
    unstable_cache(
      async () => {
        try {
          const res = await fetch(`${BACKEND}/api/products/${id}`, {
            next: { tags: [PRODUCTS_TAG, `product-${id}`] },
          });
          if (!res.ok) return null;
          return await res.json();
        } catch {
          return null;
        }
      },
      [`product-by-id-${id}`],
      { tags: [PRODUCTS_TAG, `product-${id}`], revalidate: 60 }
    )()
);

export const getSimilarProducts = cache(
  (id: string, category?: string, subCategory?: string, limit: number = 8) =>
    unstable_cache(
      async () => {
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
      [`similar-products-${id}-${category || ""}-${subCategory || ""}-${limit}`],
      { tags: [PRODUCTS_TAG], revalidate: 60 }
    )()
);

export const getPublicReviews = cache(
  unstable_cache(
    async () => {
      try {
        const res = await fetch(`${BACKEND}/api/admin/reviews`, {
          next: { tags: [REVIEWS_TAG] },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
    ["public-reviews"],
    { tags: [REVIEWS_TAG], revalidate: 300 }
  )
);

