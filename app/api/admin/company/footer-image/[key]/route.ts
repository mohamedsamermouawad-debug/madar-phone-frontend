import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "@/app/api/admin/_lib";
import { COMPANY_TAG } from "@/app/lib/companyCache";

export async function POST(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const body = await req.formData();
  const res = await fetch(`${getBackend()}/api/admin/company/footer-image/${key}`, forwardCookies(req, { method: "POST", body }));
  const data = await res.json();
  if (res.ok) {
    revalidateTag(COMPANY_TAG);
    revalidatePath("/");
  }
  return NextResponse.json(data, { status: res.status });
}
