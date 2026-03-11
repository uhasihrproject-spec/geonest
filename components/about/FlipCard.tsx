"use client";

import { useState } from "react";

export default function FlipCard({
  title,
  front,
  back,
}: {
  title: string;
  front: string;
  back: string;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFlipped((p) => !p)}
      className="group relative w-full text-left outline-none"
      aria-label={`Flip card: ${title}`}
    >
      <div
        className="relative h-[250px] w-full rounded-3xl bg-white p-0 transition hover:-translate-y-1"
        style={{ perspective: "1200px" }}
      >
        <div
          className="absolute inset-0 rounded-3xl transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* FRONT */}
          <div
            className="absolute inset-0 rounded-3xl border border-neutral-200 bg-white p-7 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)]"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="h-1 w-16 rounded bg-yellow-400/80" />
            <h3 className="mt-5 text-xl font-semibold text-neutral-900">
              {title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              {front}
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-600">
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              Tap to flip
            </div>
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 rounded-3xl bg-neutral-900 p-7 text-white shadow-[0_20px_70px_-25px_rgba(0,0,0,0.35)]"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="h-1 w-16 rounded bg-yellow-400/90" />
            <h3 className="mt-5 text-xl font-semibold">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              {back}
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/70">
              Tap again to return
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
