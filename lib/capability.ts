import { borderTypes, finishFlags, frostingTypes, nozzleFamilies } from "./taxonomy";
import type { CakeSpec } from "./taxonomy";
import type { CapabilityFlag } from "./types";

const rarityByFlag = new Map<string, number>();

for (const frosting of frostingTypes) {
  rarityByFlag.set(`frosting:${frosting.id}`, frosting.rarity);
}
for (const border of borderTypes) {
  rarityByFlag.set(`border:${border.id}`, border.rarity);
}
for (const nozzle of nozzleFamilies) {
  rarityByFlag.set(`nozzle:${nozzle.id}`, nozzle.rarity);
}
for (const flag of finishFlags) {
  rarityByFlag.set(`finish:${flag.id}`, flag.rarity);
}

rarityByFlag.set("decor:edible_print", 0.4);
rarityByFlag.set("decor:licensed_print", 0.7);
rarityByFlag.set("decor:sculptural", 0.65);
rarityByFlag.set("finish:metallicLeaf", 0.75);
rarityByFlag.set("structure:tiered", 0.35);
rarityByFlag.set("structure:sculpted", 0.75);
rarityByFlag.set("medium:ice_cream", 0.4);

export function specToRequiredFlags(spec: CakeSpec): CapabilityFlag[] {
  const flags = new Set<CapabilityFlag>();
  flags.add(`frosting:${spec.frosting.primary}`);
  if (spec.frosting.secondary) {
    flags.add(`frosting:${spec.frosting.secondary}`);
  }
  if (spec.structure.tierCount > 1) {
    flags.add("structure:tiered");
  }
  if (spec.structure.tiers.some((t) => t.shape === "sculpted")) {
    flags.add("structure:sculpted");
  }
  if (spec.medium === "ice_cream") {
    flags.add("medium:ice_cream");
  }
  for (const border of spec.piping.borders) {
    flags.add(`border:${border.type}`);
  }
  for (const el of spec.piping.surfaceElements) {
    flags.add(`surface:${el.kind}`);
    if (el.inferredNozzleFamily) {
      flags.add(`nozzle:${el.inferredNozzleFamily}`);
    }
  }
  if (spec.decor.ediblePrint) {
    flags.add("decor:edible_print");
  }
  if (spec.decor.licensedCharacters.length > 0) {
    flags.add("decor:licensed_print");
  }
  if (spec.decor.sculptural.length > 0) {
    flags.add("decor:sculptural");
  }
  if (spec.finish.metallicLeaf !== "none") {
    flags.add("finish:metallicLeaf");
  }
  const finishBooleans = [
    "pearls",
    "sprinkles",
    "edibleGlitter",
    "isomalt",
    "waferPaper",
    "airbrush",
    "drip",
    "marbling",
    "texturedPaletteKnife",
  ] as const;
  for (const key of finishBooleans) {
    if (spec.finish[key]) {
      flags.add(`finish:${key}`);
    }
  }
  return [...flags];
}

export function rarityScore(flag: CapabilityFlag): number {
  if (flag.startsWith("surface:")) {
    return 0.4;
  }
  return rarityByFlag.get(flag) ?? 0.5;
}

export function limitingConstraints(flags: CapabilityFlag[], take = 3): CapabilityFlag[] {
  return [...flags].sort((a, b) => rarityScore(b) - rarityScore(a)).slice(0, take);
}

export function flagCategory(
  flag: CapabilityFlag,
): "structure" | "frosting" | "piping" | "decor" | "finish" {
  if (flag.startsWith("frosting:")) return "frosting";
  if (flag.startsWith("border:") || flag.startsWith("nozzle:") || flag.startsWith("surface:")) {
    return "piping";
  }
  if (flag.startsWith("decor:")) return "decor";
  if (flag.startsWith("finish:")) return "finish";
  if (flag.startsWith("structure:") || flag.startsWith("medium:")) return "structure";
  return "structure";
}
