"use client";

export default function AnimatedBackground() {
  return (
    <div className="animated-bg fixed inset-0 -z-10 overflow-hidden">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="blob blob-4" />

      <div className="aurora aurora-1" />
      <div className="aurora aurora-2" />

      <div className="particle p1" /><div className="particle p2" />
      <div className="particle p3" /><div className="particle p4" />
      <div className="particle p5" /><div className="particle p6" />

      <div className="scan-line" />
      <div className="grid-overlay" />
      <div className="top-shine" />
    </div>
  );
}
