import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rarityScore, specToRequiredFlags } from "./capability";
import { cakeSpecSchema } from "./taxonomy";
import { applyMediumConstraints } from "./medium-constraints";
import { fixtureSpecs } from "./fixtures";

describe("capability", () => {
  it("extracts rare flags from the gold-leaf fixture", () => {
    const spec = cakeSpecSchema.parse(fixtureSpecs.tieredFondant);
    const flags = specToRequiredFlags(spec);
    assert.ok(flags.includes("topping:gold_leaf"));
    assert.ok(flags.includes("structure:tiered"));
    assert.ok(rarityScore("topping:gold_leaf") > rarityScore("coating:smooth"));
  });
});

describe("medium constraints", () => {
  it("strips gold leaf and extra tiers from ice cream mode", () => {
    const layered = cakeSpecSchema.parse(fixtureSpecs.tieredFondant);
    const ice = applyMediumConstraints({ ...layered, medium: "ice_cream" });
    assert.equal(ice.structure.tierCount, 1);
    assert.equal(
      ice.toppings.kinds.some((k) => k.type === "gold_leaf"),
      false,
    );
    assert.ok(ice.flags.some((f) => f.code === "medium_constraint"));
  });
});
