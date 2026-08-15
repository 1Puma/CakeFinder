"use client";

import type { TraceStep, TraceStepType } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

function prefixColor(type: TraceStepType): string {
  switch (type) {
    case "plan":
      return "var(--acc-coating)";
    case "reject":
      return "var(--amber-flag)";
    case "replan":
      return "var(--acc-borders)";
    case "complete":
      return "var(--ink)";
    case "search":
    case "evaluate":
    case "substitute":
    case "rank":
      return "var(--ink-soft)";
    default: {
      const _never: never = type;
      return _never;
    }
  }
}

function prefixLabel(type: TraceStepType): string {
  switch (type) {
    case "plan":
      return "plan";
    case "search":
      return "search";
    case "evaluate":
      return "eval";
    case "reject":
      return "reject";
    case "replan":
      return "replan";
    case "substitute":
      return "sub";
    case "rank":
      return "rank";
    case "complete":
      return "done";
    default: {
      const _never: never = type;
      return _never;
    }
  }
}

function TraceLog(props: { steps: TraceStep[] }) {
  return (
    <ol className="max-h-56 space-y-1 overflow-auto px-4 pb-4 md:px-6">
      {props.steps.map((step, index) => (
        <li
          key={`${step.at}-${index}`}
          className="trace-line font-data text-[13px] tracking-[0.02em] text-slate"
        >
          <span style={{ color: prefixColor(step.type) }}>{prefixLabel(step.type)}</span>
          {"  "}
          {step.message}
        </li>
      ))}
    </ol>
  );
}

export function AgentTrace(props: { steps: TraceStep[]; complete: boolean }) {
  const [open, setOpen] = useState(true);
  const touchStartY = useRef<number | null>(null);
  const latest = props.steps[props.steps.length - 1];

  useEffect(() => {
    setOpen(!props.complete);
  }, [props.complete]);

  const summary = latest ? latest.message : "Waiting to search…";

  return (
    <>
      <section className="hidden border-t border-hairline bg-card md:block">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
          <p className="font-data truncate text-[13px] tracking-[0.02em] text-slate">{summary}</p>
          <button
            type="button"
            className="btn btn-quiet min-h-11"
            onClick={() => setOpen((v) => !v)}
            disabled={!props.complete}
          >
            {open ? "Collapse trace" : "Expand trace"}
          </button>
        </div>
        {open || !props.complete ? <TraceLog steps={props.steps} /> : null}
      </section>

      <div className="h-14 md:hidden" />
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-card md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        onTouchStart={(event) => {
          touchStartY.current = event.touches[0]?.clientY ?? null;
        }}
        onTouchEnd={(event) => {
          const start = touchStartY.current;
          const end = event.changedTouches[0]?.clientY;
          touchStartY.current = null;
          if (start == null || end == null) return;
          if (start - end > 40) setOpen(true);
          if (end - start > 40) setOpen(false);
        }}
      >
        <button
          type="button"
          className="flex min-h-11 w-full items-center px-4 text-left"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="font-data truncate text-[13px] tracking-[0.02em] text-slate">
            {summary}
          </span>
        </button>
        {open ? (
          <div className="max-h-[70vh] overflow-auto">
            <TraceLog steps={props.steps} />
          </div>
        ) : null}
      </div>
    </>
  );
}
