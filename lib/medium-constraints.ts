import mediumConstraintsJson from "../data/taxonomy/medium-constraints.json";
import type { CakeSpec, SpecFlag } from "@/lib/taxonomy";

type IceCreamConstraints = (typeof mediumConstraintsJson)["ice_cream"];

export function applyMediumConstraints(spec: CakeSpec): CakeSpec {
  if (spec.medium !== "ice_cream") {
    return spec;
  }
  const rules: IceCreamConstraints = mediumConstraintsJson.ice_cream;
  const stripped: string[] = [];
  const allowedShapes = new Set(rules.structureRestrictedTo);

  const tiers = spec.structure.tiers.slice(0, rules.maxTiers).map((tier, index) => {
    if (!allowedShapes.has(tier.shape)) {
      stripped.push(`shape:${tier.shape}`);
      return { ...tier, index, shape: "round" as const };
    }
    return { ...tier, index };
  });

  const frostingAllowed = new Set(rules.frostingAllowed);
  let primary = spec.frosting.primary;
  if (!frostingAllowed.has(primary)) {
    stripped.push(`frosting:${primary}`);
    primary = "pastry_pride";
  }
  let secondary = spec.frosting.secondary;
  if (secondary && !frostingAllowed.has(secondary)) {
    stripped.push(`frosting:${secondary}`);
    secondary = null;
  }

  const finish = { ...spec.finish };
  if (rules.excludedFinish.includes("metallicLeaf") && finish.metallicLeaf !== "none") {
    stripped.push(`finish:metallicLeaf:${finish.metallicLeaf}`);
    finish.metallicLeaf = "none";
  }
  if (rules.excludedFinish.includes("isomalt") && finish.isomalt) {
    stripped.push("finish:isomalt");
    finish.isomalt = false;
  }
  if (rules.excludedFinish.includes("waferPaper") && finish.waferPaper) {
    stripped.push("finish:waferPaper");
    finish.waferPaper = false;
  }

  let freshFlorals = spec.decor.freshFlorals;
  if (rules.excludedDecor.includes("freshFlorals") && freshFlorals) {
    stripped.push("decor:freshFlorals");
    freshFlorals = false;
  }

  let sculptural = spec.decor.sculptural;
  if (!rules.sculpturalAllowed && sculptural.length > 0) {
    stripped.push("decor:sculptural");
    sculptural = [];
  }

  const flags: SpecFlag[] = spec.flags.filter((f) => f.code !== "medium_constraint");
  if (stripped.length > 0) {
    flags.push({
      code: "medium_constraint",
      message: `${rules.rationale} Removed: ${stripped.join(", ")}.`,
      details: stripped,
    });
  }

  return {
    ...spec,
    structure: {
      ...spec.structure,
      tierCount: tiers.length,
      tiers,
      supportRequired: false,
    },
    frosting: { ...spec.frosting, primary, secondary },
    decor: { ...spec.decor, freshFlorals, sculptural },
    finish,
    flags,
  };
}
