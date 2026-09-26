import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "@/app/api/admin/_lib";
import { COMPANY_TAG } from "@/app/lib/companyCache";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;
    const res = await fetch(
      `${getBackend()}/api/admin/company/image/${key}`,
      forwardCookies(req, {
        method: "DELETE",
      })
    );
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text || "deleted" };
    }
    if (res.ok) {
      revalidateTag(COMPANY_TAG);
      revalidatePath("/");
    }
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
