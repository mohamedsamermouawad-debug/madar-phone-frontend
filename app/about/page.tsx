import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import { getCompanyData } from "../lib/companyCache";
import { SITE_URL, DEFAULT_OG_IMAGE, getBreadcrumbJsonLd } from "../lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompanyData();
  const siteName = company?.nameAr || "مدار للإلكترونيات";
  const title = `من نحن | ${siteName}`;
  const description = `تعرف على متجر ${siteName} - رؤيتنا ورسالتنا والخدمات المميزة التي نقدمها لعملائنا في جميع أنحاء المملكة العربية السعودية. تقسيط مريح وشحن سريع وضمان معتمد.`;

  return {
    title,
    description,
    keywords: ["من نحن", "عن مدار للإلكترونيات", "متجر إلكتروني سعودي", "تقسيط إلكترونيات", siteName],
    alternates: {
      canonical: `${SITE_URL}/about`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/about`,
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

export default async function AboutPage() {
  const company = await getCompanyData();
  const breadcrumbs = getBreadcrumbJsonLd([
    { name: "الرئيسية", url: "/" },
    { name: "من نحن", url: "/about" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <AboutClient company={company} />
    </>
  );
}
