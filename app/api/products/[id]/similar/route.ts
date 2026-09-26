import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await fetch(`${BACKEND}/api/products/${id}/similar${req.nextUrl.search}`, {
      next: { revalidate: 60, tags: ["products"] },
    });
    if (!res.ok) {
      return NextResponse.json([], { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Similar products API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
