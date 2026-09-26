"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, MessageSquareQuote, Plus, Star } from "lucide-react";

interface Review {
  _id: string;
  name: string;
  comment: string;
  rating: number;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" role="img" aria-label={`${rating} من 5 نجوم`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} aria-hidden="true" className={`size-4 ${star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
      ))}
    </div>
  );
}

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", comment: "", rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const reviewTrack = useRef<HTMLDivElement>(null);
  const interaction = useRef({ hovered: false, focused: false, touching: false, resumeAt: 0 });
  const [motionPaused, setMotionPaused] = useState(false);

  useEffect(() => {
    const track = reviewTrack.current;
    if (!track || reviews.length < 2 || motionPaused || expanded || showForm) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previous = 0;
    let direction = -1;
    let position = track.scrollLeft;
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(track);

    const animate = (now: number) => {
      const elapsed = previous ? Math.min(now - previous, 40) : 0;
      previous = now;
      const state = interaction.current;
      const limit = track.scrollWidth - track.clientWidth;
      if (reducedMotion.matches || document.hidden || !visible || state.hovered || state.focused || state.touching || now < state.resumeAt || limit <= 1) {
        position = track.scrollLeft;
      } else {
        // RTL scroll offsets range from zero at the start to a negative end.
        position = Math.max(-limit, Math.min(0, position + direction * elapsed * 0.022));
        track.scrollLeft = position;
        if (position <= -limit || position >= 0) {
          direction *= -1;
          state.resumeAt = now + 1200;
        }
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [reviews.length, motionPaused, expanded, showForm]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/reviews", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load reviews");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid reviews response");
        setReviews(data);
      })
      .catch(() => { if (!controller.signal.aborted) setLoadError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting || !form.name.trim() || !form.comment.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, name: form.name.trim(), comment: form.comment.trim() }),
      });
      if (!response.ok) throw new Error("Unable to submit review");
      setSubmitted(true);
      setShowForm(false);
      setForm({ name: "", comment: "", rating: 5 });
    } catch {
      setSubmitError("تعذّر إرسال تقييمك. حاول مرة أخرى، تجربتك تهمنا.");
    } finally {
      setSubmitting(false);
    }
  }

  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  const inputClass = "w-full rounded-xl border border-[#D4E8F2] bg-[#F5F9FC] px-4 py-3 text-sm text-[#003048] outline-none focus:border-[#0889A2] focus:ring-2 focus:ring-[#0889A2]/20";

  return (
    <section id="customer-reviews" aria-labelledby="reviews-heading" dir="rtl" className="bg-[#F5F9FC] px-4 py-10 sm:px-8 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="relative rounded-2xl border border-[#D9EAF0] bg-gradient-to-l from-[#E8F4F7] to-white p-4 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <div className="min-w-0">
              <span className="mb-3 inline-flex items-center gap-2 text-xs font-bold text-[#0889A2]"><span aria-hidden="true" className="h-0.5 w-6 rounded-full bg-[#0889A2]" />آراء عملائنا</span>
              <h2 id="reviews-heading" className="text-xl font-black leading-snug tracking-tight text-[#003048] sm:text-3xl">تجاربكم <span className="text-[#0889A2]">تحكي عنّا.</span></h2>
              <p className="mt-2 text-xs leading-6 sm:text-sm text-[#577687]">آراء من جرّبوا مدار، لتختار بثقة.</p>
            </div>
            <button type="button" aria-expanded={showForm} aria-controls="review-form" onClick={() => setShowForm(!showForm)} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[#003048] bg-[#003048] px-4 py-2.5 text-xs font-bold sm:text-sm text-white transition-colors hover:bg-[#08506A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0889A2] sm:self-auto">
              <Plus size={16} aria-hidden="true" /> {showForm ? "إغلاق النموذج" : "شارك تجربتك"}
            </button>
          </div>
          {!loading && reviews.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[#003048]">
              <Stars rating={average} />
              <span className="text-sm"><strong className="font-bold">{average.toFixed(1)}</strong><span className="text-[#577687]"> / 5</span></span>
              <span aria-hidden="true" className="h-3 w-px bg-[#C6DFEA]" />
              <span className="text-xs text-[#577687]">من {reviews.length.toLocaleString("ar")} تقييم</span>
            </div>
          )}
        {submitted && <p role="status" className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800"><CheckCircle2 size={20} aria-hidden="true" />شكرًا لك! تم إرسال تقييمك وسيظهر بعد المراجعة.</p>}
        {showForm && (
          <form id="review-form" onSubmit={handleSubmit} className="mt-4 w-full border-t border-[#D4E8F2] pt-4 sm:mt-6 sm:pt-6">
            <h3 className="text-base font-bold text-[#003048] sm:text-xl">كيف كانت تجربتك مع مدار؟</h3>
            <p className="mb-4 mt-2 text-xs leading-6 sm:mb-6 sm:text-sm text-[#577687]">شاركنا رأيك. يظهر تقييمك بعد المراجعة.</p>
            <fieldset disabled={submitting} className="grid min-w-0 gap-3 sm:gap-5 disabled:opacity-60 sm:grid-cols-2">
              <div><label htmlFor="review-name" className="mb-2 block text-xs font-bold sm:text-sm">الاسم</label><input id="review-name" autoComplete="name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} placeholder="اسمك" /></div>
              <fieldset><legend className="mb-2 text-xs font-bold sm:text-sm">تقييمك</legend><div className="flex flex-wrap gap-1 sm:gap-2">{[1, 2, 3, 4, 5].map((rating) => <label key={rating} className="relative cursor-pointer rounded-lg p-2 hover:bg-amber-50"><input className="peer sr-only" type="radio" name="review-rating" value={rating} checked={form.rating === rating} onChange={() => setForm({ ...form, rating })} aria-label={`${rating} من 5 نجوم`} /><Star aria-hidden="true" className={`size-6 rounded peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[#0889A2] ${rating <= form.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} /></label>)}</div></fieldset>
              <div className="sm:col-span-2"><label htmlFor="review-comment" className="mb-2 block text-xs font-bold sm:text-sm">تجربتك</label><textarea id="review-comment" required rows={3} value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} className={`${inputClass} resize-y`} placeholder="ما الذي أعجبك؟ وما الذي يمكننا تحسينه؟" /></div>
              {submitError && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{submitError}</p>}
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl sm:col-span-2 sm:w-fit bg-[#0889A2] px-5 py-3 text-sm font-bold text-white hover:bg-[#006F86] disabled:cursor-wait">{submitting ? "جاري الإرسال..." : "إرسال التقييم"}<ArrowLeft size={16} aria-hidden="true" /></button>
            </fieldset>
          </form>
        )}
        </div>
        <div className="mt-5" aria-busy={loading}>
          {loading ? (
            <div role="status" className="grid auto-cols-[min(80%,18rem)] grid-flow-col gap-3 overflow-x-auto pb-3 sm:auto-cols-[19rem]">
              <span className="sr-only">جاري تحميل آراء العملاء</span>
              {[0, 1, 2].map((item) => <div key={item} aria-hidden="true" className="h-44 rounded-2xl border border-[#DFECF7] bg-white p-4 motion-safe:animate-pulse"><div className="mb-7 h-4 w-24 rounded bg-[#DFECF7]" /><div className="h-3 w-full rounded bg-[#DFECF7]" /><div className="mt-3 h-3 w-2/3 rounded bg-[#DFECF7]" /><div className="mt-8 size-10 rounded-full bg-[#DFECF7]" /></div>)}
            </div>
          ) : reviews.length > 0 ? (
            <>
              <div ref={reviewTrack}
                onPointerEnter={(event) => { if (event.pointerType === "mouse") interaction.current.hovered = true; }}
                onPointerLeave={() => { interaction.current.hovered = false; }}
                onTouchStart={() => { interaction.current.touching = true; }}
                onTouchEnd={() => { interaction.current.touching = false; interaction.current.resumeAt = performance.now() + 4000; }}
                onTouchCancel={() => { interaction.current.touching = false; interaction.current.resumeAt = performance.now() + 4000; }}
                onWheel={() => { interaction.current.resumeAt = performance.now() + 4000; }}
                onFocusCapture={() => { interaction.current.focused = true; }}
                onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) interaction.current.focused = false; }}
                role="region" aria-label="آراء العملاء، اسحب لاستعراض التقييمات" tabIndex={0} className="flex items-start gap-3 overflow-x-auto overscroll-x-contain rounded-2xl pb-3 focus-visible:outline-2 focus-visible:outline-[#0889A2]">
                {reviews.map((review, index) => (
                  <article key={review._id} className="w-[80%] max-w-72 min-w-0 shrink-0 snap-start rounded-2xl border border-[#DFEAF0] bg-white p-4 transition-colors hover:border-[#A6CEDB] sm:w-76 sm:max-w-none">
                    <div className="flex items-center gap-2.5">
                      <span aria-hidden="true" className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${index % 2 ? "bg-[#E5F4F4] text-[#0889A2]" : "bg-[#DFECF7] text-[#003048]"}`}>{review.name.trim().charAt(0)}</span>
                      <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold text-[#003048]" title={review.name}>{review.name}</h3><div className="mt-1.5"><Stars rating={review.rating} /></div></div>
                      <span aria-hidden="true" className="self-start font-serif text-4xl leading-none text-[#C3DDE7]">“</span>
                    </div>
                    <blockquote id={`review-comment-${review._id}`} className={`mt-3 min-h-[4.5rem] break-words text-[13px] leading-6 text-[#486575] ${expanded !== review._id ? "line-clamp-3" : ""}`}>{review.comment}</blockquote>
                    <button type="button" aria-controls={`review-comment-${review._id}`} aria-expanded={expanded === review._id} onClick={() => setExpanded(expanded === review._id ? null : review._id)} className="mt-1 inline-flex min-h-8 items-center text-[11px] font-bold text-[#0889A2] hover:underline">{expanded === review._id ? "عرض أقل" : "التقييم كاملًا"}</button>
                  </article>
                ))}
              </div>
              {reviews.length > 1 && <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#577687]"><p className="flex items-center gap-2">اسحب لاستكشاف الآراء<ArrowLeft size={14} aria-hidden="true" /></p><button type="button" aria-pressed={motionPaused} onClick={() => setMotionPaused(!motionPaused)} className="min-h-10 rounded-lg px-3 font-semibold text-[#0889A2] hover:bg-[#E5F4F4] motion-reduce:hidden">{motionPaused ? "تشغيل الحركة" : "إيقاف الحركة"}</button></div>}
            </>
          ) : (
            <div role="status" className="rounded-2xl border border-dashed border-[#BFD8E5] bg-white/70 px-6 py-9 text-center">
              <MessageSquareQuote aria-hidden="true" className="mx-auto mb-3 text-[#0889A2]" size={30} />
              <h3 className="font-bold text-[#003048]">{loadError ? "تعذّر تحميل التقييمات حاليًا" : "تجربتك تستحق أن تُروى"}</h3>
              <p className="mt-2 text-sm text-[#577687]">{loadError ? "يمكنك المحاولة لاحقًا أو مشاركتنا تجربتك الآن." : "كن أول من يشارك رأيه ويساعد غيره في الاختيار."}</p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
