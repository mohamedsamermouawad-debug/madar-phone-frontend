import { NextRequest, NextResponse } from "next/server";

function detectMimeType(buffer: Uint8Array, url: string): { mimeType: string; isPdf: boolean; isImage: boolean; ext: string } {
  // Check PDF signature: %PDF (0x25 0x50 0x44 0x46)
  if (buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { mimeType: "application/pdf", isPdf: true, isImage: false, ext: "pdf" };
  }

  // Check PNG signature: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { mimeType: "image/png", isPdf: false, isImage: true, ext: "png" };
  }

  // Check JPEG signature: 0xFF 0xD8 0xFF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mimeType: "image/jpeg", isPdf: false, isImage: true, ext: "jpg" };
  }

  // Check GIF signature: GIF87a or GIF89a (0x47 0x49 0x46 0x38)
  if (buffer.length >= 4 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return { mimeType: "image/gif", isPdf: false, isImage: true, ext: "gif" };
  }

  // Check WebP signature: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { mimeType: "image/webp", isPdf: false, isImage: true, ext: "webp" };
  }

  // Fallback to URL extension or default to PDF
  const lower = url.toLowerCase();
  if (lower.endsWith(".png")) return { mimeType: "image/png", isPdf: false, isImage: true, ext: "png" };
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return { mimeType: "image/jpeg", isPdf: false, isImage: true, ext: "jpg" };
  if (lower.endsWith(".webp")) return { mimeType: "image/webp", isPdf: false, isImage: true, ext: "webp" };
  if (lower.endsWith(".svg")) return { mimeType: "image/svg+xml", isPdf: false, isImage: true, ext: "svg" };

  return { mimeType: "application/pdf", isPdf: true, isImage: false, ext: "pdf" };
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("missing url", { status: 400 });

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  // Security: only allow from trusted Cloudinary domains or same-origin
  if (!parsedUrl.hostname.endsWith("cloudinary.com") && !parsedUrl.hostname.endsWith(req.nextUrl.hostname)) {
    return new NextResponse("Forbidden domain", { status: 403 });
  }

  // Remove attachment force flag if present
  const cleanUrl = url
    .replace(/\/fl_attachment:[^/]+\//, "/")
    .replace(/\/fl_attachment\//, "/");

  return NextResponse.redirect(cleanUrl, {
    status: 307,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
    },
  });
}
