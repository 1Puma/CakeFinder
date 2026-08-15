import { categoryColor } from "@/lib/category-color";
import type { CategoryKey } from "@/lib/taxonomy";
import type { ReactNode } from "react";

export function SpecEntry(props: {
  category: CategoryKey;
  label: string;
  children: ReactNode;
  lowConfidence?: boolean;
  flagged?: boolean;
  edited?: boolean;
  expanded?: boolean;
  selected?: boolean;
  onHeaderClick?: () => void;
}) {
  const rule = props.flagged ? "var(--amber-flag)" : categoryColor[props.category];
  const expanded = props.expanded ?? true;
  return (
    <article
      className="px-3 py-2"
      style={{
        borderLeft: `${props.lowConfidence ? "3px dashed" : "3px solid"} ${rule}`,
        background: props.selected
          ? "color-mix(in srgb, var(--ink-violet) 4%, var(--icing-white))"
          : undefined,
      }}
    >
      <button
        type="button"
        className="flex min-h-11 w-full items-center text-left"
        onClick={props.onHeaderClick}
      >
        <span className="font-data text-[13px] uppercase tracking-[0.02em] text-slate">
          {props.label}
        </span>
      </button>
      {expanded ? <div className="spec-value">{props.children}</div> : null}
      {expanded && props.lowConfidence ? (
        <p className="mt-1 text-[13px] text-flag">Not sure about this one.</p>
      ) : null}
      {expanded && props.edited ? (
        <p className="font-data mt-1 text-[12px] tracking-[0.02em] text-slate">Edited</p>
      ) : null}
    </article>
  );
}
