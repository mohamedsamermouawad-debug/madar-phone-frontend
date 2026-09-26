export interface SlugConfig {
  label: string;
  parentLabel: string;
  parentHref: string;
  /** صور الهيرو — حطها هنا لكل صفحة (مسار من /public أو رابط خارجي) */
  heroImages?: string[];
  filters: {
    brand?: string;
    category?: string;
    nameIncludes?: string[];
    nameExcludes?: string[];
  };
}

export const slugConfigs: Record<string, SlugConfig> = {
  // ─── Smartphones ───────────────────────────────────────────
  "iphone-13-pro-max": {
    label: "آيفون 13 برو ماكس",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
    filters: { category: "ابل ايفون 13 برو ماكس" },
  },
  "iphone-14-pro-max": {
    label: "آيفون 14 برو ماكس",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
    filters: { category: "ابل ايفون 14 برو ماكس" },
  },
  "iphone-14-pro": {
    label: "آيفون 14 برو",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
    filters: { category: "ابل ايفون 14 برو" },
  },
  "iphone-14-plus": {
    label: "آيفون 14 بلس",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
    filters: { category: "ابل ايفون 14 بلس" },
  },
  "iphone-14": {
    label: "آيفون 14 عادي",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
    filters: { category: "ابل ايفون 14" },
  },
  "iphone-15-pro-max": {
    label: "آيفون 15 برو ماكس",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
    filters: { category: "ابل ايفون 15 برو ماكس" },
  },
  "iphone-15-pro": {
    label: "آيفون 15 برو",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
    filters: { category: "ابل ايفون 15 برو" },
  },
  "iphone-15-plus": {
    label: "آيفون 15 بلس",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
    filters: { category: "ابل ايفون 15 بلس" },
  },
  "iphone-15": {
    label: "آيفون 15 عادي",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
    filters: { category: "ابل ايفون 15" },
  },
  "iphone-16-pro-max": {
    label: "ابل ايفون 16 برو ماكس",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
        heroImages: ["https://res.cloudinary.com/dllmx2yf3/image/upload/v1790395503/ChatGPT_Image_Sep_26_2026_07_03_56_AM_ryg8k1.webp"],

    filters: { category: "ابل ايفون 16 برو ماكس" },
  },
  "iphone-16-pro": {
    label: "ايفون 16 برو",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
        heroImages: ["https://res.cloudinary.com/dllmx2yf3/image/upload/v1790395597/ChatGPT_Image_Sep_26_2026_07_05_52_AM_cnclyr.webp"],

    filters: { category: "ايفون 16 برو" },
  },
  "iphone-16-plus": {
    label: "ايفون 16 بلس",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
        heroImages: ["https://res.cloudinary.com/dllmx2yf3/image/upload/v1790395698/ChatGPT_Image_Sep_26_2026_07_07_36_AM_mjvrwm.webp"],

    filters: { brand: "Apple", nameIncludes: ["iphone 16 plus", "ايفون 16 بلس", "آيفون 16 بلس"] },
  },
  "iphone-16": {
    label: "ايفون 16 عادي",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
        heroImages: ["https://res.cloudinary.com/dllmx2yf3/image/upload/v1790396215/ChatGPT_Image_Sep_26_2026_07_15_56_AM_vtyiom.webp"],
    filters: { category: "ايفون 16" },
  },
  "iphone-17-pro-max": {
    label: "أبل آيفون 17 برو ماكس",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
        heroImages: ["https://res.cloudinary.com/dllmx2yf3/image/upload/v1790393968/ChatGPT_Image_Sep_26_2026_06_35_11_AM_bnfx0c.webp"],

    filters: { category: "أبل آيفون 17 برو ماكس" },
  },
  "iphone-17-pro": {
    label: "أبل آيفون 17 برو",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
        heroImages: ["https://res.cloudinary.com/dllmx2yf3/image/upload/v1790394204/ChatGPT_Image_Sep_26_2026_06_41_27_AM_omipgs.webp"],
    filters: { category: "ابل ايفون 17 برو" },
  },
  "iphone-17": {
    label: "أبل آيفون 17 عادي",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
        heroImages: ["https://res.cloudinary.com/dllmx2yf3/image/upload/v1790395209/ChatGPT_Image_Sep_26_2026_06_59_48_AM_qwac8k.webp"],

    filters: { category: "أبل ايفون 17" },
  },
  "iphone-17-air": {
    label: "أبل آيفون 17 Air",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
        heroImages: ["https://res.cloudinary.com/dllmx2yf3/image/upload/v1790395065/ChatGPT_Image_Sep_26_2026_06_57_16_AM_rie7zk.webp"],

    filters: { category: "ابل ايفون 17 اير" },
  },
  "iphone-18": {
    label: "أبل آيفون 18",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
    heroImages: ["https://res.cloudinary.com/dllmx2yf3/image/upload/v1790390257/ChatGPT_Image_Sep_26_2026_05_36_55_AM_ymv3ck.webp"],

    filters: { category: "ابل ايفون 18" },
  },
  "iphone-18-pro-max": {
    label: "آيفون 18 برو ماكس",
    parentLabel: "آيفون 18",
    parentHref: "/store",
    heroImages: ["https://res.cloudinary.com/dllmx2yf3/image/upload/v1790390257/ChatGPT_Image_Sep_26_2026_05_36_55_AM_ymv3ck.webp"],
    filters: { category: "ابل ايفون 18 برو ماكس" },
  },
  "iphone-18-pro": {
    label: "آيفون 18 برو",
    parentLabel: "آيفون 18",
    parentHref: "/store",
    heroImages: ["https://res.cloudinary.com/dllmx2yf3/image/upload/v1790391124/ChatGPT_Image_Sep_26_2026_05_40_18_AM_fqib1q.webp"],

    filters: { category: "ابل ايفون 18 برو " },
  },
  "iphone-18-standard": {
    label: "آيفون 18 عادي",
    parentLabel: "آيفون 18",
    parentHref: "/store",
    heroImages: ["  https://res.cloudinary.com/dllmx2yf3/image/upload/v1790392798/ChatGPT_Image_Sep_26_2026_06_19_04_AM_rxhim4.webp"],

    filters: { category: "ابل ايفون 18 دو" },
  },
  "apple-only": {
    label: "فقط آبل",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
    filters: { brand: "Apple" },
  },
  "samsung-s22-ultra": {
    label: "سامسونج جالكسي اس 22 الترا",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
    filters: { category: "سامسونج جالاكسي S22" },
  },
  "samsung-s23-ultra": {
    label: "سامسونج جالكسي اس 23 الترا",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
    filters: { category: "سامسونج جلاكسي S23 الترا" },
  },
  "samsung-s24-ultra": {
    label: "سامسونج جالكسي اس 24 الترا",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
    filters: { category: "سامسونج جالاكسي S24" },
  },
  "samsung-s25-ultra": {
    label: "سامسونج جالكسي اس 25 الترا",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
        heroImages: [" https://res.cloudinary.com/dllmx2yf3/image/upload/v1790396501/ChatGPT_Image_Sep_26_2026_07_20_57_AM_ntzni8.webp"],
    filters: { category: "سامسونج جالاكسي S25" },
  },
  "samsung-s26-ultra": {
    label: "سامسونج جالكسي اس 26 الترا",
    parentLabel: "الهواتف الذكية",
    parentHref: "/store",
        heroImages: [" https://res.cloudinary.com/dllmx2yf3/image/upload/v1790396376/ChatGPT_Image_Sep_26_2026_07_18_09_AM_eq2kj0.webp"],

    filters: { category: "سامسونج جالاكسي S26" },
  },

  // ─── Apple Watches ─────────────────────────────────────────
  se: {
    label: "آبل ووتش SE",
    parentLabel: "ساعات ابل",
    parentHref: "/apple-watches",
    
    filters: { category: "ساعات ابل" },
  },

  // ─── Smart Watches ─────────────────────────────────────────
  "smart-watches": {
    label: "الساعات الذكية",
    parentLabel: "الساعات الذكية",
    parentHref: "/smart-watches",
    filters: { category: "ساعات ذكية" },
            heroImages: ["https://res.cloudinary.com/dllmx2yf3/image/upload/v1790396923/ChatGPT_Image_Sep_26_2026_07_27_56_AM_mjmlpc.webp"],
  },

  // ─── Audio ─────────────────────────────────────────────────
  "airpods-pro": {
    label: "سماعات أبل",
    parentLabel: "أجهزة صوت و سماعات",
    parentHref: "/audio",
            heroImages: [" https://res.cloudinary.com/dllmx2yf3/image/upload/v1790396501/ChatGPT_Image_Sep_26_2026_07_20_57_AM_ntzni8.webp"],

    filters: { category: "سماعات ابل" },
  },
  "airpods-max": {
    label: "سماعات سبيكر",
    parentLabel: "أجهزة صوت و سماعات",
    parentHref: "/audio",
    filters: { category: "speaker" },
  },
  "samsung-buds": {
    label: "سماعات متنوعة",
    parentLabel: "أجهزة صوت و سماعات",
    parentHref: "/audio",
    filters: { category: "earbuds" },
  },

  // ─── PlayStation ───────────────────────────────────────────
  ps5: {
    label: "بلاي ستيشن 5",
    parentLabel: "أجهزة بلاي ستيشن",
    parentHref: "/playstation",
            heroImages: [" https://res.cloudinary.com/dllmx2yf3/image/upload/v1790396501/ChatGPT_Image_Sep_26_2026_07_20_57_AM_ntzni8.webp"],

    filters: { category: "ps5" },
  },
  "ps5-slim": {
    label: "بلاي ستيشن 4",
    parentLabel: "أجهزة بلاي ستيشن",
    parentHref: "/playstation",
    filters: { category: "ps4" },
  },
  "xbox-one": {
    label: "أكس بوكس ون",
    parentLabel: "أجهزة بلاي ستيشن",
    parentHref: "/playstation",
    filters: { category: "xbox" },
  },
  controllers: {
    label: "يد تحكم",
    parentLabel: "أجهزة بلاي ستيشن",
    parentHref: "/playstation",
    filters: { category: "controller" },
  },
  "ps-accessories": {
    label: "ملحقات بلاي ستيشن",
    parentLabel: "أجهزة بلاي ستيشن",
    parentHref: "/playstation",
    filters: { category: "gaming-accessories" },
  },
  accessories: {
    label: "ملحقات بلاي ستيشن",
    parentLabel: "أجهزة بلاي ستيشن",
    parentHref: "/playstation",
    filters: { category: "gaming-accessories" },
  },

  // ─── Laptops ───────────────────────────────────────────────
  "macbook-pro": {
    label: "لابتوبات أبل",
    parentLabel: "لابتوبات وشاشات",
    parentHref: "/laptops",
            heroImages: [" https://res.cloudinary.com/dllmx2yf3/image/upload/v1790396501/ChatGPT_Image_Sep_26_2026_07_20_57_AM_ntzni8.webp"],

    filters: { category: "laptop" },
  },
  "macbook-air": {
    label: "ماك بوك اير",
    parentLabel: "لابتوبات وشاشات",
    parentHref: "/laptops",
            heroImages: [" https://res.cloudinary.com/dllmx2yf3/image/upload/v1790396501/ChatGPT_Image_Sep_26_2026_07_20_57_AM_ntzni8.webp"],

    filters: { brand: "Apple", nameIncludes: ["macbook air", "ماك بوك اير", "ماك بوك إير"] },
  },
  "samsung-monitors": {
    label: "شاشات سامسونج",
    parentLabel: "لابتوبات وشاشات",
    parentHref: "/laptops",
    filters: { category: "monitor" },
  },

  // ─── Tablets ───────────────────────────────────────────────
  "ipad-pro": {
    label: "أبل",
    parentLabel: "الاجهزة اللوحية ايبادات",
    parentHref: "/tablets",
            heroImages: [" https://res.cloudinary.com/dllmx2yf3/image/upload/v1790396501/ChatGPT_Image_Sep_26_2026_07_20_57_AM_ntzni8.webp"],

    filters: { category: "tablet" },
  },
  "ipad-air": {
    label: "ايبادات ابل",
    parentLabel: "الاجهزة اللوحية ايبادات",
    parentHref: "/tablets",
            heroImages: [" https://res.cloudinary.com/dllmx2yf3/image/upload/v1790396501/ChatGPT_Image_Sep_26_2026_07_20_57_AM_ntzni8.webp"],

    filters: { brand: "Apple", category: "tablet" },
  },

  // ─── Accessories ───────────────────────────────────────────
  "anker-batteries": {
    label: "بطاريات متنقلة",
    parentLabel: "بطاريات متنقلة وكيابل",
    parentHref: "/accessories",
    filters: { category: "بطاريات متنقله" },
  },

  // ─── Games ─────────────────────────────────────────────────
  "ps5-games": {
    label: "ألعاب الفيديو",
    parentLabel: "ألعاب الفيديو",
    parentHref: "/games",
    filters: { category: "gaming" },
  },
  "mice-keyboards": {
    label: "ماوسات وكيبوردات ألعاب",
    parentLabel: "ألعاب الفيديو",
    parentHref: "/games",
    filters: { category: "mice-keyboards" },
  },
  microphones: {
    label: "مايكروفونات",
    parentLabel: "ألعاب الفيديو",
    parentHref: "/games",
    filters: { category: "microphone" },
  },
  figures: {
    label: "مجسمات وفيقرز",
    parentLabel: "ألعاب الفيديو",
    parentHref: "/games",
    filters: { category: "figures" },
  },
  "rgb-lighting": {
    label: "اضاءات RGB",
    parentLabel: "ألعاب الفيديو",
    parentHref: "/games",
    filters: { category: "rgb" },
  },
};

