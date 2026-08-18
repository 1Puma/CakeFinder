import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { specToRequiredFlags } from "../capability";
import { fixtureSpecs } from "../fixtures";
import type { CapabilityEvidence, Decorator } from "../types";
import { MATCH_THRESHOLD, pickMatches } from "./match-agent";
import { coverage, decoratorHasFlag, rankMatches, scoreDecorator } from "./score";

function shop(overrides: Partial<Decorator>): Decorator {
  return {
    id: "shop",
    name: "Test Shop",
    sources: [],
    address: "Austin, TX",
    lat: 30.2672,
    lng: -97.7431,
    rating: 4,
    reviewCount: 10,
    portfolioImages: [],
    capabilities: [],
    hasLicensedPrintProgram: false,
    isChain: false,
    claimedByUser: false,
    lastIndexedAt: new Date(),
    city: "Austin, TX",
    email: null,
    website: null,
    publishedPrice: null,
    phone: null,
    ...overrides,
  };
}

function evidence(flag: string, confidence: number): CapabilityEvidence {
  return { flag, confidence, evidenceImageIds: [], reasoning: "test" };
}

const required = specToRequiredFlags(fixtureSpecs.tieredFondant);

describe("decorator matching", () => {
  it("counts a weak photo match at 0.35 confidence", () => {
    const decorator = shop({
      capabilities: [evidence("topping:gold_leaf", 0.35)],
    });
    assert.equal(decoratorHasFlag(decorator, "topping:gold_leaf"), true);
  });

  it("lists a shop that only hits the rare flag among many requirements", () => {
    const match = scoreDecorator(
      shop({
        id: "gold-only",
        name: "Gold Only",
        capabilities: [evidence("topping:gold_leaf", 0.8)],
      }),
      required,
      "Austin, TX",
    );
    const score = coverage(match);
    assert.ok(
      score >= MATCH_THRESHOLD,
      `gold-leaf-only coverage ${score} should pass ${MATCH_THRESHOLD} (old bar was 0.45)`,
    );
    assert.ok(score < 0.45, "this case is why 0.45 was too tight");
    assert.equal(pickMatches([match]).length, 1);
  });

  it("lists an unindexed local shop instead of dropping coverage 0", () => {
    const match = scoreDecorator(
      shop({ id: "yelp-bakery", name: "Yelp Bakery" }),
      required,
      "Austin, TX",
    );
    assert.equal(match.matchedFlags.length, 0);
    assert.ok(coverage(match) >= MATCH_THRESHOLD);
    assert.match(match.reasoning, /not indexed/);
    assert.equal(pickMatches([match])[0]?.decorator.name, "Yelp Bakery");
  });

  it("ranks East Side ahead of an unindexed shop and a one-flag shop", () => {
    const eastSide = scoreDecorator(
      shop({
        id: "east-side-buttercream",
        name: "East Side Buttercream",
        reviewCount: 210,
        capabilities: [
          evidence("structure:tiered", 0.92),
          evidence("coating:smooth", 0.9),
          evidence("border:shell", 0.88),
          evidence("border:bead", 0.85),
          evidence("accent:rosettes", 0.85),
          evidence("topping:gold_leaf", 0.84),
        ],
      }),
      required,
      "Austin, TX",
    );
    const goldOnly = scoreDecorator(
      shop({
        id: "gold-only",
        name: "Gold Only",
        reviewCount: 40,
        capabilities: [evidence("topping:gold_leaf", 0.8)],
      }),
      required,
      "Austin, TX",
    );
    const unknown = scoreDecorator(
      shop({ id: "yelp-bakery", name: "Yelp Bakery", reviewCount: 400 }),
      required,
      "Austin, TX",
    );
    const ranked = rankMatches(pickMatches([unknown, goldOnly, eastSide]));
    assert.equal(ranked[0]?.decorator.name, "East Side Buttercream");
    assert.ok(ranked.some((m) => m.decorator.name === "Yelp Bakery"));
    assert.ok(ranked.some((m) => m.decorator.name === "Gold Only"));
  });

  it("returns nearby shops when nobody clears the coverage bar", () => {
    const far = scoreDecorator(
      shop({
        id: "smooth-only",
        name: "Smooth Only",
        capabilities: [evidence("coating:smooth", 0.9)],
      }),
      required,
      "Austin, TX",
    );
    assert.ok(coverage(far) < MATCH_THRESHOLD);
    const picked = pickMatches([far]);
    assert.equal(picked[0]?.decorator.name, "Smooth Only");
  });
});
