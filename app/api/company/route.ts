import { NextRequest, NextResponse } from "next/server";
import { getCompanyData } from "../../lib/companyCache";
import { isBot2UserToken, applyBotContactOverride } from "../../lib/botContact";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const data = await getCompanyData();
  const token = req.cookies.get("_b_token")?.value;
  const isBot2 = isBot2UserToken(token);
  const result = applyBotContactOverride(data, isBot2);

  return NextResponse.json(result);
}
