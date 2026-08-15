import { labelFor, type CakeSpec } from "./taxonomy";

export function specPlainLanguage(spec: CakeSpec): string {
  const tiers = spec.structure.tiers
    .map(
      (t) =>
        `Tier ${t.index + 1}: ${labelFor("shape", t.shape)}${t.approximateDiameterInches ? `, ~${t.approximateDiameterInches}"` : ""}`,
    )
    .join("; ");
  const borders = spec.borders
    .map((b) => `${labelFor("border", b.type)} (tip ${b.derivedTip})`)
    .join("; ");
  const accents = spec.accents
    .map((a) => `${labelFor("accent", a.type)}${a.count ? ` ×${a.count}` : ""}`)
    .join("; ");
  const finishes = spec.finishes.map((f) => labelFor("finish", f.type)).join("; ");
  const kinds = spec.toppings.kinds.map((k) => labelFor("topping", k.type)).join("; ");
  const items = spec.toppings.items
    .map((item) => {
      const count = item.count != null ? `${item.count} ` : "";
      return `${count}${item.item}, ${item.arrangement}`;
    })
    .join("; ");
  const frosting = spec.frosting.primary
    ? labelFor("frosting", spec.frosting.primary)
    : "not chosen yet";

  return [
    `Medium: ${spec.medium === "ice_cream" ? "ice cream cake" : "layered cake"}`,
    `Structure: ${spec.structure.tierCount} tier(s). ${tiers}. Servings ~${spec.structure.estimatedServings ?? "unknown"}.`,
    `Frosting: ${frosting}.`,
    `Coating: ${spec.coating ? labelFor("coating", spec.coating.style) : "none listed"}.`,
    `Borders: ${borders || "none listed"}.`,
    `Accents: ${accents || "none listed"}.`,
    `Finishes: ${finishes || "none listed"}.`,
    `Toppings: ${kinds || "none listed"}. ${items ? `Items: ${items}.` : ""}`,
  ].join("\n");
}

export function complexityLabel(spec: CakeSpec): string {
  let score = spec.structure.tierCount;
  if (spec.coating?.style === "fault_line") score += 2;
  if (spec.toppings.kinds.some((k) => k.type === "gold_leaf" || k.type === "sugarwork")) score += 2;
  if (spec.accents.some((a) => a.type === "piped_flowers")) score += 1;
  if (spec.borders.some((b) => b.type === "cornelli")) score += 1;
  if (score <= 3) return "Straightforward bench work.";
  if (score <= 6) return "Intermediate: stacked structure and detailed piping.";
  return "Advanced: plan extra bench time for structure and finish work.";
}
