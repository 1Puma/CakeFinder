"use client";

import { useEffect, useRef, useState } from "react";
import { CakePhoto } from "@/components/CakePhoto";

const stages = [
  { at: 0, scale: 1, x: 0, y: 0, label: null as string | null },
  { at: 0.2, scale: 1.9, x: 0, y: 18, label: "Dollops · piped tops" },
  { at: 0.4, scale: 1.75, x: 2, y: -6, label: "Drips · ganache" },
  { at: 0.6, scale: 2.15, x: 4, y: 24, label: "Toppings · Oreo, halved, 12 pieces" },
  { at: 0.8, scale: 1.95, x: 0, y: -30, label: "Shell border · TIP #32" },
  { at: 1, scale: 1, x: 0, y: 0, label: null },
] as const;

const specLines = [
  { rule: "var(--acc-accents)", text: "Dollops · piped tops" },
  { rule: "var(--acc-finishes)", text: "Drips · ganache" },
  { rule: "var(--acc-toppings)", text: "Toppings · Oreo, halved, 12 pieces" },
  { rule: "var(--acc-borders)", text: "Shell border · TIP #32" },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function sample(progress: number): { scale: number; x: number; y: number; label: string | null } {
  const nextIndex = stages.findIndex((s) => s.at >= progress);
  const hi = nextIndex === -1 ? stages.length - 1 : nextIndex;
  const lo = Math.max(0, hi - 1);
  const a = stages[lo] ?? stages[0];
  const b = stages[hi] ?? a;
  if (!a || !b || a.at === b.at) {
    return { scale: a?.scale ?? 1, x: a?.x ?? 0, y: a?.y ?? 0, label: a?.label ?? null };
  }
  const t = (progress - a.at) / (b.at - a.at);
  return {
    scale: lerp(a.scale, b.scale, t),
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    label: t < 0.5 ? a.label : b.label,
  };
}

export function HeroScroll() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const apply = () => {
      const el = trackRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = -el.getBoundingClientRect().top;
      setProgress(total <= 0 ? 0 : Math.min(1, Math.max(0, scrolled / total)));
    };
    apply();
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
    };
  }, []);

  const frame = reduced ? { scale: 1, x: 0, y: 0, label: null } : sample(progress);
  const assembled = reduced || progress > 0.92;

  return (
    <div ref={trackRef} className={reduced ? "" : "h-[420vh]"}>
      <div className={reduced ? "py-10" : "sticky top-0 flex min-h-screen items-center py-8"}>
        <div className="mx-auto grid w-full max-w-[1200px] items-center gap-10 px-4 md:px-6 desk:grid-cols-2">
          <div className="overflow-hidden rounded-[var(--r-image)] bg-card shadow-[var(--shadow-card)]">
            <div
              style={{
                transform: `translate(${frame.x}%, ${frame.y}%) scale(${frame.scale})`,
                transformOrigin: "center center",
                transition: reduced ? "none" : "transform 80ms linear",
              }}
            >
              <CakePhoto
                src="/hero-cake.jpg"
                alt="Round cake with ganache drips, Oreo toppings, and a shell border"
                className="block h-auto w-full object-cover"
              />
            </div>
          </div>
          <div>
            <h1 className="max-w-xl font-display text-[34px] leading-tight text-ink desk:text-[52px]">
              Every custom cake order starts with a screenshot and a guess.
            </h1>
            <p className="mt-4 max-w-md text-[18px]">
              Upload the photo. Get the spec. Find who can build it.
            </p>
            {frame.label && !assembled ? (
              <p
                className="font-data mt-8 text-[13px] tracking-[0.02em] text-ink-soft"
                style={{ borderLeft: "3px solid var(--acc-borders)", paddingLeft: 12 }}
              >
                {frame.label}
              </p>
            ) : null}
            {assembled ? (
              <ul className="mt-8 space-y-3">
                {specLines.map((line) => (
                  <li
                    key={line.text}
                    className="font-data text-[13px] tracking-[0.02em] text-ink-soft"
                    style={{ borderLeft: `3px solid ${line.rule}`, paddingLeft: 12 }}
                  >
                    {line.text}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
