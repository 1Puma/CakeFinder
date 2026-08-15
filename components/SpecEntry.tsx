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
}) {
  const rule = props.flagged ? "var(--amber-flag)" : categoryColor[props.category];
  return (
    <article
      className={`px-3 py-2 ${props.lowConfidence ? "bg-icing" : ""}`}
      style={{
        borderLeft: `${props.lowConfidence ? "3px dashed" : "3px solid"} ${rule}`,
      }}
    >
      <p className="data text-[12px] uppercase tracking-wide">{props.label}</p>
      <div className="text-[15px]">{props.children}</div>
      {props.lowConfidence ? (
        <p className="mt-1 text-[13px] text-flag">Not sure about this. Check this one.</p>
      ) : null}
      {props.edited ? <p className="data text-[12px] text-slate">Edited</p> : null}
    </article>
  );
}
