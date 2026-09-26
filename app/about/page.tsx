import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import { getCompanyData } from "../lib/companyCache";

const SITE_URL = "https://madar-electronics.com";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompanyData();
  const siteName = company.nameAr || "مدار للإلكترونيات";
  return {
    title: `من نحن | ${siteName}`,
    description: `تعرف على ${siteName} - رؤيتنا ورسالتنا والخدمات المميزة التي نقدمها لعملائنا في جميع أنحاء المملكة. تقسيط مريح وشحن سريع وضمان معتمد.`,
    alternates: {
      canonical: `${SITE_URL}/about`,
    },
    openGraph: {
      title: `من نحن | ${siteName}`,
      description: `تعرف على ${siteName} - رؤيتنا ورسالتنا وخدماتنا.`,
      url: `${SITE_URL}/about`,
      siteName,
      locale: "ar_SA",
      type: "website",
    },
  };
}

export default async function AboutPage() {
  const company = await getCompanyData();
  return <AboutClient company={company} />;
}
