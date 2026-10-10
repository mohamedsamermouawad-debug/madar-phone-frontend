export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src || typeof src !== "string") return "";

  // Pass-through for local static assets, SVG, data URLs, or non-Cloudinary images
  if (
    src.startsWith("/") ||
    src.startsWith("data:") ||
    src.endsWith(".svg") ||
    !src.includes("cloudinary.com") ||
    !src.includes("/upload/")
  ) {
    return src;
  }

  const q = quality || "auto";
  const transform = `f_auto,q_${q},w_${width},c_limit`;

  // Clean any previous transformation segment right after /upload/
  const cleaned = src.replace(/\/upload\/(?:[a-zA-Z0-9]+_[^/]+(?:\/)?)+/, "/upload/");
  return cleaned.replace("/upload/", `/upload/${transform}/`);
}
