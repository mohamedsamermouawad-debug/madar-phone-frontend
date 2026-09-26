import type { Metadata } from "next";
import CategorySlugPage, { generateMetadata as generateSlugMetadata } from "../[slug]/page";

export async function generateMetadata(): Promise<Metadata> {
  return generateSlugMetadata({ params: Promise.resolve({ slug: "playstation" }) });
}

export default async function PlaystationPage() {
  return <CategorySlugPage params={Promise.resolve({ slug: "playstation" })} />;
}
