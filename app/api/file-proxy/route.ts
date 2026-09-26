import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("missing url", { status: 400 });

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  // Security: only proxy from trusted Cloudinary domains
  if (!parsedUrl.hostname.endsWith("cloudinary.com")) {
    return new NextResponse("Forbidden domain", { status: 403 });
  }

  const fetchUrl = url
    .replace("/image/upload/", "/raw/upload/")
    .replace(/\/fl_attachment:[^/]+\//, "/");

  try {
    const res = await fetch(fetchUrl, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return new NextResponse("failed to fetch file", { status: res.status });

    const contentType = res.headers.get("content-type") || "application/pdf";
    const contentLength = res.headers.get("content-length");

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
    };
    if (contentLength) {
      headers["Content-Length"] = contentLength;
    }

    return new NextResponse(res.body as any, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("file-proxy error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
