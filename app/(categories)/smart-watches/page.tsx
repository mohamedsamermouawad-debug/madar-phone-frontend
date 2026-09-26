import type { Metadata } from "next";
import CategorySlugPage, { generateMetadata as generateSlugMetadata } from "../[slug]/page";

export async function generateMetadata(): Promise<Metadata> {
  return generateSlugMetadata({ params: Promise.resolve({ slug: "smart-watches" }) });
}

export default async function SmartWatchesPage() {
  return <CategorySlugPage params={Promise.resolve({ slug: "smart-watches" })} />;
}
