import { NextRequest, NextResponse } from "next/server";
import { getOrderBot, sendTelegramMessage } from "../../lib/telegramBots";

const resends = new Map<string, { count: number; firstAt: number; lastAt: number }>();

const MAX_RESENDS = 3;
const WINDOW_MS = 10 * 60 * 1000;
const COOLDOWN_MS = 60 * 1000;

export async function POST(req: NextRequest) {
  const { orderId, customerName } = await req.json();

  if (!orderId) {
    return NextResponse.json({ ok: false, error: "بيانات ناقصة" }, { status: 400 });
  }

  const now = Date.now();
  const key = String(orderId).slice(0, 64);
  const entry = resends.get(key);

  if (entry) {
    if (now - entry.firstAt > WINDOW_MS) {
      resends.delete(key);
    } else {
      if (now - entry.lastAt < COOLDOWN_MS) {
        const retryAfter = Math.ceil((COOLDOWN_MS - (now - entry.lastAt)) / 1000);
        return NextResponse.json({ ok: false, error: "انتظر قبل إعادة الإرسال", retryAfter }, { status: 429 });
      }
      if (entry.count >= MAX_RESENDS) {
        return NextResponse.json({ ok: false, error: "تجاوزت الحد المسموح من إعادة الإرسال" }, { status: 429 });
      }
      entry.count += 1;
      entry.lastAt = now;
    }
  }

  if (!resends.has(key)) {
    resends.set(key, { count: 1, firstAt: now, lastAt: now });
  }

  const text = [
    `🔄 تم طلب إعادة ارسال كود`,
    `🆔 رقم الطلب: ${orderId}`,
    `👤 اسم العميل: ${customerName ?? "—"}`,
  ].join("\n");

  const targetBot = getOrderBot(String(orderId));
  const sent = await sendTelegramMessage(targetBot, { text });

  return NextResponse.json({ ok: sent });
}
