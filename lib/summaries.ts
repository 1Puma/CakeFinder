import type { CakeSpec } from "./taxonomy";

export type SpecSummaries = CakeSpec["summaries"];

export const emptySummaries: SpecSummaries = {
  coating: "",
  borders: "",
  accents: "",
  finishes: "",
  toppings: "",
  other: "",
};

type Located = { visualDescription: string; locator: string };

export function itemSentence(item: Located): string {
  const description = item.visualDescription.trim();
  const locator = item.locator.trim();
  if (!description) {
    return locator;
  }
  if (!locator || description.toLowerCase().includes(locator.toLowerCase())) {
    return description;
  }
  const desc = description.endsWith(".") ? description : `${description}.`;
  const loc = locator.charAt(0).toUpperCase() + locator.slice(1);
  return `${desc} ${loc.endsWith(".") ? loc : `${loc}.`}`;
}

type SummarySource = {
  coating: CakeSpec["coating"];
  borders: CakeSpec["borders"];
  accents: CakeSpec["accents"];
  finishes: CakeSpec["finishes"];
  toppings: CakeSpec["toppings"];
  other: CakeSpec["other"];
  summaries?: SpecSummaries;
};

export function summariesFromVision(spec: SummarySource): SpecSummaries {
  return {
    coating: spec.coating ? itemSentence(spec.coating) : "",
    borders: spec.borders.map(itemSentence).join(" "),
    accents: spec.accents.map(itemSentence).join(" "),
    finishes: spec.finishes.map(itemSentence).join(" "),
    toppings: [
      ...spec.toppings.kinds.map(itemSentence),
      ...spec.toppings.items.map(itemSentence),
    ].join(" "),
    other: spec.other
      .map((item) => itemSentence({ visualDescription: item.description, locator: item.locator }))
      .join(" "),
  };
}

export function mergeSummaries(spec: SummarySource): SpecSummaries {
  const derived = summariesFromVision(spec);
  const current = spec.summaries;
  if (!current) {
    return derived;
  }
  return {
    coating: current.coating.trim() || derived.coating,
    borders: current.borders.trim() || derived.borders,
    accents: current.accents.trim() || derived.accents,
    finishes: current.finishes.trim() || derived.finishes,
    toppings: current.toppings.trim() || derived.toppings,
    other: current.other.trim() || derived.other,
  };
}
