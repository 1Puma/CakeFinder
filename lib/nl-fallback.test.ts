import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyNaturalLanguageFallback } from "./nl-fallback";
import { fixtureSpecs } from "./fixtures";
import { cakeSpecSchema } from "./taxonomy";

describe("nl fallback", () => {
  it("reduces tiers and drops gold leaf", () => {
    const spec = cakeSpecSchema.parse(fixtureSpecs.tieredFondant);
    const result = applyNaturalLanguageFallback(spec, "make it two tiers and drop the gold leaf");
    assert.equal(result.spec.structure.tierCount, 2);
    assert.equal(
      result.spec.toppings.kinds.some((k) => k.type === "gold_leaf"),
      false,
    );
    assert.ok(result.changes.length >= 2);
  });
});
