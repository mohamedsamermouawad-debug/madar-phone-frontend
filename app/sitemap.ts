import { MetadataRoute } from "next";
import { slugConfigs } from "./lib/categoryConfig";
import { SITE_URL, BACKEND_URL } from "./lib/seo";

const staticRoutes = [
  { path: "", priority: 1.0, changeFrequency: "daily" as const },
  { path: "/store", priority: 0.95, changeFrequency: "daily" as const },
  { path: "/smartphones", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/laptops", priority: 0.85, changeFrequency: "daily" as const },
  { path: "/tablets", priority: 0.85, changeFrequency: "daily" as const },
  { path: "/smart-watches", priority: 0.85, changeFrequency: "daily" as const },
  { path: "/apple-watches", priority: 0.85, changeFrequency: "daily" as const },
  { path: "/audio", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/playstation", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/games", priority: 0.75, changeFrequency: "weekly" as const },
  { path: "/accessories", priority: 0.75, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/payment-method", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.4, changeFrequency: "monthly" as const },
  { path: "/return-policy", priority: 0.4, changeFrequency: "monthly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const static_urls: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    lastModified: new Date(),
  }));

  const slug_urls: MetadataRoute.Sitemap = Object.keys(slugConfigs).map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    changeFrequency: "daily",
    priority: 0.75,
    lastModified: new Date(),
  }));

  let product_urls: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${BACKEND_URL}/api/products`, {
      next: { revalidate: 86400 },
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      const products: { _id: string; updatedAt?: string; createdAt?: string }[] = await res.json();
      if (Array.isArray(products)) {
        product_urls = products.map((p) => ({
          url: `${SITE_URL}/product/${p._id}`,
          changeFrequency: "daily",
          priority: 0.8,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : p.createdAt ? new Date(p.createdAt) : new Date(),
        }));
      }
    }
  } catch {
    // skip if backend is unreachable during build
  }

  return [...static_urls, ...slug_urls, ...product_urls];
}
