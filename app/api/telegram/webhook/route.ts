import { NextRequest, NextResponse } from "next/server";
import {
  processMasterBot2Command,
  syncMasterBot2Commands,
  refreshMasterControlSettings,
  getMasterControlSettings,
  selectBot,
} from "../../../lib/telegramBots";

export const dynamic = "force-dynamic";

// POST /api/telegram/webhook - Webhook from Telegram Bot 2
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Check normal text message
    const message = body?.message || body?.edited_message;
    if (message?.text && message.chat?.id) {
      await processMasterBot2Command(String(message.chat.id), String(message.text));
    }

    // 2. Check inline button callback
    if (body?.callback_query) {
      const cb = body.callback_query;
      const chatId = String(cb.message?.chat?.id || cb.from?.id);
      if (chatId && cb.data) {
        await processMasterBot2Command(chatId, cb.data);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "error" }, { status: 200 });
  }
}

// GET /api/telegram/webhook - Polls Telegram getUpdates for Bot 2 & returns live status
export async function GET() {
  try {
    // 1. Sync any new commands or button clicks sent in Bot 2 chat
    const processed = await syncMasterBot2Commands();

    // 2. Refresh live control settings from MongoDB
    const settings = await refreshMasterControlSettings();

    // 3. Determine active routing mode
    let routingMode = `⚖️ توزيع نسبي (${settings.weight1}% للبوت الأول / ${settings.weight2}% للبوت الثاني)`;
    if (!settings.bot1_active && settings.bot2_active) {
      routingMode = "🚨 100% للبوت الثاني (البوت الأول موقوف)";
    } else if (!settings.bot2_active && settings.bot1_active) {
      routingMode = "🚨 100% للبوت الأول (البوت الثاني موقوف)";
    }

    return NextResponse.json({
      ok: true,
      masterControl: settings,
      routingMode,
      nextOrderTargetBot: selectBot(),
      syncedCommandsCount: processed,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
