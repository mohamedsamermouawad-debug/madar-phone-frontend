import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "@/app/api/admin/_lib";
import { COMPANY_TAG } from "@/app/lib/companyCache";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ index: string }> }) {
  try {
    const { index } = await params;
    const res = await fetch(`${getBackend()}/api/admin/company/footer-items/${index}`, forwardCookies(req, { method: "DELETE" }));
    const data = await res.json();
    if (res.ok) {
      revalidateTag(COMPANY_TAG);
      revalidatePath("/");
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "فشل حذف العنصر";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
