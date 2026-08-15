import { labelFor, type CakeSpec } from "./taxonomy";

export function specPlainLanguage(spec: CakeSpec): string {
  const tiers = spec.structure.tiers
    .map(
      (t) =>
        `Tier ${t.index + 1}: ${labelFor("shape", t.shape)}${t.approximateDiameterInches ? `, ~${t.approximateDiameterInches}"` : ""}`,
    )
    .join("; ");
  const borders = spec.piping.borders
    .map(
      (b) =>
        `${b.type.replaceAll("_", " ")} at ${b.placement.replaceAll("_", " ")} (tip ${b.derivedTip})`,
    )
    .join("; ");
  const surface = spec.piping.surfaceElements
    .map((s) => `${s.kind.replaceAll("_", " ")}${s.count ? ` ×${s.count}` : ""}`)
    .join("; ");
  const print = spec.decor.ediblePrint
    ? `Edible print: ${spec.decor.ediblePrint.subject} (${spec.decor.ediblePrint.shape}, ${spec.decor.ediblePrint.approximateSizeInches ?? "size unknown"}")`
    : "No edible print";
  const licensed = spec.decor.licensedCharacters.length
    ? spec.decor.licensedCharacters
        .map((c) => c.detectedName ?? c.franchise ?? "unidentified copyrighted character")
        .join(", ")
    : "None";
  const finishBits = [
    spec.finish.metallicLeaf !== "none" ? `${spec.finish.metallicLeaf} leaf` : null,
    spec.finish.pearls ? "pearls" : null,
    spec.finish.sprinkles ? "sprinkles" : null,
    spec.finish.edibleGlitter ? "edible glitter" : null,
    spec.finish.isomalt ? "isomalt" : null,
    spec.finish.waferPaper ? "wafer paper" : null,
    spec.finish.airbrush ? "airbrush" : null,
    spec.finish.drip ? "drip" : null,
    spec.finish.marbling ? "marbling" : null,
    spec.finish.texturedPaletteKnife ? "palette-knife texture" : null,
  ].filter((v): v is string => v !== null);

  return [
    `Medium: ${spec.medium === "ice_cream" ? "ice cream cake" : "layered cake"}`,
    `Structure: ${spec.structure.tierCount} tier(s). ${tiers}. Servings ~${spec.structure.estimatedServings ?? "unknown"}. Support ${spec.structure.supportRequired ? "required" : "not required"}.`,
    `Frosting: ${labelFor("frosting", spec.frosting.primary)}${spec.frosting.secondary ? ` over ${labelFor("frosting", spec.frosting.secondary)}` : ""}.`,
    `Piping: ${borders || "none listed"}. Surface: ${surface || "none listed"}.`,
    `Decor: ${print}. Licensed characters: ${licensed}. Fresh florals: ${spec.decor.freshFlorals ? "yes" : "no"}.`,
    `Finish: ${finishBits.join(", ") || "plain"}.`,
  ].join("\n");
}

export function complexityLabel(spec: CakeSpec): string {
  let score = spec.structure.tierCount;
  if (spec.frosting.primary === "fondant") score += 2;
  if (spec.finish.metallicLeaf !== "none") score += 2;
  if (spec.decor.sculptural.length > 0) score += 2;
  if (spec.piping.borders.some((b) => b.type === "drop_string" || b.type === "scroll")) score += 1;
  if (score <= 3) return "Straightforward bench work.";
  if (score <= 6) return "Intermediate: stacked structure and detailed piping.";
  return "Advanced: plan extra bench time for structure and finish work.";
}
