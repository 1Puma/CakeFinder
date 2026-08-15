import type { CakeSpec } from "./taxonomy";

const createdAt = new Date("2026-08-15T12:00:00.000Z");

const baseConfidence = {
  structure: 0.88,
  coating: 0.8,
  borders: 0.84,
  accents: 0.72,
  finishes: 0.7,
  toppings: 0.76,
};

export const fixtureSpecs: Record<"tieredFondant" | "licensed" | "iceCream", CakeSpec> = {
  tieredFondant: {
    id: "example-tiered",
    medium: "layered",
    sourceImageUrl: "/examples/tiered.svg",
    createdAt,
    editedByUser: false,
    structure: {
      tierCount: 3,
      estimatedServings: 60,
      supportRequired: true,
      tiers: [
        {
          index: 0,
          shape: "round",
          approximateDiameterInches: 10,
          approximateHeightInches: 4,
          visualDescription: "10-inch round cake, the widest of the stack, smooth ivory coating",
          locator: "base of the cake, sitting on the board",
        },
        {
          index: 1,
          shape: "round",
          approximateDiameterInches: 8,
          approximateHeightInches: 4,
          visualDescription: "8-inch round cake stacked above the base",
          locator: "middle of the stack, smaller diameter than the base",
        },
        {
          index: 2,
          shape: "round",
          approximateDiameterInches: 6,
          approximateHeightInches: 3.5,
          visualDescription: "6-inch round top cake with toppings on the crown",
          locator: "top of the stack, smallest diameter",
        },
      ],
    },
    frosting: { primary: null },
    coating: {
      style: "smooth",
      visualDescription: "Crisp, flat ivory coating with sharp edges",
      locator: "every visible side wall",
    },
    borders: [
      {
        type: "shell",
        derivedTip: "#32",
        visualDescription: "Ridged shell border, each shell fanning forward with a tapering tail",
        locator: "base of the cake, running around the board edge",
      },
      {
        type: "bead",
        derivedTip: "#10",
        visualDescription: "Small beads pinched between spheres along the seam",
        locator: "tier seam between bottom and middle cake",
      },
    ],
    accents: [
      {
        type: "rosettes",
        count: 6,
        visualDescription: "Six piped rosettes with medium ridges",
        locator: "top surface, evenly spaced around the rim",
      },
    ],
    finishes: [],
    toppings: {
      kinds: [
        {
          type: "gold_leaf",
          visualDescription: "Fine gold leaf flakes catching the light",
          locator: "accents on the upper tier and seam",
        },
        {
          type: "fondant_cutouts",
          visualDescription: "Pressed floral plaque on the top cake",
          locator: "top of the upper tier, centered",
        },
      ],
      items: [],
    },
    confidence: baseConfidence,
    flags: [],
  },
  licensed: {
    id: "example-licensed",
    medium: "layered",
    sourceImageUrl: "/examples/licensed.svg",
    createdAt,
    editedByUser: false,
    structure: {
      tierCount: 2,
      estimatedServings: 32,
      supportRequired: true,
      tiers: [
        {
          index: 0,
          shape: "round",
          approximateDiameterInches: 9,
          approximateHeightInches: 4,
          visualDescription: "9-inch round cake with a smooth sky-blue coating",
          locator: "base of the cake, sitting on the board",
        },
        {
          index: 1,
          shape: "round",
          approximateDiameterInches: 6,
          approximateHeightInches: 3.5,
          visualDescription: "6-inch round top tier carrying toppings",
          locator: "stacked above the base, smaller diameter",
        },
      ],
    },
    frosting: { primary: null },
    coating: {
      style: "smooth",
      visualDescription: "Smooth sky-blue coating",
      locator: "both tier side walls",
    },
    borders: [
      {
        type: "shell",
        derivedTip: "#32",
        visualDescription: "Sky-blue shell border with open ridges",
        locator: "base of the cake, running around the board edge",
      },
    ],
    accents: [
      {
        type: "dollops",
        count: 8,
        visualDescription: "Piped dollops around the upper rim",
        locator: "top rim of the upper tier",
      },
    ],
    finishes: [],
    toppings: {
      kinds: [
        {
          type: "sprinkles",
          visualDescription: "Jimmies pressed into the base coat",
          locator: "lower side wall of the base tier",
        },
        {
          type: "fondant_cutouts",
          visualDescription: "Fondant plaque with a cartoon figure",
          locator: "top of the upper tier, facing the camera",
        },
      ],
      items: [],
    },
    confidence: { ...baseConfidence, borders: 0.55, toppings: 0.58 },
    flags: [
      {
        code: "low_confidence",
        message: "Not sure about the border. Check this one.",
        details: ["borders"],
      },
    ],
  },
  iceCream: {
    id: "example-ice-cream",
    medium: "ice_cream",
    sourceImageUrl: "/examples/ice-cream.svg",
    createdAt,
    editedByUser: false,
    structure: {
      tierCount: 1,
      estimatedServings: 24,
      supportRequired: false,
      tiers: [
        {
          index: 0,
          shape: "sheet",
          approximateDiameterInches: 13,
          approximateHeightInches: 3,
          visualDescription: "Single sheet cake, no stacked diameters",
          locator: "the whole cake, sitting on a rectangular board",
        },
      ],
    },
    frosting: { primary: null },
    coating: {
      style: "smooth",
      visualDescription: "Soft whipped coating, even across the top",
      locator: "top surface and short side walls",
    },
    borders: [
      {
        type: "shell",
        derivedTip: "#32",
        visualDescription: "Shell border piped along the top edge of the sheet",
        locator: "top edge, running around the rim",
      },
    ],
    accents: [
      {
        type: "rosettes",
        count: 12,
        visualDescription: "Bold rosettes in two rows across the top",
        locator: "top surface, in two rows inside the border",
      },
    ],
    finishes: [],
    toppings: {
      kinds: [
        {
          type: "sprinkles",
          visualDescription: "Rainbow sprinkles over the rosettes",
          locator: "scattered on the top surface",
        },
        {
          type: "confection",
          visualDescription: "Printed balloon sheet laid on the centre",
          locator: "center of the top surface",
        },
      ],
      items: [
        {
          item: "printed balloon sheet",
          brandNamed: false,
          count: 1,
          arrangement: "centered on the top",
          visualDescription: "Rectangular printed sheet of birthday balloons",
          locator: "center of the top surface",
        },
      ],
    },
    confidence: {
      structure: 0.9,
      coating: 0.8,
      borders: 0.7,
      accents: 0.75,
      finishes: 0.82,
      toppings: 0.75,
    },
    flags: [],
  },
};

export const exampleMeta = [
  {
    id: "tieredFondant",
    specId: "example-tiered",
    title: "Three-tier fondant",
    blurb: "Shell border, gold leaf, smooth coating.",
  },
  {
    id: "licensed",
    specId: "example-licensed",
    title: "Character print",
    blurb: "Fondant plaque on a two-tier cake.",
  },
  {
    id: "iceCream",
    specId: "example-ice-cream",
    title: "Ice cream sheet",
    blurb: "Whipped coating, print, frozen constraints.",
  },
] as const;
