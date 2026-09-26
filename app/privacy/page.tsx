import type { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";
import { getCompanyData } from "../lib/companyCache";

const SITE_URL = "https://madar-electronics.com";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompanyData();
  const siteName = company.nameAr || "مدار للإلكترونيات";
  return {
    title: `سياسة الخصوصية واتفاقية الاستخدام | ${siteName}`,
    description: `تعرف على سياسة الخصوصية وحماية البيانات واتفاقية الاستخدام في ${siteName}. نلتزم بحماية خصوصيتك ومعلوماتك بأعلى معايير الأمان.`,
    alternates: {
      canonical: `${SITE_URL}/privacy`,
    },
    openGraph: {
      title: `سياسة الخصوصية واتفاقية الاستخدام | ${siteName}`,
      description: `سياسة الخصوصية واتفاقية الاستخدام المعتمدة في ${siteName}.`,
      url: `${SITE_URL}/privacy`,
      siteName,
      locale: "ar_SA",
      type: "website",
    },
  };
}

export default async function PrivacyPage() {
  const company = await getCompanyData();
  return <PrivacyClient company={company} />;
}
