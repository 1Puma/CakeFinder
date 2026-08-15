import type { CakeSpec } from "./taxonomy";

const createdAt = new Date("2026-08-15T12:00:00.000Z");

const baseConfidence = {
  structure: 0.86,
  frosting: 0.74,
  piping: 0.81,
  decor: 0.7,
  finish: 0.78,
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
          region: { x: 0.18, y: 0.62, w: 0.64, h: 0.3 },
        },
        {
          index: 1,
          shape: "round",
          approximateDiameterInches: 8,
          approximateHeightInches: 4,
          region: { x: 0.24, y: 0.38, w: 0.52, h: 0.26 },
        },
        {
          index: 2,
          shape: "round",
          approximateDiameterInches: 6,
          approximateHeightInches: 3.5,
          region: { x: 0.3, y: 0.14, w: 0.4, h: 0.26 },
        },
      ],
    },
    frosting: {
      primary: "fondant",
      secondary: "buttercream_american",
      colors: [
        { hex: "#fff2cc", gelFamily: "ivory", coverage: "primary" },
        { hex: "#ef89bb", gelFamily: "pink", coverage: "accent" },
      ],
    },
    piping: {
      borders: [
        {
          type: "shell",
          derivedTip: "#32",
          placement: "base",
          repeatCount: 24,
          colorRef: "#ef89bb",
          region: { x: 0.16, y: 0.86, w: 0.68, h: 0.08 },
        },
        {
          type: "bead",
          derivedTip: "#10",
          placement: "tier_seam",
          repeatCount: 18,
          colorRef: "#fdce40",
          region: { x: 0.24, y: 0.58, w: 0.52, h: 0.06 },
        },
      ],
      surfaceElements: [
        {
          kind: "rosette",
          inferredNozzleFamily: "open_star",
          ridgeCharacter: "medium",
          count: 6,
          colorRef: "#ef89bb",
          region: { x: 0.34, y: 0.18, w: 0.32, h: 0.16 },
        },
      ],
    },
    decor: {
      ediblePrint: {
        approximateSizeInches: 6,
        shape: "round",
        subject: "Pressed floral wreath",
        region: { x: 0.36, y: 0.2, w: 0.28, h: 0.18 },
      },
      licensedCharacters: [],
      nonEdibleToppers: [],
      sculptural: [],
      freshFlorals: false,
    },
    finish: {
      metallicLeaf: "gold",
      pearls: true,
      sprinkles: false,
      edibleGlitter: false,
      isomalt: false,
      waferPaper: false,
      airbrush: false,
      drip: false,
      marbling: false,
      texturedPaletteKnife: false,
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
          region: { x: 0.16, y: 0.52, w: 0.68, h: 0.4 },
        },
        {
          index: 1,
          shape: "round",
          approximateDiameterInches: 6,
          approximateHeightInches: 3.5,
          region: { x: 0.28, y: 0.16, w: 0.44, h: 0.38 },
        },
      ],
    },
    frosting: {
      primary: "buttercream_american",
      secondary: null,
      colors: [
        { hex: "#6fa8dc", gelFamily: "sky_blue", coverage: "primary" },
        { hex: "#fdce40", gelFamily: "lemon_yellow", coverage: "accent" },
      ],
    },
    piping: {
      borders: [
        {
          type: "shell",
          derivedTip: "#32",
          placement: "base",
          repeatCount: 20,
          colorRef: "#6fa8dc",
          region: { x: 0.14, y: 0.86, w: 0.72, h: 0.08 },
        },
      ],
      surfaceElements: [
        {
          kind: "lettering",
          inferredNozzleFamily: "round",
          ridgeCharacter: null,
          count: 1,
          colorRef: "#1f2d3d",
          region: { x: 0.3, y: 0.62, w: 0.4, h: 0.12 },
        },
      ],
    },
    decor: {
      ediblePrint: {
        approximateSizeInches: 5,
        shape: "round",
        subject: "Copyrighted cartoon dog on hind legs, blue coat",
        region: { x: 0.34, y: 0.2, w: 0.32, h: 0.28 },
      },
      licensedCharacters: [
        {
          detectedName: null,
          franchise: "animated children's series",
          confidence: 0.62,
          complianceStatus: "unknown",
        },
      ],
      nonEdibleToppers: [],
      sculptural: [],
      freshFlorals: false,
    },
    finish: {
      metallicLeaf: "none",
      pearls: false,
      sprinkles: true,
      edibleGlitter: false,
      isomalt: false,
      waferPaper: false,
      airbrush: false,
      drip: false,
      marbling: false,
      texturedPaletteKnife: false,
    },
    confidence: { ...baseConfidence, decor: 0.58, piping: 0.55 },
    flags: [
      {
        code: "licensed_character",
        message:
          "A copyrighted character appears on the cake. Bakeries need a licensed print program to reproduce it.",
      },
      {
        code: "low_confidence",
        message: "Not sure about the border. Check this one.",
        details: ["piping"],
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
          region: { x: 0.08, y: 0.28, w: 0.84, h: 0.56 },
        },
      ],
    },
    frosting: {
      primary: "pastry_pride",
      secondary: null,
      colors: [{ hex: "#fff2cc", gelFamily: "ivory", coverage: "primary" }],
    },
    piping: {
      borders: [
        {
          type: "shell",
          derivedTip: "#32",
          placement: "top_edge",
          repeatCount: 32,
          colorRef: "#ef89bb",
          region: { x: 0.08, y: 0.24, w: 0.84, h: 0.1 },
        },
      ],
      surfaceElements: [
        {
          kind: "rosette",
          inferredNozzleFamily: "open_star",
          ridgeCharacter: "bold",
          count: 12,
          colorRef: "#ef89bb",
          region: { x: 0.12, y: 0.34, w: 0.76, h: 0.2 },
        },
      ],
    },
    decor: {
      ediblePrint: {
        approximateSizeInches: 8,
        shape: "rectangular",
        subject: "Birthday balloons",
        region: { x: 0.28, y: 0.4, w: 0.44, h: 0.28 },
      },
      licensedCharacters: [],
      nonEdibleToppers: ["plastic candle set"],
      sculptural: [],
      freshFlorals: false,
    },
    finish: {
      metallicLeaf: "none",
      pearls: false,
      sprinkles: true,
      edibleGlitter: false,
      isomalt: false,
      waferPaper: false,
      airbrush: false,
      drip: false,
      marbling: false,
      texturedPaletteKnife: false,
    },
    confidence: { structure: 0.9, frosting: 0.8, piping: 0.7, decor: 0.75, finish: 0.82 },
    flags: [],
  },
};

export const exampleMeta = [
  {
    id: "tieredFondant",
    specId: "example-tiered",
    title: "Three-tier fondant",
    blurb: "Shell border, gold leaf, edible print.",
  },
  {
    id: "licensed",
    specId: "example-licensed",
    title: "Character print",
    blurb: "Licensed image on buttercream. Tests the substitution path.",
  },
  {
    id: "iceCream",
    specId: "example-ice-cream",
    title: "Ice cream sheet",
    blurb: "Whipped topping, print, frozen constraints.",
  },
] as const;
