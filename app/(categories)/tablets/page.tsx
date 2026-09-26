import type { Metadata } from "next";
import CategorySlugPage, { generateMetadata as generateSlugMetadata } from "../[slug]/page";

export async function generateMetadata(): Promise<Metadata> {
  return generateSlugMetadata({ params: Promise.resolve({ slug: "ipad-air" }) });
}

export default async function TabletsPage() {
  return <CategorySlugPage params={Promise.resolve({ slug: "ipad-air" })} />;
}
