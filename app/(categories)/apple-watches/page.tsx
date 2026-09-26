import type { Metadata } from "next";
import CategorySlugPage, { generateMetadata as generateSlugMetadata } from "../[slug]/page";

export async function generateMetadata(): Promise<Metadata> {
  return generateSlugMetadata({ params: Promise.resolve({ slug: "se" }) });
}

export default async function AppleWatchesPage() {
  return <CategorySlugPage params={Promise.resolve({ slug: "se" })} />;
}
