import type { Metadata } from "next";
import { SITE_URL } from "../lib/seo";

export const metadata: Metadata = {
  title: "سلة التسوق | مدار للإلكترونيات",
  description: "راجع المنتجات المضافة لسلتك وأكمل طلبك بسهولة مع تقسيط مريح وشحن سريع لكافة مناطق المملكة.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/cart` },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
