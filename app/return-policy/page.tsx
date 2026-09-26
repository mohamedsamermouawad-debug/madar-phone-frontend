import type { Metadata } from "next";
import ReturnPolicyClient from "./ReturnPolicyClient";

export const metadata: Metadata = {
  title: "سياسة الاستبدال والاسترجاع - حقوقك كاملة مع مدار للإلكترونيات",
  description: "تعرف على سياسة الاستبدال والاسترجاع والإلغاء في مدار للإلكترونيات. نضمن لك حقوقك كاملة مع شروط واضحة وشفافة لراحتك.",
};

export default function ReturnPolicyPage() {
  return <ReturnPolicyClient />;
}
