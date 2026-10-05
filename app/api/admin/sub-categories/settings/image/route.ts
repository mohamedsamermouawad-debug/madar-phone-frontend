import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "../../../_lib";
import { CATEGORIES_TAG, SETTINGS_TAG } from "@/app/lib/categoriesCache";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const res = await fetch(`${getBackend()}/api/admin/sub-categories/settings/image`, forwardCookies(req, {
    method: "POST",
    body: formData,
  }));
  const data = await res.json();
  if (res.ok) {
    revalidateTag(CATEGORIES_TAG);
    revalidateTag(SETTINGS_TAG);
    revalidatePath("/");
    revalidatePath("/store");
  }
  return NextResponse.json(data, { status: res.status });
}
