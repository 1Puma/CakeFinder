"use client";

import type { Match } from "@/lib/types";
import { categoryKeys } from "@/lib/taxonomy";
import { categoryColor, categoryLabel } from "@/lib/category-color";

export function CapabilityDots(props: { match: Match }) {
  const label = categoryKeys
    .map((key) => {
      const score = props.match.categoryScores[key];
      const state = score >= 0.67 ? "evidence" : "no evidence";
      return `${categoryLabel[key]} ${state}`;
    })
    .join(", ");

  return (
    <div className="flex min-h-11 items-center gap-2" aria-label={label} role="img">
      {categoryKeys.map((key) => {
        const filled = props.match.categoryScores[key] >= 0.67;
        return (
          <span
            key={key}
            title={`${categoryLabel[key]}: ${filled ? "portfolio evidence" : "no evidence found"}`}
            className="inline-block h-3 w-3 rounded-full border"
            style={{
              borderColor: categoryColor[key],
              background: filled ? categoryColor[key] : "transparent",
            }}
          />
        );
      })}
    </div>
  );
}
