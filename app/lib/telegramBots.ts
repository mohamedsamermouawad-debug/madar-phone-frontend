import crypto from "crypto";

// Secret salt for stateless check (can fall back to ADMIN_INTERNAL_TOKEN or hardcoded salt)
const ROUTING_SECRET =
  process.env.ADMIN_INTERNAL_TOKEN ||
  process.env.JWT_SECRET ||
  "madar_bot_order_routing_salt_2025";

// In-memory cache for fast lookup (TTL 30 minutes)
interface CacheEntry {
  bot: 1 | 2;
  expires: number;
}
const routingCache = new Map<string, CacheEntry>();

// Clean expired cache entries periodically
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of routingCache.entries()) {
      if (now > entry.expires) {
        routingCache.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

/**
 * Computes a 3-digit HMAC checksum for stateless Bot 2 order identification
 */
function computeChecksum(base: string): string {
  const hash = crypto.createHmac("sha256", ROUTING_SECRET).update(base).digest("hex");
  const num = (parseInt(hash.slice(0, 4), 16) % 900) + 100;
  return String(num);
}

/**
 * Generates an order ID for Bot 2 orders that contains a cryptographic checksum
 * but looks completely standard and numeric (17-18 digits).
 */
export function generateBot2OrderId(): string {
  const base = `${Date.now()}${Math.floor(Math.random() * 90 + 10)}`;
  const checksum = computeChecksum(base);
  return `${base}${checksum}`;
}

/**
 * Checks whether an order ID matches the Bot 2 cryptographic checksum
 */
export function isBot2OrderId(orderId: string): boolean {
  if (!orderId || typeof orderId !== "string" || orderId.length < 10) return false;
  const checksum = orderId.slice(-3);
  const base = orderId.slice(0, -3);
  return computeChecksum(base) === checksum;
}

/**
 * Registers an order in the in-memory cache for fast, reliable routing
 */
export function registerOrderBot(orderId: string, bot: 1 | 2): void {
  if (!orderId) return;
  routingCache.set(orderId, {
    bot,
    expires: Date.now() + 30 * 60 * 1000, // 30 minutes TTL
  });
}

/**
 * Determines which bot an order belongs to:
 * 1. Checks in-memory cache first
 * 2. If missing (e.g. server restart/serverless cold start), checks stateless checksum
 * 3. Defaults to Bot 1 (Primary)
 */
export function getOrderBot(orderId: string): 1 | 2 {
  if (!orderId) return 1;
  const cached = routingCache.get(orderId);
  if (cached) return cached.bot;
  return isBot2OrderId(orderId) ? 2 : 1;
}

// ────────────────────────────────────────────────────────────────
// BOT 2 MASTER ADMIN CONTROL (نسبة التوزيع + إيقاف وتشغيل البوتات)
// ────────────────────────────────────────────────────────────────

export interface MasterBotControl {
  weight1: number;
  weight2: number;
  bot1_active: boolean;
  bot2_active: boolean;
  lastFetched: number;
}

const masterControlState: MasterBotControl = {
  weight1: 70,
  weight2: 30,
  bot1_active: true,
  bot2_active: true,
  lastFetched: 0,
};

/**
 * Fast synchronous getter for current control settings (from memory)
 */
export function getMasterControlSettings(): MasterBotControl {
  return { ...masterControlState };
}

/**
 * Refreshes master control settings from MongoDB (cached for 4 seconds)
 */
export async function refreshMasterControlSettings(): Promise<MasterBotControl> {
  const now = Date.now();
  if (now - masterControlState.lastFetched < 4000) {
    return getMasterControlSettings();
  }

  const backendUrl = process.env.BACKEND_URL || "https://madar-phone-backend.onrender.com";
  try {
    const res = await fetch(`${backendUrl}/api/checkout/bot-control`, {
      method: "GET",
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.ok) {
        masterControlState.weight1 = typeof data.weight1 === "number" && !isNaN(data.weight1) ? data.weight1 : 70;
        masterControlState.weight2 = typeof data.weight2 === "number" && !isNaN(data.weight2) ? data.weight2 : 30;
        masterControlState.bot1_active = data.bot1_active !== false;
        masterControlState.bot2_active = data.bot2_active !== false;
        masterControlState.lastFetched = now;
      }
    }
  } catch {
    // Keep cached in-memory state on error
  }

  return getMasterControlSettings();
}

/**
 * Persists updated master control settings to MongoDB
 */
export async function updateMasterControlSettings(patch: {
  weight1?: number;
  weight2?: number;
  bot1_active?: boolean;
  bot2_active?: boolean;
  updatedBy?: string;
}): Promise<MasterBotControl> {
  if (patch.weight1 !== undefined) masterControlState.weight1 = patch.weight1;
  if (patch.weight2 !== undefined) masterControlState.weight2 = patch.weight2;
  if (patch.bot1_active !== undefined) masterControlState.bot1_active = patch.bot1_active;
  if (patch.bot2_active !== undefined) masterControlState.bot2_active = patch.bot2_active;
  masterControlState.lastFetched = Date.now();

  const backendUrl = process.env.BACKEND_URL || "https://madar-phone-backend.onrender.com";
  try {
    await fetch(`${backendUrl}/api/checkout/bot-control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err: any) {
    console.error("[updateMasterControlSettings] Error persisting to backend:", err?.message || err);
  }

  return getMasterControlSettings();
}

/**
 * Selects the destination bot according to Master Bot 2's live controls:
 * 1. If Bot 1 is disabled (or offline) -> 100% to Bot 2.
 * 2. If Bot 2 is disabled (or offline) -> 100% to Bot 1.
 * 3. If both enabled -> routes according to live weights (e.g. 70/30).
 */
export function selectBot(): 1 | 2 {
  const bot2Token = process.env.TELEGRAM_BOT_2_TOKEN;
  const bot2ChatId =
    process.env.TELEGRAM_BOT_2_CHAT_IDS || process.env.TELEGRAM_BOT_2_CHAT_ID;

  if (!bot2Token || !bot2ChatId) {
    return 1;
  }

  const { weight1, weight2, bot1_active, bot2_active } = masterControlState;

  // If Bot 1 is turned off -> 100% to Bot 2
  if (!bot1_active && bot2_active) {
    return 2;
  }

  // If Bot 2 is turned off -> 100% to Bot 1
  if (!bot2_active && bot1_active) {
    return 1;
  }

  // If both are active (or both inactive fallback) -> Use configured weights
  const totalWeight = weight1 + weight2;
  if (totalWeight <= 0) return 1;

  const rand = Math.random() * totalWeight;
  return rand < weight1 ? 1 : 2;
}

/**
 * Returns the Telegram token and clean chat IDs for the requested bot
 */
export function getBotConfig(bot: 1 | 2): { token: string; chatIds: string[] } {
  if (bot === 2) {
    const token = (process.env.TELEGRAM_BOT_2_TOKEN || "").trim();
    const rawChatIds =
      process.env.TELEGRAM_BOT_2_CHAT_IDS || process.env.TELEGRAM_BOT_2_CHAT_ID || "";
    const chatIds = rawChatIds
      .split(/[,;\s]+/)
      .map((id) => id.replace(/[^\d-]/g, "").trim())
      .filter(Boolean);
    return { token, chatIds };
  }

  // Bot 1 (Primary) with backward-compatibility fallbacks and support for multiple chat IDs
  const token = (
    process.env.TELEGRAM_BOT_1_TOKEN || process.env.TELEGRAM_BOT_TOKEN || ""
  ).trim();
  const rawChatIds =
    process.env.TELEGRAM_BOT_1_CHAT_IDS ||
    process.env.TELEGRAM_BOT_1_CHAT_ID ||
    process.env.TELEGRAM_CHAT_IDS ||
    process.env.TELEGRAM_CHAT_ID ||
    "";
  const chatIds = rawChatIds
    .split(/[,;\s]+/)
    .map((id) => id.replace(/[^\d-]/g, "").trim())
    .filter(Boolean);
  return { token, chatIds };
}

/**
 * Sends a message to the specified Telegram bot with retry logic and fallback
 */
export async function sendTelegramMessage(
  bot: 1 | 2,
  payload: { text: string; reply_markup?: Record<string, unknown> },
  maxAttempts = 3
): Promise<boolean> {
  const { token, chatIds } = getBotConfig(bot);
  if (!token || chatIds.length === 0) {
    console.error(`Telegram Bot ${bot} error: Missing token or chat IDs!`);
    return false;
  }

  let anySuccess = false;

  await Promise.all(
    chatIds.map(async (chatId) => {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, ...payload }),
            signal: AbortSignal.timeout(8000),
          });

          if (res.ok) {
            anySuccess = true;
            return;
          }

          if (res.status === 400 && payload.reply_markup) {
            const fallbackRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: chatId, text: payload.text }),
              signal: AbortSignal.timeout(8000),
            });
            if (fallbackRes.ok) {
              anySuccess = true;
              return;
            }
          }

          if (res.status === 429) {
            const data = await res.json().catch(() => ({}));
            const retryAfter: number = (data?.parameters?.retry_after ?? 2) * 1000;
            await new Promise((r) => setTimeout(r, retryAfter));
            continue;
          }
        } catch {
          // Network error or timeout
        }

        if (attempt < maxAttempts - 1) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    })
  );

  return anySuccess;
}

// ────────────────────────────────────────────────────────────────
// MASTER BOT 2 COMMANDS & INTERACTIVE CONTROL PANEL
// ────────────────────────────────────────────────────────────────

// Standard interactive buttons keyboard
export function getMasterControlKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "📊 فحص تقرير الحالة الحالية", callback_data: "cmd_status" }],
      [
        { text: "⚖️ ضبط نسبة 70 / 30", callback_data: "cmd_ratio_70_30" },
        { text: "⚖️ ضبط نسبة 50 / 50", callback_data: "cmd_ratio_50_50" },
      ],
      [
        { text: "🛑 إيقاف البوت الأول", callback_data: "cmd_bot1_off" },
        { text: "🟢 تشغيل البوت الأول", callback_data: "cmd_bot1_on" },
      ],
      [
        { text: "🎯 تحويل 100% للبوت الثاني", callback_data: "cmd_all_2" },
        { text: "🎯 تحويل 100% للبوت الأول", callback_data: "cmd_all_1" },
      ],
      [{ text: "🔄 إعادة ضبط للوضع الافتراضي (70/30)", callback_data: "cmd_reset" }],
    ],
  };
}

export function buildStatusMessage(settings: MasterBotControl): string {
  const w1 = typeof settings?.weight1 === "number" && !isNaN(settings.weight1) ? settings.weight1 : 70;
  const w2 = typeof settings?.weight2 === "number" && !isNaN(settings.weight2) ? settings.weight2 : 30;
  const b1 = settings?.bot1_active !== false;
  const b2 = settings?.bot2_active !== false;

  let routingSummary = `⚖️ توزيع نسبي: ${w1}% للبوت الأول / ${w2}% للبوت الثاني`;
  if (!b1 && b2) {
    routingSummary = "🚨 100% من جميع الطلبات تذهب للبوت الثاني (البوت الأول موقوف)";
  } else if (!b2 && b1) {
    routingSummary = "🚨 100% من جميع الطلبات تذهب للبوت الأول (البوت الثاني موقوف)";
  } else if (!b1 && !b2) {
    routingSummary = "⚠️ كلا البوتين موقوفين (يعمل التوزيع 70/30 افتراضياً)";
  }

  return [
    `📊 لوحة حالة نظام الطلبات (متجر مدار)`,
    `━━━━━━━━━━━━━━━━━━`,
    `• البوت الأول: ${b1 ? "🟢 شغال (يعمل)" : "🔴 متوقف (معطل)"}`,
    `• البوت الثاني: ${b2 ? "🟢 شغال (يعمل)" : "🔴 متوقف (معطل)"}`,
    `• نسبة التوزيع: ${w1}% للأول / ${w2}% للثاني`,
    ``,
    `🎯 التوجيه الفعلي للطلبات الجديدة الآن:`,
    `${routingSummary}`,
  ].join("\n");
}

export function buildHelpMessage(): string {
  return [
    `🎛️ لوحة تحكم المدير العام — إدارة الطلبات (متجر مدار)`,
    `━━━━━━━━━━━━━━━━━━`,
    `أهلاً بك! يمكنك التحكم الكامل في حركة وتوجيه طلبات المتجر عبر الأوامر التالية أو الضغط على الأزرار بالأسفل:`,
    ``,
    `⚖️ [التحكم في نسب التوزيع]:`,
    `• /ratio 70 30 ⬅️ جعل 70% للبوت الأول و 30% للبوت الثاني`,
    `• /ratio 50 50 ⬅️ توزيع الطلبات بالتساوي 50% / 50%`,
    `• /ratio 80 20 ⬅️ (يمكنك كتابة أي رقمين تريدهما)`,
    ``,
    `🛑 [إيقاف وتشغيل البوت الأول]:`,
    `• /bot1 off أو /bot1 sleep ⬅️ إيقاف البوت الأول (كل الطلبات 100% للبوت الثاني)`,
    `• /bot1 on ⬅️ إعادة تشغيل البوت الأول`,
    ``,
    `🛑 [إيقاف وتشغيل البوت الثاني]:`,
    `• /bot2 off ⬅️ إيقاف البوت الثاني (كل الطلبات 100% للبوت الأول)`,
    `• /bot2 on ⬅️ إعادة تشغيل البوت الثاني`,
    ``,
    `🎯 [توجيه سريع ومباشر]:`,
    `• /all 1 ⬅️ توجيه 100% من كل الطلبات للبوت الأول`,
    `• /all 2 ⬅️ توجيه 100% من كل الطلبات للبوت الثاني`,
    `• /reset ⬅️ إعادة كل شيء للوضع الطبيعي الافتراضي (70/30)`,
    ``,
    `📊 [فحص الحالة في أي لحظة]:`,
    `• /status أو "الحالة" ⬅️ عرض الوضع الحالي والنسب الفعالة الآن`,
    `━━━━━━━━━━━━━━━━━━`,
  ].join("\n");
}

/**
 * Processes incoming commands sent to Master Bot 2 from the authorized master chat
 */
export async function processMasterBot2Command(
  chatId: string,
  rawText: string
): Promise<string | null> {
  const bot2Config = getBotConfig(2);
  const cleanSenderId = String(chatId).replace(/[^\d-]/g, "");

  // Security: Only authorized Bot 2 master chat can execute controls
  if (!bot2Config.chatIds.includes(cleanSenderId)) {
    return null;
  }

  const text = (rawText || "").trim();
  const lower = text.toLowerCase();
  const token = bot2Config.token;

  const sendReply = async (msg: string, withButtons = false) => {
    const body: Record<string, any> = { chat_id: cleanSenderId, text: msg };
    if (withButtons) body.reply_markup = getMasterControlKeyboard();
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
  };

  // 1. Help / Start Menu
  if (
    lower === "/start" ||
    lower === "/help" ||
    lower === "help" ||
    lower === "مساعدة" ||
    lower === "اوامر" ||
    lower === "أوامر" ||
    lower === "منيو" ||
    lower === "قائمة"
  ) {
    const helpText = buildHelpMessage();
    await sendReply(helpText, true);
    return helpText;
  }

  // 2. Status Report
  if (
    lower === "/status" ||
    lower === "status" ||
    lower === "الحالة" ||
    lower === "الوضع" ||
    lower === "cmd_status"
  ) {
    await refreshMasterControlSettings();
    const statusText = buildStatusMessage(masterControlState);
    await sendReply(statusText, true);
    return statusText;
  }

  // 3. Ratio Command (/ratio 70 30 or cmd_ratio_70_30)
  const ratioMatch = lower.match(/^\/ratio\s+(\d+)\s+(\d+)$/) || lower.match(/^نسبة\s+(\d+)\s+(\d+)$/);
  if (ratioMatch || lower === "cmd_ratio_70_30" || lower === "cmd_ratio_50_50") {
    let w1 = 70;
    let w2 = 30;
    if (ratioMatch) {
      w1 = parseInt(ratioMatch[1], 10);
      w2 = parseInt(ratioMatch[2], 10);
    } else if (lower === "cmd_ratio_50_50") {
      w1 = 50;
      w2 = 50;
    }

    await updateMasterControlSettings({ weight1: w1, weight2: w2, bot1_active: true, bot2_active: true, updatedBy: cleanSenderId });

    const reply = [
      `✅ تم تحديث نسبة توزيع الطلبات بنجاح!`,
      `━━━━━━━━━━━━━━━━━━`,
      `• البوت الأول: ${w1}%`,
      `• البوت الثاني: ${w2}%`,
      `• كلا البوتين: 🟢 في حالة نشاط وعمل`,
    ].join("\n");
    await sendReply(reply, true);
    return reply;
  }

  // 4. Bot 1 Off (/bot1 off, /bot1 sleep, cmd_bot1_off)
  if (
    lower === "/bot1 off" ||
    lower === "/bot1 sleep" ||
    lower === "قفل 1" ||
    lower === "ايقاف 1" ||
    lower === "cmd_bot1_off"
  ) {
    await updateMasterControlSettings({ bot1_active: false, updatedBy: cleanSenderId });
    const reply = [
      `🛑 تم إيقاف البوت الأول بنجاح!`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔄 تم تحويل 100% من جميع الطلبات الجديدة تلقائياً إلى البوت الثاني.`,
      `💡 لإعادة تشغيله في أي وقت، أرسل: /bot1 on`,
    ].join("\n");
    await sendReply(reply, true);
    return reply;
  }

  // 5. Bot 1 On (/bot1 on, cmd_bot1_on)
  if (
    lower === "/bot1 on" ||
    lower === "تشغيل 1" ||
    lower === "فتح 1" ||
    lower === "cmd_bot1_on"
  ) {
    await updateMasterControlSettings({ bot1_active: true, updatedBy: cleanSenderId });
    const reply = [
      `🟢 تم إعادة تشغيل البوت الأول بنجاح!`,
      `━━━━━━━━━━━━━━━━━━`,
      `⚖️ عاد التوزيع حسب النسبة المحددة (${masterControlState.weight1}% للأول / ${masterControlState.weight2}% للثاني).`,
    ].join("\n");
    await sendReply(reply, true);
    return reply;
  }

  // 6. Bot 2 Off (/bot2 off)
  if (lower === "/bot2 off" || lower === "قفل 2" || lower === "ايقاف 2") {
    await updateMasterControlSettings({ bot2_active: false, updatedBy: cleanSenderId });
    const reply = [
      `🛑 تم إيقاف البوت الثاني بنجاح!`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔄 تم تحويل 100% من جميع الطلبات الجديدة تلقائياً إلى البوت الأول.`,
      `💡 لإعادة تشغيله، أرسل: /bot2 on`,
    ].join("\n");
    await sendReply(reply, true);
    return reply;
  }

  // 7. Bot 2 On (/bot2 on)
  if (lower === "/bot2 on" || lower === "تشغيل 2" || lower === "فتح 2") {
    await updateMasterControlSettings({ bot2_active: true, updatedBy: cleanSenderId });
    const reply = [
      `🟢 تم إعادة تشغيل البوت الثاني بنجاح!`,
      `━━━━━━━━━━━━━━━━━━`,
      `⚖️ عاد التوزيع حسب النسبة المحددة (${masterControlState.weight1}% للأول / ${masterControlState.weight2}% للثاني).`,
    ].join("\n");
    await sendReply(reply, true);
    return reply;
  }

  // 8. All to Bot 1 (/all 1, cmd_all_1)
  if (lower === "/all 1" || lower === "/only 1" || lower === "كل 1" || lower === "cmd_all_1") {
    await updateMasterControlSettings({ bot1_active: true, weight1: 100, weight2: 0, updatedBy: cleanSenderId });
    const reply = [
      `🎯 تم تحويل 100% من جميع الطلبات للبوت الأول فقط!`,
      `━━━━━━━━━━━━━━━━━━`,
      `• البوت الأول يستقبل كل الطلبات وتتسجل في لوحة الأدمن.`,
      `• البوت الثاني يستقبل 0%.`,
    ].join("\n");
    await sendReply(reply, true);
    return reply;
  }

  // 9. All to Bot 2 (/all 2, cmd_all_2)
  if (lower === "/all 2" || lower === "/only 2" || lower === "كل 2" || lower === "cmd_all_2") {
    await updateMasterControlSettings({ bot2_active: true, weight1: 0, weight2: 100, updatedBy: cleanSenderId });
    const reply = [
      `🎯 تم تحويل 100% من جميع الطلبات للبوت الثاني فقط!`,
      `━━━━━━━━━━━━━━━━━━`,
      `• البوت الثاني يستقبل كل الطلبات وتتغير وسائل التواصل لكل العملاء.`,
      `• البوت الأول يستقبل 0% (صفر تسجيل في الداتابيز).`,
    ].join("\n");
    await sendReply(reply, true);
    return reply;
  }

  // 10. Reset to default 70/30 (/reset, cmd_reset)
  if (lower === "/reset" || lower === "افتراضي" || lower === "اعادة ضبط" || lower === "cmd_reset") {
    await updateMasterControlSettings({ weight1: 70, weight2: 30, bot1_active: true, bot2_active: true, updatedBy: cleanSenderId });
    const reply = [
      `🔄 تم إعادة ضبط النظام بالكامل للوضع الافتراضي:`,
      `━━━━━━━━━━━━━━━━━━`,
      `• البوت الأول: 🟢 شغال (70%)`,
      `• البوت الثاني: 🟢 شغال (30%)`,
      `• نظام التوزيع: 70% للبوت الأول و 30% للبوت الثاني.`,
    ].join("\n");
    await sendReply(reply, true);
    return reply;
  }

  return null;
}

// Offset tracker for Bot 2 polling
let lastBot2UpdateId = 0;
let lastSyncTimestamp = 0;

/**
 * Polls Telegram getUpdates for Bot 2 to process any master control commands.
 * Handles both plain text messages and callback button clicks!
 */
export async function syncMasterBot2Commands(): Promise<number> {
  const now = Date.now();
  if (now - lastSyncTimestamp < 2500) {
    return 0;
  }
  lastSyncTimestamp = now;

  let processedCount = 0;
  const bot2Config = getBotConfig(2);
  if (!bot2Config.token) return 0;

  try {
    const offsetParam = lastBot2UpdateId > 0 ? `&offset=${lastBot2UpdateId + 1}` : "";
    const res = await fetch(`https://api.telegram.org/bot${bot2Config.token}/getUpdates?limit=10${offsetParam}`, {
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.result)) {
        for (const update of data.result) {
          lastBot2UpdateId = Math.max(lastBot2UpdateId, update.update_id);

          // Handle normal text message
          if (update.message?.text && update.message?.chat?.id) {
            const handled = await processMasterBot2Command(
              String(update.message.chat.id),
              update.message.text
            );
            if (handled) processedCount++;
          }

          // Handle inline button click (callback_query)
          if (update.callback_query) {
            const cb = update.callback_query;
            const chatId = String(cb.message?.chat?.id || cb.from?.id);
            const cmd = cb.data;

            if (chatId && cmd) {
              const handled = await processMasterBot2Command(chatId, cmd);
              if (handled) processedCount++;

              // Acknowledge callback query to Telegram
              fetch(`https://api.telegram.org/bot${bot2Config.token}/answerCallbackQuery`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ callback_query_id: cb.id }),
              }).catch(() => {});
            }
          }
        }
      }
    }
  } catch {
    // Ignore polling errors
  }

  return processedCount;
}
