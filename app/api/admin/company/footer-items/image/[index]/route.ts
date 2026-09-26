import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "@/app/api/admin/_lib";
import { COMPANY_TAG } from "@/app/lib/companyCache";

export async function POST(req: NextRequest, { params }: { params: Promise<{ index: string }> }) {
  const { index } = await params;
  const body = await req.formData();
  const res = await fetch(`${getBackend()}/api/admin/company/footer-items/image/${index}`, forwardCookies(req, { method: "POST", body }));
  const data = await res.json();
  if (res.ok) {
    revalidateTag(COMPANY_TAG);
    revalidatePath("/");
  }
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ index: string }> }) {
  const { index } = await params;
  const res = await fetch(`${getBackend()}/api/admin/company/footer-items/image/${index}`, forwardCookies(req, { method: "DELETE" }));
  const data = await res.json();
  if (res.ok) {
    revalidateTag(COMPANY_TAG);
    revalidatePath("/");
  }
  return NextResponse.json(data, { status: res.status });
}
