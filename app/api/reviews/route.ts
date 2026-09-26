import { NextRequest, NextResponse } from "next/server";
import { getBackend } from "../admin/_lib";

export async function GET() {
  try {
    const res = await fetch(`${getBackend()}/api/admin/reviews`, {
      next: { revalidate: 600, tags: ["reviews"] },
    });
    const data = await res.json();
    return NextResponse.json(data, {
      status: res.status,
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200" },
    });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${getBackend()}/api/admin/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
