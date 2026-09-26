import type { Metadata } from "next";
import { SITE_URL } from "../lib/seo";

export const metadata: Metadata = {
  title: "اختيار طريقة الدفع والتقسيط | مدار للإلكترونيات",
  description: "اختر خطة التقسيط المناسبة لك أو وسيلة الدفع المفضلة لإتمام طلبك بسهولة وأمان.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/payment-method` },
};

export default function PaymentMethodLayout({ children }: { children: React.ReactNode }) {
  return children;
}
