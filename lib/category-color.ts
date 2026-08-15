import type { CategoryKey } from "@/lib/taxonomy";

export const categoryColor: Record<CategoryKey, string> = {
  structure: "var(--gel-teal)",
  frosting: "var(--gel-marigold)",
  piping: "var(--gel-coral)",
  decor: "var(--gel-lilac)",
  finish: "var(--gel-plum)",
};

export const categoryLabel: Record<CategoryKey, string> = {
  structure: "Structure",
  frosting: "Frosting",
  piping: "Piping",
  decor: "Decor",
  finish: "Finish",
};
