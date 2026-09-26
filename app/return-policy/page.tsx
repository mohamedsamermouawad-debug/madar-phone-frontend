import type { Metadata } from "next";
import ReturnPolicyClient from "./ReturnPolicyClient";
import { getCompanyData } from "../lib/companyCache";

const SITE_URL = "https://madar-electronics.com";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompanyData();
  const siteName = company.nameAr || "مدار للإلكترونيات";
  return {
    title: `سياسة الاستبدال والاسترجاع | ${siteName}`,
    description: `تعرف على سياسة الاستبدال والاسترجاع والإلغاء في ${siteName}. نضمن لك حقوقك كاملة مع شروط واضحة وشفافة لراحتك.`,
    alternates: {
      canonical: `${SITE_URL}/return-policy`,
    },
    openGraph: {
      title: `سياسة الاستبدال والاسترجاع | ${siteName}`,
      description: `تعرف على شروط وسياسات الاسترجاع والاستبدال في ${siteName}.`,
      url: `${SITE_URL}/return-policy`,
      siteName,
      locale: "ar_SA",
      type: "website",
    },
  };
}

export default async function ReturnPolicyPage() {
  const company = await getCompanyData();
  return <ReturnPolicyClient company={company} />;
}
