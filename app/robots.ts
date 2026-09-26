import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/verify/", "/_next/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/verify/"],
      },
    ],
    sitemap: "https://madarelectronic.com/sitemap.xml",
    host: "https://madarelectronic.com",
  };
}
