export function getOptimizedImageUrl(
  url?: string,
  options?: { width?: number; height?: number; quality?: string | number; fit?: string }
): string {
  if (!url || typeof url !== "string") return "";
  if (!url.includes("cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  const { width, height, quality = "auto", fit = "fit" } = options || {};
  const transformations: string[] = ["f_auto", `q_${quality}`];

  if (width && height) {
    transformations.push(`w_${width}`, `h_${height}`, `c_${fit}`);
  } else if (width) {
    transformations.push(`w_${width}`);
  } else if (height) {
    transformations.push(`h_${height}`);
  }

  const transformString = transformations.join(",");
  return url.replace("/upload/", `/upload/${transformString}/`);
}
