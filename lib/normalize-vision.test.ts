import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeVisionPayload } from "./normalize-vision";
import { cakeSpecVisionSchema } from "./taxonomy";

describe("normalizeVisionPayload", () => {
  it("moves unknown taxonomy ids into other and still parses", () => {
    const normalized = normalizeVisionPayload({
      medium: "layered",
      sourceImageUrl: "data:image/jpeg;base64,xx",
      structure: {
        tierCount: 1,
        tiers: [
          {
            index: 0,
            shape: "round",
            approximateDiameterInches: 8,
            approximateHeightInches: 4,
            visualDescription: "Round cake",
            locator: "the whole cake",
          },
        ],
        estimatedServings: 12,
        supportRequired: false,
      },
      coating: {
        style: "airbrushed_galaxy",
        visualDescription: "Airbrushed galaxy sides",
        locator: "side walls",
      },
      borders: [
        {
          type: "shell",
          derivedTip: "#32",
          visualDescription: "Shell border",
          locator: "base",
        },
      ],
      accents: [],
      finishes: [],
      toppings: { kinds: [], items: [] },
      confidence: {
        structure: 0.9,
        coating: 0.4,
        borders: 0.8,
        accents: 0.8,
        finishes: 0.8,
        toppings: 0.8,
      },
      flags: [],
      editedByUser: false,
    });
    const vision = cakeSpecVisionSchema.parse(normalized);
    assert.equal(vision.coating, null);
    assert.equal(vision.borders[0]?.type, "shell");
    assert.equal(vision.other.length, 1);
    assert.match(vision.other[0]?.description ?? "", /galaxy/i);
  });
});
