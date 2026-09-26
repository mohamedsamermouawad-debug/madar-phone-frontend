import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../../_lib";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [orderRes, companyRes] = await Promise.all([
    fetch(`${getBackend()}/api/admin/orders/${id}`, forwardCookies(req, { method: "GET" })),
    fetch(`${getBackend()}/api/admin/company`, forwardCookies(req, { method: "GET" })),
  ]);
  const order = await orderRes.json();
  const company = await companyRes.json();
  return NextResponse.json({ order, company }, { status: orderRes.status === 200 ? 200 : orderRes.status });
}
