import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rarityScore, specToRequiredFlags } from "./capability";
import { cakeSpecSchema } from "./taxonomy";
import { applyMediumConstraints } from "./medium-constraints";
import { fixtureSpecs } from "./fixtures";

describe("capability", () => {
  it("extracts rare flags from the licensed character fixture", () => {
    const spec = cakeSpecSchema.parse(fixtureSpecs.licensed);
    const flags = specToRequiredFlags(spec);
    assert.ok(flags.includes("decor:licensed_print"));
    assert.ok(flags.includes("structure:tiered"));
    assert.ok(rarityScore("decor:licensed_print") > rarityScore("frosting:buttercream_american"));
  });
});

describe("medium constraints", () => {
  it("strips gold leaf and extra tiers from ice cream mode", () => {
    const layered = cakeSpecSchema.parse(fixtureSpecs.tieredFondant);
    const ice = applyMediumConstraints({ ...layered, medium: "ice_cream" });
    assert.equal(ice.structure.tierCount, 1);
    assert.equal(ice.finish.metallicLeaf, "none");
    assert.ok(ice.flags.some((f) => f.code === "medium_constraint"));
  });
});
