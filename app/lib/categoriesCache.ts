import { cache } from "react";
import { unstable_cache } from "next/cache";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

export const CATEGORIES_TAG = "categories";
export const SETTINGS_TAG = "home-settings";
export const CATEGORY_BANNERS_TAG = "category-banners";

export type PublicCategory = { name: string; count: number; image: string };
export type HomeSetting = { category: string; subCategory: string; showInHome: boolean; order: number };

// Cached Public Categories
export const getPublicCategories = cache(
  unstable_cache(
    async (): Promise<PublicCategory[]> => {
      try {
        const res = await fetch(`${BACKEND}/api/admin/sub-categories/public`, {
          next: { tags: [CATEGORIES_TAG] },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
    ["public-categories"],
    { tags: [CATEGORIES_TAG], revalidate: 86400 }
  )
);

// Cached Home Category Settings
export const getHomeSettings = cache(
  unstable_cache(
    async (): Promise<HomeSetting[]> => {
      try {
        const res = await fetch(`${BACKEND}/api/admin/sub-categories/home-settings`, {
          next: { tags: [SETTINGS_TAG] },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
    ["home-category-settings"],
    { tags: [SETTINGS_TAG], revalidate: 86400 }
  )
);

// Cached Bulk Category Banners (1 single request for all categories)
export const getBulkBanners = cache(
  unstable_cache(
    async (categoryNames: string[]): Promise<Record<string, string[]>> => {
      if (!categoryNames.length) return {};
      try {
        const query = encodeURIComponent(categoryNames.join(","));
        const res = await fetch(`${BACKEND}/api/admin/category-banners-bulk?categories=${query}`, {
          next: { tags: [CATEGORY_BANNERS_TAG] },
        });
        if (!res.ok) return {};
        return await res.json();
      } catch {
        return {};
      }
    },
    ["bulk-category-banners"],
    { tags: [CATEGORY_BANNERS_TAG], revalidate: 86400 }
  )
);
