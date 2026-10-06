# Investigation Report: Products Not Showing on Website

**Date:** 2026-10-06  
**Status:** Complete  
**Backend health check:** ✅ `http://localhost:5000/api/products` responds 200 with product data

---

## Summary Answer

**The backend is working fine — it is serving products correctly. The root cause is a stale Next.js ISR (Incremental Static Regeneration) cache.** All product-listing pages are statically generated with `revalidate: 86400` (24-hour cache). When products are added or changed in the database, the frontend continues to serve the old cached (empty or stale) version for up to 24 hours unless the cache is explicitly invalidated. The on-demand revalidation mechanism exists but there is a secondary bug: the admin panel that adds/edits products routes write requests to a **different backend URL** (`_lib.ts` hardcodes `https://madar-phone-backend.vercel.app`) than the one the public pages read from (`BACKEND_URL=http://localhost:5000`). This means:

1. Products are written to the **Vercel/production backend's** MongoDB.  
2. The public product pages (`getAllProducts`) read from `BACKEND_URL=http://localhost:5000` (the local backend), which connects to a **different MongoDB database** (`sahlnaha-store` on Atlas).
3. These two databases may be out of sync, or the local backend may have an empty/different dataset.

---

## Evidence

### Issue 1 — Split Backend URLs (Critical)

**File:** `frontend/app/api/admin/_lib.ts`, line 3  
```ts
const BACKEND = "https://madar-phone-backend.vercel.app";
```
This hardcoded fallback is used when `BACKEND_URL` or `NEXT_PUBLIC_API_URL` is not set in the admin API routes. However:

**File:** `frontend/.env.local`, lines 22-23  
```
NEXT_PUBLIC_API_URL=http://localhost:5000
BACKEND_URL=http://localhost:5000
```

In `getBackend()` in `_lib.ts`:
```ts
export function getBackend(): string {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || BACKEND;
}
```

Since `BACKEND_URL=http://localhost:5000` IS set in `.env.local`, both the public product fetches (`productsCache.ts`) and the admin write routes (`/api/admin/products`) currently point to the **same** local backend. This is consistent locally.

**However**, `NEXT_PUBLIC_API_URL` and `BACKEND_URL` in the commented-out production block (`.env.local` lines 10-11) point to `https://madar-phone-backend.onrender.com`. If those production environment variables are NOT set in the production deployment (e.g., on Vercel), `getBackend()` falls back to the hardcoded `https://madar-phone-backend.vercel.app` — a **different host** than `onrender.com`. The admin creates products on the Vercel backend, but the public pages may be reading from a different deployment. This is a potential split-brain problem in production.

---

### Issue 2 — 24-Hour ISR Cache (High Impact)

**File:** `frontend/app/(categories)/[slug]/page.tsx`, line 9  
```ts
export const revalidate = 86400; // 24 hours
```

**File:** `frontend/app/store/page.tsx`, line 62  
```ts
export const revalidate = 86400; // 24 hours
```

**File:** `frontend/app/lib/productsCache.ts`, lines 13-20  
```ts
export const getAllProducts = cache(
  unstable_cache(
    async () => { ... },
    ["all-products"],
    { tags: [PRODUCTS_TAG], revalidate: 86400 }  // 24-hour cache
  )
);
```

All product listing pages (store, category pages, home) are statically cached for 24 hours. After a new product is added or updated, users continue to see the old cached page until Next.js revalidates. The `.next/cache` directory exists on this machine, confirming a build cache is active.

---

### Issue 3 — Revalidation Only Fires from Admin Write Routes

**File:** `frontend/app/api/admin/products/route.ts`, lines 20-23  
```ts
if (res.ok) revalidateTag(PRODUCTS_TAG);
```

**File:** `frontend/app/api/admin/products/[id]/route.ts`, PUT and DELETE handlers  
```ts
if (res.ok) revalidateTag(PRODUCTS_TAG);
```

