import type { Metadata } from "next";
import PaymentClient from "./PaymentClient";
import { getCompanyData } from "../lib/companyCache";
import { SITE_URL, DEFAULT_OG_IMAGE, getBreadcrumbJsonLd } from "../lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompanyData();
  const siteName = company?.nameAr || "مدار للإلكترونيات";
  const title = `طرق الدفع والتقسيط المتاحة | ${siteName}`;
  const description = `تعرف على جميع وسائل الدفع والتقسيط المتاحة في ${siteName}. تقسيط مريح بدون فوائد، مدى، فيزا وماستر كارد، Apple Pay، و STC Pay بأعلى معايير الأمان المالي.`;

  return {
    title,
    description,
    keywords: ["طرق الدفع", "تقسيط بدون فوائد", "مدى", "فيزا", "Apple Pay", "STC Pay", siteName, "السعودية"],
    alternates: {
      canonical: `${SITE_URL}/payment`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/payment`,
      siteName,
      locale: "ar_SA",
      type: "website",
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${title} - ${siteName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function PaymentPage() {
  const company = await getCompanyData();
  const breadcrumbs = getBreadcrumbJsonLd([
    { name: "الرئيسية", url: "/" },
    { name: "طرق الدفع", url: "/payment" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <PaymentClient company={company} />
    </>
  );
}
