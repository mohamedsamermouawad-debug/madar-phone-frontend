import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../_lib";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.toString();
  const url = `${getBackend()}/api/admin/orders${query ? `?${query}` : ""}`;
  const res = await fetch(url, forwardCookies(req, { method: "GET" }));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
