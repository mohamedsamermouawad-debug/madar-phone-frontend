import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../_lib";
import { isBot2OrderId } from "../../../lib/telegramBots";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.toString();
  const url = `${getBackend()}/api/admin/orders${query ? `?${query}` : ""}`;
  const res = await fetch(url, forwardCookies(req, { method: "GET" }));
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  // Filter out any Bot 2 order from admin view
  if (Array.isArray(data)) {
    const filtered = data.filter((o: { orderId?: string }) => !isBot2OrderId(String(o?.orderId || "")));
    return NextResponse.json(filtered);
  }

  if (data && Array.isArray(data.orders)) {
    const originalLen = data.orders.length;
    const filtered = data.orders.filter((o: { orderId?: string }) => !isBot2OrderId(String(o?.orderId || "")));
    const diff = originalLen - filtered.length;
    return NextResponse.json({
      ...data,
      orders: filtered,
      total: Math.max(0, (data.total || 0) - diff),
    });
  }

  return NextResponse.json(data, { status: res.status });
}
