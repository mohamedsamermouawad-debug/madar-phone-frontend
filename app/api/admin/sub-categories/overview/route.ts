import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../_lib";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${getBackend()}/api/admin/sub-categories/overview`, forwardCookies(req, {}));
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("sub-categories/overview error:", err);
    return NextResponse.json({ error: "خطأ في الاتصال بالخادم" }, { status: 500 });
  }
}
