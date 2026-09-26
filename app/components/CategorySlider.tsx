import Image from "next/image";
import Link from "next/link";

type Category = { name: string; count: number; image: string; href: string };

export default function CategorySlider({ categories }: { categories: Category[] }) {
  const repeated = [...categories, ...categories, ...categories];

  return (
    <div className="w-full overflow-hidden" dir="ltr">
      <div className="flex gap-5 sm:gap-7 category-track">
        {repeated.map((cat, i) => (
          <Link
            key={`${cat.name}-${i}`}
            href={cat.href}
            className="flex-shrink-0 flex flex-col items-center gap-2 group"
            style={{ direction: "rtl" }}
            draggable={false}
          >
            {/* دائرة */}
            <div
              className="relative rounded-full overflow-hidden transition-transform duration-200 group-hover:scale-[1.07]"
              style={{
                width: 70,
                height: 70,
                background: "linear-gradient(145deg, #F0F7FB, #E8F2F8)",
                border: "2.5px solid #D4E8F2",
                boxShadow: "0 2px 8px rgba(8,137,162,0.08)",
                flexShrink: 0,
              }}
            >
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-contain p-[10px]"
                  sizes="70px"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
              )}
            </div>

            {/* اسم */}
            <p
              className="font-bold text-center leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-[#0889A2]"
              style={{
                fontSize: 10.5,
                maxWidth: 74,
                color: "#003048",
              }}
            >
              {cat.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
