"use client";
import { useEffect, useState } from "react";

interface Review {
  _id: string;
  name: string;
  comment: string;
  rating: number;
  gender: string;
  createdAt: string;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
          fill={s <= rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}
          className={`${size === "lg" ? "w-5 h-5" : "w-4 h-4"} ${s <= rating ? "text-amber-400" : "text-gray-300"}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ name, gender }: { name: string; gender: string }) {
  return (
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-base shrink-0 shadow-md ${gender === "female" ? "bg-gradient-to-br from-pink-400 to-rose-500" : ""}`} style={gender !== "female" ? { background: "linear-gradient(135deg, #053132, #0a6b6e)" } : {}}>
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", comment: "", rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setReviews(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const t = setInterval(() => {
      if (!document.hidden) {
        setActiveIdx((i) => (i + 1) % reviews.length);
      }
    }, 4500);
    return () => clearInterval(t);
  }, [reviews.length]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
      setShowForm(false);
      setForm({ name: "", comment: "", rating: 5 });
    } catch {}
    setSubmitting(false);
  }

  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return (
    <section dir="rtl" className="w-full py-16 sm:py-20 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest mb-4" style={{ color: "#65E0CD", border: "1px solid rgba(101,224,205,0.3)", background: "rgba(101,224,205,0.08)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
            </svg>
            آراء عملاءنا
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            ماذا يقول
            <span className="block bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(to left, #65E0CD, #20A5A1)" }}>
              زبايننا عنّا؟
            </span>
          </h2>

          {reviews.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-6">
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-white">{avgRating}</span>
                <StarRating rating={Math.round(avgRating)} />
                <span className="text-white/50 text-xs mt-1">{reviews.length} تقييم</span>
              </div>
              <div className="hidden sm:block w-px h-16 bg-white/20" />
              <div className="flex flex-col gap-1">
                {[5, 4, 3].map((star) => {
                  const count = reviews.filter((r) => r.rating === star).length;
                  const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-white/50 text-xs w-3">{star}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-amber-400">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                      </svg>
                      <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-white/50 text-xs w-6">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {reviews.length > 0 ? (
          <>
            {/* Desktop grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {reviews.map((r) => (
                <div key={r._id} className="group relative border rounded-2xl p-5 flex flex-col gap-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 shadow-sm" style={{background:'rgba(255,255,255,0.08)',borderColor:'rgba(255,255,255,0.15)'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(101,224,205,0.4)'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="absolute top-4 left-4 w-8 h-8 transition-colors" style={{ color: "rgba(101,224,205,0.15)" }}>
                    <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z" clipRule="evenodd" />
                  </svg>
                  <StarRating rating={r.rating} />
                  <p className={`text-white/70 text-sm leading-relaxed flex-1 ${expanded !== r._id ? "line-clamp-3" : ""}`}>
                    {r.comment}
                  </p>
                  {r.comment.length > 100 && (
                    <button onClick={() => setExpanded(expanded === r._id ? null : r._id)}
                      className="text-xs font-semibold transition-colors text-right" style={{ color: "#65E0CD" }}>
                      {expanded === r._id ? "أقل ▲" : "المزيد ▼"}
                    </button>
                  )}
                  <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                    <Avatar name={r.name} gender={r.gender} />
                    <div>
                      <p className="text-white font-bold text-sm">{r.name}</p>
                      <p className="text-white/40 text-xs">عميل موثوق</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile carousel */}
            <div className="md:hidden mb-8">
              <div className="overflow-hidden" dir="ltr">
                <div className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(${activeIdx * -100}%)` }}>
                  {reviews.map((r) => (
                    <div key={r._id} className="w-full shrink-0 px-1">
                      <div className="border rounded-2xl p-5 flex flex-col gap-4 shadow-sm" style={{background:'rgba(255,255,255,0.08)',borderColor:'rgba(255,255,255,0.15)'}}>
                        <StarRating rating={r.rating} />
                        <p className="text-white/70 text-sm leading-relaxed">{r.comment}</p>
                        <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                          <Avatar name={r.name} gender={r.gender} />
                          <div>
                            <p className="text-white font-bold text-sm">{r.name}</p>
                            <p className="text-white/40 text-xs">عميل موثوق</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center gap-1.5 mt-4">
                {reviews.map((_, i) => (
                  <button key={i} onClick={() => setActiveIdx(i)}
                    className={`rounded-full transition-all duration-300 ${i === activeIdx ? "w-6 h-2" : "w-2 h-2 bg-gray-300 hover:bg-gray-400"}`} style={i === activeIdx ? { background: "#053132" } : {}} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </div>
            <p className="text-white/40 text-sm">لا توجد آراء بعد — كن أول من يشارك تجربته!</p>
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col items-center gap-4">
          {submitted ? (
            <div className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold" style={{ background: "rgba(101,224,205,0.1)", border: "1px solid rgba(101,224,205,0.3)", color: "#65E0CD" }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
              </svg>
              تم إرسال تعليقك وسيظهر بعد المراجعة
            </div>
          ) : (
            <button onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-black font-bold text-sm hover:-translate-y-0.5 transition-all duration-300" style={{ background: "#65E0CD", boxShadow: "0 8px 20px rgba(101,224,205,0.25)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
              </svg>
              {showForm ? "إلغاء" : "شارك تجربتك"}
            </button>
          )}

          {showForm && (
            <form onSubmit={handleSubmit}
              className="w-full max-w-lg rounded-2xl p-6 flex flex-col gap-4 shadow-xl" style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)'}}>
              <input type="text" placeholder="اسمك" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-all" style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.2)'}}
                onFocus={e=>{e.currentTarget.style.borderColor='#053132';e.currentTarget.style.boxShadow='0 0 0 3px rgba(5,49,50,0.15)';}} onBlur={e=>{e.currentTarget.style.borderColor='';e.currentTarget.style.boxShadow='';}} required />
              <textarea placeholder="اكتب تجربتك مع المتجر..." value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                rows={3}
                className="rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-all resize-none" style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.2)'}}
                onFocus={e=>{e.currentTarget.style.borderColor='#053132';e.currentTarget.style.boxShadow='0 0 0 3px rgba(5,49,50,0.15)';}} onBlur={e=>{e.currentTarget.style.borderColor='';e.currentTarget.style.boxShadow='';}} required />
              <div className="flex items-center gap-3">
                <span className="text-white/80 text-sm">تقييمك:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setForm({ ...form, rating: s })}
                      className="transition-transform hover:scale-125">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        fill={s <= form.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}
                        className={`w-6 h-6 ${s <= form.rating ? "text-amber-400" : "text-gray-300"}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={submitting}
                className="text-black font-bold py-3 rounded-xl transition-all disabled:opacity-50 text-sm" style={{ background: "#65E0CD", boxShadow: "0 4px 14px rgba(101,224,205,0.25)" }}>
                {submitting ? "جاري الإرسال..." : "إرسال التعليق"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
