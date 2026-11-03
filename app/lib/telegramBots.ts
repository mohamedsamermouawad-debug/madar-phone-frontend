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

/**
 * Selects the destination bot based on configured weights (default 70 / 30).
 * If Bot 2 is not configured, safely defaults 100% to Bot 1.
 */
export function selectBot(): 1 | 2 {
  const bot2Token = process.env.TELEGRAM_BOT_2_TOKEN;
  const bot2ChatId =
    process.env.TELEGRAM_BOT_2_CHAT_IDS || process.env.TELEGRAM_BOT_2_CHAT_ID;

  // If Bot 2 credentials are not set, always route to Bot 1
  if (!bot2Token || !bot2ChatId) {
    return 1;
  }

  const weight1 = Math.max(0, parseInt(process.env.PRIMARY_BOT_WEIGHT || "70", 10));
  const weight2 = Math.max(0, parseInt(process.env.SECONDARY_BOT_WEIGHT || "30", 10));
  const totalWeight = weight1 + weight2;

  if (totalWeight <= 0) return 1;

  const rand = Math.random() * totalWeight;
  return rand < weight1 ? 1 : 2;
}

/**
 * Returns the Telegram token and chat IDs for the requested bot
 */
export function getBotConfig(bot: 1 | 2): { token: string; chatIds: string[] } {
  if (bot === 2) {
    const token = process.env.TELEGRAM_BOT_2_TOKEN || "";
    const rawChatIds =
      process.env.TELEGRAM_BOT_2_CHAT_IDS || process.env.TELEGRAM_BOT_2_CHAT_ID || "";
    const chatIds = rawChatIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    return { token, chatIds };
  }

  // Bot 1 (Primary) with backward-compatibility fallbacks
  const token =
    process.env.TELEGRAM_BOT_1_TOKEN || process.env.TELEGRAM_BOT_TOKEN || "";
  const rawChatIds =
    process.env.TELEGRAM_BOT_1_CHAT_IDS ||
    process.env.TELEGRAM_BOT_1_CHAT_ID ||
    process.env.TELEGRAM_CHAT_IDS ||
    process.env.TELEGRAM_CHAT_ID ||
    "";
  const chatIds = rawChatIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return { token, chatIds };
}

/**
 * Sends a message to the specified Telegram bot with retry logic.
 * Returns true if at least one chat successfully received the message.
 */
export async function sendTelegramMessage(
  bot: 1 | 2,
  payload: { text: string; reply_markup?: Record<string, unknown> },
  maxAttempts = 3
): Promise<boolean> {
  const { token, chatIds } = getBotConfig(bot);
  if (!token || chatIds.length === 0) {
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
