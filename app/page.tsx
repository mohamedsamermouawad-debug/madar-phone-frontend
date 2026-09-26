import HeroSection from "./components/HeroSection";
import MarqueeBar from "./components/MarqueeBar";
import ShopByCategory from "./components/ShopByCategory";
import HomeCategorySections from "./components/HomeCategorySections";

import CustomerReviews from "./components/CustomerReviews";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <MarqueeBar />
      <ShopByCategory />
      <HomeCategorySections />
      <CustomerReviews />
    </main>
  );
}
