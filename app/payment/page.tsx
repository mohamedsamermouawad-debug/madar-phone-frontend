import type { Metadata } from "next";
import PaymentClient from "./PaymentClient";

export const metadata: Metadata = {
  title: "طرق الدفع المتاحة - ادفع بالطريقة اللي تناسبك | مدار للإلكترونيات",
  description: "تعرف على جميع طرق الدفع المتاحة في مدار للإلكترونيات. تقسيط بدون فوائد، تحويل بنكي، ومدى. اختر الطريقة الأنسب لك.",
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getCompany() {
  try {
    const r = await fetch(`${API}/api/admin/company`, { next: { revalidate: 60 } });
    return r.ok ? r.json() : {};
  } catch {
    return {};
  }
}

export default async function PaymentPage() {
  const company = await getCompany();
  return <PaymentClient company={company} />;
}