export const categoryHrefMap: Record<string, string> = {
  "الهواتف الذكية": "/smartphones",
  "ابل ايفون 18 برو ماكس": "/smartphones/iphone-18-pro-max",
  "ابل ايفون 18 برو ": "/smartphones/iphone-18-pro",
  "ابل ايفون 18 برو": "/smartphones/iphone-18-pro",
  "ابل ايفون 18 دو": "/smartphones/iphone-18-standard",
  "ابل ايفون 18": "/smartphones/iphone-18",
  "ابل ايفون 17 برو ماكس": "/smartphones/iphone-17-pro-max",
  "أبل آيفون 17 برو ماكس": "/smartphones/iphone-17-pro-max",
  "ابل ايفون 17 برو": "/smartphones/iphone-17-pro",
  "أبل آيفون 17 برو": "/smartphones/iphone-17-pro",
  "ابل ايفون 17 اير": "/smartphones/iphone-17-air",
  "أبل آيفون 17 اير": "/smartphones/iphone-17-air",
  "ابل ايفون 17": "/smartphones/iphone-17",
  "أبل آيفون 17": "/smartphones/iphone-17",
  "ابل ايفون 16 برو ماكس": "/smartphones/iphone-16-pro-max",
  "ابل ايفون 16 برو": "/smartphones/iphone-16-pro",
  "ابل ايفون 16 بلس": "/smartphones/iphone-16-plus",
  "ابل ايفون 16": "/smartphones/iphone-16",
  "ابل ايفون 15 برو ماكس": "/smartphones/iphone-15-pro-max",
  "ابل ايفون 15 برو": "/smartphones/iphone-15-pro",
  "ابل ايفون 15 بلس": "/smartphones/iphone-15-plus",
  "ابل ايفون 15": "/smartphones/iphone-15",
  "ابل ايفون 14 برو ماكس": "/smartphones/iphone-14-pro-max",
  "ابل ايفون 14 برو": "/smartphones/iphone-14-pro",
  "سامسونج جالاكسي S26": "/smartphones/samsung-s26-ultra",
  "سامسونج جالاكسي S25": "/smartphones/samsung-s25-ultra",
  "سامسونج جالاكسي S24": "/smartphones/samsung-s24-ultra",
  "سامسونج جالاكسي S23": "/smartphones/samsung-s23-ultra",
  "سامسونج جلاكسي S23 الترا": "/smartphones/samsung-s23-ultra",
  "سامسونج جالاكسي S22": "/smartphones/samsung-s22-ultra",
  "ساعات ذكية": "/smart-watches/smart-watches",
  "الساعات الذكية": "/smart-watches/smart-watches",
  "ساعات ابل": "/apple-watches/se",
  "ساعات أبل": "/apple-watches/se",
  "سماعات ابل": "/audio/airpods-pro",
  "سماعات أبل": "/audio/airpods-pro",
  "أجهزة صوت و سماعات": "/audio/airpods-pro",
  "أجهزة صوت وسماعات": "/audio/airpods-pro",
  "أجهزة بلاي ستيشن": "/playstation/ps5",
  "بلاي ستيشن": "/playstation/ps5",
  "لابتوبات وشاشات": "/laptops/macbook-pro",
  "لابتوبات": "/laptops/macbook-pro",
  "الاجهزة اللوحية ايبادات": "/tablets/ipad-pro",
  "الأجهزة اللوحية": "/tablets/ipad-pro",
  "بطاريات متنقلة وكيابل": "/accessories/anker-batteries",
  "بطاريات متنقله": "/accessories/anker-batteries",
  "ملحقات": "/accessories/anker-batteries",
  "ألعاب الفيديو": "/games/ps5-games",
  "العاب": "/games/ps5-games",
};

export function resolveCategoryHref(name: string): string {
  if (categoryHrefMap[name]) return categoryHrefMap[name];
  const lower = name.toLowerCase();
  const match = Object.entries(categoryHrefMap)
    .filter(([k]) => {
      const kl = k.toLowerCase();
      return lower.includes(kl) || kl.includes(lower);
    })
    .sort((a, b) => b[0].length - a[0].length)[0];
  return match?.[1] ?? "/store";
}

export function filterProducts<T extends { brand?: string; category?: string; name?: string }>(products: T[], slug: string): T[] {
  const config = slugConfigs[slug];
  if (!config) return products;
  const { brand, category, nameIncludes, nameExcludes } = config.filters;
  return products.filter((p) => {
    const matchBrand = brand ? p.brand?.toLowerCase() === brand.toLowerCase() : true;
    const matchCategory = category ? p.category === category : true;
    const matchName = nameIncludes?.length
      ? nameIncludes.some((kw) => p.name?.toLowerCase().includes(kw.toLowerCase()))
      : true;
    const matchExclude = nameExcludes?.length
      ? !nameExcludes.some((kw) => p.name?.toLowerCase().includes(kw.toLowerCase()))
      : true;
    return matchBrand && matchCategory && matchName && matchExclude;
  });
}


