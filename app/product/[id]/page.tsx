import type { Metadata } from "next";
import ProductPageClient from "./ProductPageClient";
import { getProductById, getSimilarProducts } from "../../lib/productsCache";
import { getCompanyData } from "../../lib/companyCache";
import type { Product } from "../../components/products/types";
import { SITE_URL, DEFAULT_OG_IMAGE, getFullImageUrl, getBreadcrumbJsonLd } from "../../lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const [product, company] = await Promise.all([getProductById(id), getCompanyData()]);

  const siteName = company?.nameAr || "مدار للإلكترونيات";

  if (!product) {
    return {
      title: `المنتج غير متوفر | ${siteName}`,
      description: `عذراً، المنتج المطلوب غير متوفر حالياً في متجر ${siteName}.`,
    };
  }

  const title = product.name;
  const parts: string[] = [];
  if (product.brand) parts.push(product.brand);
  if (product.storage) parts.push(product.storage);
  if (product.color) parts.push(product.color);
  if (product.salePrice || product.price) {
    const price = product.salePrice || product.price;
    parts.push(`${price} ريال`);
  }
  if (product.installment?.available) parts.push("بالأقساط المريحة");

  const description = product.description
    ? product.description.slice(0, 160)
    : `اشتري ${title}${parts.length ? " - " + parts.join(" | ") : ""} من متجر ${siteName} بأفضل سعر مع تقسيط مريح بدون فوائد وشحن سريع لكافة مدن السعودية.`;

  const rawImg = product.images?.[0] || product.image || "";
  const imageUrl = getFullImageUrl(rawImg);

  const productKeywords = [
    product.name,
    product.brand || "",
    product.category || "",
    product.subCategory || "",
    "تقسيط",
    "شراء بالتقسيط",
    "سعر " + product.name,
    "عروض " + (product.brand || "جوالات"),
    siteName,
    "السعودية",
  ].filter(Boolean);

  return {
    title: `${title} - اشتري الآن بالتقسيط بأفضل سعر`,
    description,
    keywords: productKeywords,
    openGraph: {
      type: "website",
      url: `${SITE_URL}/product/${id}`,
      title: `${title} | ${siteName}`,
      description,
      siteName,
      locale: "ar_SA",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: `${title} - ${siteName}`,
        },
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${siteName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `${SITE_URL}/product/${id}`,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, company] = await Promise.all([
    getProductById(id),
    getCompanyData(),
  ]);

  let initialSimilar: Product[] = [];
  if (product) {
    initialSimilar = await getSimilarProducts(id, product.category, product.subCategory, 8);
  }

  const siteName = company?.nameAr || "مدار للإلكترونيات";
  const price = product?.salePrice || product?.price || 0;
  const rawImg = product?.images?.[0] || product?.image || "";
  const imageUrl = getFullImageUrl(rawImg);

  const productJsonLd = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/product/${id}#product`,
    name: product.name,
    description: product.description || `اشتري ${product.name} من ${siteName} بأفضل سعر وتقسيط بدون فوائد.`,
    image: [imageUrl],
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    category: product.category || product.subCategory || "Electronics",
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${id}`,
      priceCurrency: "SAR",
      price: price,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: siteName,
        url: SITE_URL,
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "SA",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  } : null;

  const breadcrumbsJsonLd = product ? getBreadcrumbJsonLd([
    { name: "الرئيسية", url: "/" },
    { name: product.category || "المتجر", url: "/store" },
    { name: product.name, url: `/product/${id}` },
  ]) : null;

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      {breadcrumbsJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
        />
      )}
      <ProductPageClient key={id} id={id} initialProduct={product} initialSimilar={initialSimilar} />
    </>
  );
}
