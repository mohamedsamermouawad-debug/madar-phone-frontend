import Link from "next/link";
import Image from "next/image";

const categories = [
  { name: "التابلت", desc: "أجهزة لوحية مثالية للعمل والترفيه", href: "/tablets/ipad-pro", image: "/taplet.webp", glow: "rgba(139,92,246,0.25)" },
  { name: "الهواتف الذكية", desc: "أحدث الهواتف بأفضل الأسعار", href: "/smartphones", image: "/iphone17.webp", glow: "rgba(59,130,246,0.25)" },
  // { name: "اللابتوب", desc: "قوة وأداء في كل مكان تذهب إليه", href: "/laptops/macbook-pro", image: "/mac.webp", glow: "rgba(100,116,139,0.25)" },
  { name: "الساعات الذكية", desc: "ابق متصلاً وتتبع صحتك بأناقة", href: "/smart-watches/smart-watches", image: "/watch.webp", glow: "rgba(244,63,94,0.25)" },
  { name: "السماعات", desc: "صوت نقي وتجربة استماع لا مثيل لها", href: "/audio/airpods-pro", image: "/audio.webp", glow: "rgba(245,158,11,0.25)" },
  // { name: "الألعاب", desc: "عالم من المتعة والإثارة بين يديك", href: "/games/ps5-games", image: "/game.webp", glow: "rgba(16,185,129,0.25)" },
  // { name: "الاكسسورات", desc: "كل ما تحتاجه لإكمال تجربتك التقنية", href: "/accessories/anker-batteries", image: "/acc.webp", glow: "rgba(20,184,166,0.25)" },
];

const iphone18Card = {
  name: "ايفون 18",
  badge: "جاهز للطلب الآن",
  href: "/smartphones/iphone-18",
  image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789095298/34ab662e-de1b-4359-9d99-43e2ba54678f_1.webp",
  glow: "rgba(99,102,241,0.35)",
};

function CardContent({ cat, wide }: { cat: typeof categories[0]; wide?: boolean }) {
  return (
    <div className="relative p-3 sm:p-4 lg:p-5 flex flex-col gap-1 sm:gap-2 bg-gradient-to-t from-black/60 via-black/10 to-transparent">
      <h3 className={`text-white font-black leading-tight ${wide ? "text-base sm:text-xl lg:text-2xl" : "text-sm sm:text-base lg:text-lg"}`}>
        {cat.name}
      </h3>
      <p className={`text-white/70 leading-snug ${wide ? "text-xs sm:text-sm lg:text-base" : "text-[10px] sm:text-xs"}`}>
        {cat.desc}
      </p>
      <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-white backdrop-blur-sm border border-white/20 text-black text-[10px] sm:text-xs font-bold w-fit group-hover:bg-white group-hover:text-gray-900 transition-all duration-300 mt-1">
        تسوق الآن
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2.5 h-2.5 sm:w-3 sm:h-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </span>
    </div>
  );
}

export default function StaticCategories() {
  const first = categories[0];
  const last = categories[categories.length - 1];
  const middle = categories.slice(1, categories.length - 1);

  return (
    <section dir="rtl" className="w-full py-8 sm:py-12 lg:py-16 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-6 sm:mb-10 lg:mb-14">
          <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-widest text-teal-300 border border-teal-400/40 bg-teal-400/10 mb-3 sm:mb-4">
            🛍️ تسوق حسب الأقسام
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white leading-tight">
            اختر القسم
            <span className="block bg-gradient-to-l from-teal-400 to-cyan-300 bg-clip-text text-transparent">
              المناسب لك
            </span>
          </h2>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5">

          {/* أول كارد — بالعرض */}
          <Link
            href={first.href}
            className="group relative overflow-hidden rounded-2xl lg:rounded-3xl w-full aspect-[16/6] sm:aspect-[16/5] flex flex-col justify-end cursor-pointer"
            style={{ boxShadow: `0 4px 24px ${first.glow}` }}
          >
            <Image src={first.image} alt={first.name} fill sizes="(max-width: 768px) 100vw, 1200px" className="object-cover object-center transition-transform duration-700 group-hover:scale-105" />
            <CardContent cat={first} wide />
          </Link>

          {/* الكاردات الوسطى — بالطول */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {/* كارد ايفون 18 */}
            <Link
              href={iphone18Card.href}
              className="group relative overflow-hidden rounded-2xl lg:rounded-3xl aspect-[3/4] flex flex-col justify-end cursor-pointer"
              style={{ boxShadow: `0 4px 24px ${iphone18Card.glow}` }}
            >
              <Image src={iphone18Card.image} alt={iphone18Card.name} fill sizes="(max-width: 640px) 50vw, 300px" className="object-cover object-center" />
              {/* Badge */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 2px 10px rgba(99,102,241,0.5)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {iphone18Card.badge}
                </span>
              </div>
              <div className="relative p-3 sm:p-4 lg:p-5 flex flex-col gap-1 sm:gap-2 bg-gradient-to-t from-black/60 via-black/10 to-transparent">
                <h3 className="text-white font-black leading-tight text-sm sm:text-base lg:text-lg">{iphone18Card.name}</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-white backdrop-blur-sm border border-white/20 text-black text-[10px] sm:text-xs font-bold w-fit group-hover:bg-white group-hover:text-gray-900 transition-all duration-300 mt-1">
                  احجز الآن
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2.5 h-2.5 sm:w-3 sm:h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </span>
              </div>
            </Link>
            {middle.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="group relative overflow-hidden rounded-2xl lg:rounded-3xl aspect-[3/4] flex flex-col justify-end cursor-pointer"
                style={{ boxShadow: `0 4px 24px ${cat.glow}` }}
              >
                <Image src={cat.image} alt={cat.name} fill sizes="(max-width: 640px) 50vw, 300px" className="object-cover object-center transition-transform duration-700 group-hover:scale-105" />
                <CardContent cat={cat} />
              </Link>
            ))}
          </div>

          {/* آخر كارد — بالعرض */}
          <Link
            href={last.href}
            className="group relative overflow-hidden rounded-2xl lg:rounded-3xl w-full aspect-[16/6] sm:aspect-[16/5] flex flex-col justify-end cursor-pointer"
            style={{ boxShadow: `0 4px 24px ${last.glow}` }}
          >
            <Image src={last.image} alt={last.name} fill sizes="(max-width: 768px) 100vw, 1200px" className="object-cover object-center transition-transform duration-700 group-hover:scale-105" />
            <CardContent cat={last} wide />
          </Link>

        </div>
      </div>
    </section>
  );
}
