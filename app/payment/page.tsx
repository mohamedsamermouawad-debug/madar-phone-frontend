import type { Metadata } from "next";
import PaymentClient from "./PaymentClient";
import { getCompanyData } from "../lib/companyCache";

const SITE_URL = "https://madar-electronics.com";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompanyData();
  const siteName = company.nameAr || "مدار للإلكترونيات";
  return {
    title: `طرق الدفع المتاحة | ${siteName}`,
    description: `تعرف على جميع طرق الدفع المتاحة في ${siteName}. تقسيط مريح بسعر الكاش، مدى، فيزا وماستر كارد، Apple Pay، و STC Pay.`,
    alternates: {
      canonical: `${SITE_URL}/payment`,
    },
    openGraph: {
      title: `طرق الدفع المتاحة | ${siteName}`,
      description: `تعرف على خيارات وطرق الدفع والتقسيط في ${siteName}.`,
      url: `${SITE_URL}/payment`,
      siteName,
      locale: "ar_SA",
      type: "website",
    },
  };
}

export default async function PaymentPage() {
  const company = await getCompanyData();
  return <PaymentClient company={company} />;
}
