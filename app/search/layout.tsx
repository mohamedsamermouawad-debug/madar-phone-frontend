import type { Metadata } from "next";
import { SITE_URL } from "../lib/seo";

export const metadata: Metadata = {
  title: "البحث في المنتجات | مدار للإلكترونيات",
  description: "ابحث عن أحدث الجوالات، اللابتوبات، والساعات الذكية والإكسسوارات في متجر مدار للإلكترونيات.",
  alternates: { canonical: `${SITE_URL}/search` },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
