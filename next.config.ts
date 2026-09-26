import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["react-phone-number-input", "country-flag-icons"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/sitemap.xml", destination: "/sitemap.xml" },
        { source: "/robots.txt", destination: "/robots.txt" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost", port: "5000" },
      { protocol: "http", hostname: "localhost", port: "3000" },
    ],
  },
};

export default nextConfig;
