import type { Metadata } from "next";
import { SITE_URL } from "../lib/seo";

export const metadata: Metadata = {
  title: "إتمام الطلب والدفع الآمن | مدار للإلكترونيات",
  description: "أكمل عملية الشراء وادفع بأمان وسهولة عبر وسائل الدفع المعتمدة أو التقسيط المريح.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/checkout` },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
