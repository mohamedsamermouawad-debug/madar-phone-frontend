import HeroSection from "./components/HeroSection";
import MarqueeBar from "./components/MarqueeBar";
import ShopByCategory from "./components/ShopByCategory";
import HomeCategorySections from "./components/HomeCategorySections";
import CustomerReviews from "./components/CustomerReviews";
import { getPublicReviews } from "./lib/productsCache";

export const revalidate = 86400; // 24 hours (updated instantly on-demand via admin revalidation)

export default async function Home() {
  const reviews = await getPublicReviews();

  return (
    <main>
      <HeroSection />
      <MarqueeBar />
      <ShopByCategory />
      <HomeCategorySections />
      <CustomerReviews initialReviews={reviews} />
    </main>
  );
}
