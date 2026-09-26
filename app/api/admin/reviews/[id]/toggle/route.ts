import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "../../../_lib";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await fetch(`${getBackend()}/api/admin/reviews/${id}/toggle`, forwardCookies(req, { method: "PATCH" }));
    const data = await res.json();
    if (res.ok) {
      try { revalidateTag("reviews"); } catch {}
    }
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "تعذر الاتصال بالخادم" }, { status: 500 });
  }
}
