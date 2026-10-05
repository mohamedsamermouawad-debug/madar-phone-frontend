import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${BACKEND}/api/products${req.nextUrl.search}`, {
      next: { revalidate: 30, tags: ["products"] },
    });
    if (!res.ok) {
      return NextResponse.json([], { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

