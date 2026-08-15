import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fixtureSpecs } from "./fixtures";
import { cakeSpecSchema } from "./taxonomy";
import { toggleToppingKind } from "./spec-toggles";

describe("spec toggles", () => {
  it("unchecks gold leaf without dropping the rest of the spec", () => {
    const spec = cakeSpecSchema.parse(fixtureSpecs.tieredFondant);
    const next = toggleToppingKind(spec, "gold_leaf", false);
    assert.equal(
      next.toppings.kinds.some((kind) => kind.type === "gold_leaf"),
      false,
    );
    assert.ok(next.toppings.kinds.some((kind) => kind.type === "fondant_cutouts"));
    assert.equal(next.borders.length, spec.borders.length);
  });
});
