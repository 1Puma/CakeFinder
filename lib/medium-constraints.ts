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

  let frostingPrimary = spec.frosting.primary;
  if (frostingPrimary && !rules.frostingAllowed.includes(frostingPrimary)) {
    stripped.push(`frosting:${frostingPrimary}`);
    frostingPrimary = null;
  }

  const finishes = spec.finishes.filter((item) => {
    if (rules.excludedFinishes.includes(item.type)) {
      stripped.push(`finish:${item.type}`);
      return false;
    }
    return true;
  });

  const kinds = spec.toppings.kinds.filter((item) => {
    if (rules.excludedToppings.includes(item.type)) {
      stripped.push(`topping:${item.type}`);
      return false;
    }
    return true;
  });

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
    frosting: { primary: frostingPrimary },
    finishes,
    toppings: { ...spec.toppings, kinds },
    flags,
  };
}
