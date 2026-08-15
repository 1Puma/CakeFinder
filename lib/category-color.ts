import type { CategoryKey } from "@/lib/taxonomy";

export const categoryColor: Record<CategoryKey, string> = {
  coating: "var(--acc-coating)",
  borders: "var(--acc-borders)",
  accents: "var(--acc-accents)",
  finishes: "var(--acc-finishes)",
  toppings: "var(--acc-toppings)",
};

export const categoryLabel: Record<CategoryKey, string> = {
  coating: "Coating",
  borders: "Borders",
  accents: "Accents",
  finishes: "Finishes",
  toppings: "Toppings",
};
