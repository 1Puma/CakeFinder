import type { CategoryKey } from "@/lib/taxonomy";

export const categoryColor: Record<CategoryKey, string> = {
  structure: "var(--gel-structure)",
  frosting: "var(--gel-frosting)",
  piping: "var(--gel-piping)",
  decor: "var(--gel-decor)",
  finish: "var(--gel-finish)",
};

export const categoryLabel: Record<CategoryKey, string> = {
  structure: "Structure",
  frosting: "Frosting",
  piping: "Piping",
  decor: "Decor",
  finish: "Finish",
};
