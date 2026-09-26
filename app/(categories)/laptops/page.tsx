import type { Metadata } from "next";
import CategorySlugPage, { generateMetadata as generateSlugMetadata } from "../[slug]/page";

export async function generateMetadata(): Promise<Metadata> {
  return generateSlugMetadata({ params: Promise.resolve({ slug: "macbook-air" }) });
}

export default async function LaptopsPage() {
  return <CategorySlugPage params={Promise.resolve({ slug: "macbook-air" })} />;
}
