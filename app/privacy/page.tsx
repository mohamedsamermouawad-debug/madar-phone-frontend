import type { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";
import { getCompanyData } from "../lib/companyCache";
import { SITE_URL, DEFAULT_OG_IMAGE, getBreadcrumbJsonLd } from "../lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompanyData();
  const siteName = company?.nameAr || "مدار للإلكترونيات";
  const title = `سياسة الخصوصية وحماية البيانات | ${siteName}`;
  const description = `تعرف على سياسة الخصوصية وحماية البيانات واتفاقية الاستخدام في متجر ${siteName}. نلتزم بحماية خصوصيتك ومعلوماتك بأعلى معايير الأمان.`;

  return {
    title,
    description,
    keywords: ["سياسة الخصوصية", "حماية البيانات", "شروط الاستخدام", siteName],
    alternates: {
      canonical: `${SITE_URL}/privacy`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/privacy`,
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

export default async function PrivacyPage() {
  const company = await getCompanyData();
  const breadcrumbs = getBreadcrumbJsonLd([
    { name: "الرئيسية", url: "/" },
    { name: "سياسة الخصوصية", url: "/privacy" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <PrivacyClient company={company} />
    </>
  );
}
