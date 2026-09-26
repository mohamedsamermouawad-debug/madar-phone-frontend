import BannerSlider from "./BannerSlider";

const API = process.env.BACKEND_URL || "http://localhost:5000";

export default async function Banner() {
  let images: string[] = [];

  try {
    const res = await fetch(`${API}/api/admin/banners`, { next: { revalidate: 60 } });
    const data: { url: string; active: boolean }[] = await res.json();
    if (Array.isArray(data))
      images = data.filter((b) => b.url && b.active).map((b) => b.url.startsWith("http") ? b.url : `${API}${b.url}`);
  } catch {
    images = ["/banner1.webp", "/banner2.webp"];
  }

  if (!images.length) return (
    <section className="w-full flex justify-center px-3 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-3xl bg-gray-100" style={{ aspectRatio: "2/1" }} />
    </section>
  );

  return <BannerSlider images={images} />;
}
