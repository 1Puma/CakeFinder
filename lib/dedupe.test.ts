import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dedupeDecorators } from "./sources/dedupe";
import type { RawDecorator } from "./types";

function row(overrides: Partial<RawDecorator>): RawDecorator {
  return {
    sourceId: "places",
    externalId: "a",
    name: "East Side Buttercream",
    address: "1410 E 6th St",
    lat: 30.2621,
    lng: -97.7249,
    rating: 4.8,
    reviewCount: 10,
    website: null,
    email: null,
    phone: "5125550100",
    isChain: false,
    photoRefs: [],
    url: null,
    publishedPrice: null,
    ...overrides,
  };
}

describe("dedupe", () => {
  it("merges same name within 50m", () => {
    const a = row({ sourceId: "places", externalId: "1" });
    const b = row({
      sourceId: "yelp",
      externalId: "2",
      lat: 30.2621004,
      lng: -97.7249004,
      phone: null,
    });
    const out = dedupeDecorators([a, b]);
    assert.equal(out.length, 1);
  });
});
