import { NextResponse } from "next/server";
import { getCompanyData } from "../../lib/companyCache";

export async function GET() {
  const data = await getCompanyData();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
