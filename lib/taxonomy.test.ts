import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cakeSpecSchema } from "./taxonomy";
import { fixtureSpecs } from "./fixtures";

describe("fixtures", () => {
  it("parse as CakeSpec", () => {
    for (const spec of Object.values(fixtureSpecs)) {
      cakeSpecSchema.parse(spec);
    }
    assert.equal(Object.keys(fixtureSpecs).length, 3);
  });
});