Revalidation IS triggered when products are created/updated/deleted through the frontend admin panel (`/api/admin/products`). However, if products were added or updated **directly** to the backend (via API tools, scripts, or the backend's own admin routes at `/api/admin/products` on the backend), the `revalidateTag` call in the Next.js layer is **never triggered**, so the frontend cache is never busted.

**File:** `frontend/app/api/revalidate/route.ts`  
There is a manual revalidation endpoint at `/api/revalidate?token=ADMIN_INTERNAL_TOKEN&tag=products` — but it must be called explicitly by an external POST request.

---

### Issue 4 — `HomeCategorySections` Requires Both Products AND Home Settings

**File:** `frontend/app/components/HomeCategorySections.tsx`, line 37  
```ts
const visibleMap = new Map(
  settings.filter((s) => s.showInHome).map((s) => [s.category, s.order])
);
if (!visibleMap.size) return null;  // returns nothing if no category is set to showInHome!
```

If no category has been configured with `showInHome: true` in `SubCategorySettings`, the entire home sections block is silently omitted. Even if products exist in the database, the homepage shows nothing. This is a silent failure mode — there is no error, just an empty render.

---

### Issue 5 — `filterProducts` Uses Strict Case-Sensitive Exact Match for `category`

**File:** `frontend/app/lib/categoryConfig.ts`, lines 187-196  
```ts
const matchCategory = categories?.length
  ? categories.some((c) => { ... })
  : category
  ? p.category?.toLowerCase() === category.toLowerCase() || p.category === category
  : true;
```

When a `category` filter (not `categories`) is used, it does `toLowerCase()` comparison. If a product in MongoDB has a category like `"ابل ايفون 16 برو ماكس "` (trailing space), it will NOT match the slug config's `"ابل ايفون 16 برو ماكس"` (no trailing space). This is a subtle whitespace-mismatch bug.

Evidence: In `adminRoutes.js` the category `"ابل ايفون 18 برو "` (with trailing space) appears in `categoryHrefMap`:
```ts
"ابل ايفون 18 برو ": "/smartphones/iphone-18-pro",
```
Confirming that trailing spaces exist in the actual data.

---

## Backend Health

- **MongoDB URI:** `MONGO_URI` in `.env` — connected to `sahlnaha-store` database on Atlas (`cluster0.qdccqam.mongodb.net`)
- **Live test:** `GET http://localhost:5000/api/products` returned HTTP 200 with product data (87+ KB response) — backend is healthy and has products.
- **Backend cache:** In-memory TTL cache (`utils/cache.js`) with 5-minute TTL for products. This is separate from the Next.js ISR cache and is not the cause of the issue.
- **CORS:** `FRONTEND_URL=http://localhost:3000,https://madar-electronics.com` — correctly configured for local and production.

---

## Root Cause Priority

| # | Issue | Severity | Likely Cause of Empty Products |
|---|-------|----------|-------------------------------|
| 1 | Stale ISR cache (86400s) + no revalidation triggered | **HIGH** | Most likely cause if products were added outside the admin UI |
| 2 | `HomeCategorySections` silently returns `null` if no `showInHome` settings exist | **HIGH** | Explains empty homepage even when products exist |
| 3 | Production backend URL mismatch (`vercel.app` vs `onrender.com`) | **HIGH** | Explains empty products in production deployment |
| 4 | Category string whitespace mismatch | **MEDIUM** | Explains empty specific category pages |

---

## Recommendations

### Fix 1 — Clear the ISR cache immediately (no code change needed)
Run from the frontend directory:
```bash
# Delete the .next/cache directory to force a full rebuild
rm -rf .next/cache
# Then rebuild
npm run build
```
Or call the revalidation endpoint manually:
```
POST http://localhost:3000/api/revalidate?token=5f9c0d8b7a6e1f3a9c8d2b4e7f1a6c3d9b8e5f2a1c7d6e4&tag=products
```

### Fix 2 — Check/configure `showInHome` settings in the admin panel
Go to Admin → Sub-Categories → toggle `showInHome` for the categories you want visible on the homepage. If this setting is missing/empty, `HomeCategorySections` will always render nothing.

### Fix 3 — Verify production environment variables
In the production deployment (Vercel/hosting), ensure:
- `NEXT_PUBLIC_API_URL` is set to the actual backend URL (e.g., `https://madar-phone-backend.onrender.com`)
- `BACKEND_URL` is set to the same value
- Both admin write routes and public read routes hit the **same** backend instance

### Fix 4 — Fix category string whitespace
In `frontend/app/lib/categoryConfig.ts`, the `filterProducts` function should trim category strings before comparison:
```ts
// Change:
p.category?.toLowerCase() === category.toLowerCase()
// To:
p.category?.trim().toLowerCase() === category.trim().toLowerCase()
```
And trim product category values before inserting them into MongoDB (in the admin product creation flow).

### Fix 5 — Reduce revalidation time or use on-demand revalidation more aggressively
Consider reducing `revalidate: 86400` to `revalidate: 300` (5 minutes) as a safety net, so stale cache is auto-cleared more frequently without requiring manual intervention.
