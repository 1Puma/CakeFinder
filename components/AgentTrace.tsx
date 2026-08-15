"use client";

import type { TraceStep } from "@/lib/types";
import { useEffect, useState } from "react";

export function AgentTrace(props: { steps: TraceStep[]; complete: boolean; compact?: boolean }) {
  const [open, setOpen] = useState(!props.compact);
  const latest = props.steps[props.steps.length - 1];

  useEffect(() => {
    if (!props.complete && props.compact) {
      setOpen(false);
    }
  }, [props.complete, props.compact]);

  return (
    <section className="border-t border-ink bg-ink text-icing">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
        <p className="data truncate text-[13px]">
          {latest ? latest.message : "Waiting to search…"}
        </p>
        <button
          type="button"
          className="btn min-h-11 bg-sunflower text-ink"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Collapse trace" : "Expand trace"}
        </button>
      </div>
      {open ? (
        <ol className="max-h-56 space-y-1 overflow-auto px-4 pb-4 md:px-6">
          {props.steps.map((step, index) => (
            <li key={`${step.at}-${index}`} className="data text-[13px] text-butter">
              ▸ {step.message}
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
