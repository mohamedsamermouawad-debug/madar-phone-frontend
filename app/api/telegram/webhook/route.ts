import { NextRequest, NextResponse } from "next/server";
import { selectBot, getBotWeights } from "../../../lib/telegramBots";

export const dynamic = "force-dynamic";

// POST /api/telegram/webhook - Webhook from Telegram Bot (Verification callbacks)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check inline button callback for verification (✅ تأكيد الطلب / ❌ كود خاطئ)
    if (body?.callback_query) {
      const cb = body.callback_query;
      const data = String(cb.data || "");

      if (data.startsWith("v_app_") || data.startsWith("v_rej_")) {
        const isApprove = data.startsWith("v_app_");
        const orderId = isApprove ? data.slice(6) : data.slice(6);
        const { updateVerifyStatusLocally } = await import("../../../lib/verifyStatus");
        updateVerifyStatusLocally(orderId, isApprove ? "approved" : "rejected");
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json({ ok: false, error: (err as Error)?.message || "error" }, { status: 200 });
  }
}

// GET /api/telegram/webhook - Returns live distribution settings from env
export async function GET() {
  try {
    const weights = getBotWeights();
    return NextResponse.json({
      ok: true,
      mode: "env_configured",
      weights,
      nextOrderTargetBot: selectBot(),
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    return NextResponse.json({ ok: false, error: (err as Error)?.message }, { status: 500 });
  }
}
