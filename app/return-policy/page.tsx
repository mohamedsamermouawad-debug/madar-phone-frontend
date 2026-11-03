import type { Metadata } from "next";
import { cookies } from "next/headers";
import ReturnPolicyClient from "./ReturnPolicyClient";
import { getCompanyData } from "../lib/companyCache";
import { isBot2UserToken, applyBotContactOverride } from "../lib/botContact";
import { SITE_URL, DEFAULT_OG_IMAGE, getBreadcrumbJsonLd } from "../lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompanyData();
  const siteName = company?.nameAr || "مدار للإلكترونيات";
  const title = `سياسة الاستبدال والاسترجاع | ${siteName}`;
  const description = `تعرف على سياسة الاستبدال والاسترجاع والإلغاء في متجر ${siteName}. نضمن لك حقوقك كاملة مع شروط واضحة وميسرة لخدمتكم بأفضل وجه.`;

  return {
    title,
    description,
    keywords: ["سياسة الاسترجاع", "استبدال المنتجات", "ضمان الأجهزة", siteName],
    alternates: {
      canonical: `${SITE_URL}/return-policy`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/return-policy`,
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

export default async function ReturnPolicyPage() {
  const rawCompany = await getCompanyData();
  const cookieStore = await cookies();
  const token = cookieStore.get("_b_token")?.value;
  const company = applyBotContactOverride(rawCompany, isBot2UserToken(token));

  const breadcrumbs = getBreadcrumbJsonLd([
    { name: "الرئيسية", url: "/" },
    { name: "سياسة الاسترجاع والاستبدال", url: "/return-policy" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <ReturnPolicyClient company={company} />
    </>
  );
}
