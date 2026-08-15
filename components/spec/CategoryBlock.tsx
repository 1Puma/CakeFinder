"use client";

import { categoryColor, categoryLabel } from "@/lib/category-color";
import type { AnalysisCategoryKey } from "@/lib/taxonomy";
import { useState, type ReactNode } from "react";

export function CategoryBlock(props: {
  category: AnalysisCategoryKey;
  defaultOpen: boolean;
  lowConfidence?: boolean;
  sentence: string;
  onSentenceChange: (value: string) => void;
  onSelect?: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(props.defaultOpen);
  const rule = props.category === "other" ? "var(--ink-soft)" : categoryColor[props.category];
  const label = props.category === "other" ? "Also on this cake" : categoryLabel[props.category];
  return (
    <details
      className="px-1 py-1"
      style={{
        borderLeft: `${props.lowConfidence ? "3px dashed" : "3px solid"} ${rule}`,
      }}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary
        className="flex min-h-11 cursor-pointer items-center px-3 font-data text-[12px] uppercase tracking-[0.02em] text-ink-soft"
        onClick={() => props.onSelect?.()}
      >
        {label}
      </summary>
      <div className="px-3 pb-3">
        {props.children}
        <label className="mt-3 block">
          <span className="spec-label">What we saw</span>
          <textarea
            className="spec-note mt-1"
            rows={3}
            value={props.sentence}
            onChange={(event) => props.onSentenceChange(event.target.value)}
            onFocus={() => props.onSelect?.()}
          />
        </label>
      </div>
    </details>
  );
}
