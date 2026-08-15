import {
  accentChoices,
  borderChoices,
  coatingChoices,
  finishChoices,
  frostingTypes,
  toppingChoices,
  type CakeSpec,
  type CategoryKey,
} from "./taxonomy";
import type { CapabilityFlag } from "./types";

const rarityByFlag = new Map<string, number>();

for (const item of frostingTypes) {
  rarityByFlag.set(`frosting:${item.id}`, item.rarity);
}
for (const item of coatingChoices) {
  rarityByFlag.set(`coating:${item.id}`, item.rarity);
}
for (const item of borderChoices) {
  rarityByFlag.set(`border:${item.id}`, item.rarity);
}
for (const item of accentChoices) {
  rarityByFlag.set(`accent:${item.id}`, item.rarity);
}
for (const item of finishChoices) {
  rarityByFlag.set(`finish:${item.id}`, item.rarity);
}
for (const item of toppingChoices) {
  rarityByFlag.set(`topping:${item.id}`, item.rarity);
}
rarityByFlag.set("structure:tiered", 0.35);
rarityByFlag.set("medium:ice_cream", 0.4);

export function specToRequiredFlags(spec: CakeSpec): CapabilityFlag[] {
  const flags = new Set<CapabilityFlag>();
  if (spec.frosting.primary) {
    flags.add(`frosting:${spec.frosting.primary}`);
  }
  if (spec.structure.tierCount > 1) {
    flags.add("structure:tiered");
  }
  if (spec.medium === "ice_cream") {
    flags.add("medium:ice_cream");
  }
  if (spec.coating) {
    flags.add(`coating:${spec.coating.style}`);
  }
  for (const border of spec.borders) {
    flags.add(`border:${border.type}`);
  }
  for (const accent of spec.accents) {
    flags.add(`accent:${accent.type}`);
  }
  for (const finish of spec.finishes) {
    flags.add(`finish:${finish.type}`);
  }
  for (const kind of spec.toppings.kinds) {
    flags.add(`topping:${kind.type}`);
  }
  return [...flags];
}

export function rarityScore(flag: CapabilityFlag): number {
  return rarityByFlag.get(flag) ?? 0.5;
}

export function limitingConstraints(flags: CapabilityFlag[], take = 3): CapabilityFlag[] {
  return [...flags].sort((a, b) => rarityScore(b) - rarityScore(a)).slice(0, take);
}

export function flagCategory(flag: CapabilityFlag): CategoryKey {
  if (flag.startsWith("coating:")) return "coating";
  if (flag.startsWith("border:")) return "borders";
  if (flag.startsWith("accent:")) return "accents";
  if (flag.startsWith("finish:")) return "finishes";
  if (flag.startsWith("topping:")) return "toppings";
  return "coating";
}
