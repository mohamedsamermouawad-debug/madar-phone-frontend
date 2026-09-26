import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "@/app/api/admin/_lib";
import { COMPANY_TAG } from "@/app/lib/companyCache";

export async function POST(req: NextRequest) {
  try {
    const res = await fetch(`${getBackend()}/api/admin/company/footer-items/add`, forwardCookies(req, { method: "POST" }));
    const data = await res.json();
    if (res.ok) {
      revalidateTag(COMPANY_TAG);
      revalidatePath("/");
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "فشل إضافة عنصر";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
