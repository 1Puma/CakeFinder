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
          visualDescription:
            "10-inch round cake, the widest of the stack, covered in ivory fondant",
          locator: "base of the cake, sitting on the board",
        },
        {
          index: 1,
          shape: "round",
          approximateDiameterInches: 8,
          approximateHeightInches: 4,
          visualDescription: "8-inch round cake stacked above the base, same ivory fondant",
          locator: "middle of the stack, smaller diameter than the base",
        },
        {
          index: 2,
          shape: "round",
          approximateDiameterInches: 6,
          approximateHeightInches: 3.5,
          visualDescription: "6-inch round top cake with a pressed floral print on the crown",
          locator: "top of the stack, smallest diameter",
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
          visualDescription:
            "Ridged pink shell border, each shell fanning forward with a tapering tail",
          locator: "base of the cake, running around the board edge",
        },
        {
          type: "bead",
          derivedTip: "#10",
          placement: "tier_seam",
          repeatCount: 18,
          colorRef: "#fdce40",
          visualDescription: "Small gold beads pinched between spheres along the seam",
          locator: "tier seam between bottom and middle cake",
        },
      ],
      surfaceElements: [
        {
          kind: "rosette",
          inferredNozzleFamily: "open_star",
          ridgeCharacter: "medium",
          count: 6,
          colorRef: "#ef89bb",
          visualDescription: "Six open-star rosettes with medium ridges in pink gel",
          locator: "top surface, evenly spaced around the rim",
        },
      ],
    },
    decor: {
      ediblePrint: {
        approximateSizeInches: 6,
        shape: "round",
        subject: "Pressed floral wreath",
        visualDescription: "Round edible print of a pressed floral wreath, soft pink and ivory",
        locator: "top of the upper tier, centered",
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
          visualDescription: "9-inch round buttercream cake in sky blue",
          locator: "base of the cake, sitting on the board",
        },
        {
          index: 1,
          shape: "round",
          approximateDiameterInches: 6,
          approximateHeightInches: 3.5,
          visualDescription: "6-inch round top tier carrying the character print",
          locator: "stacked above the base, smaller diameter",
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
          visualDescription: "Sky-blue shell border with open-star ridges",
          locator: "base of the cake, running around the board edge",
        },
      ],
      surfaceElements: [
        {
          kind: "lettering",
          inferredNozzleFamily: "round",
          ridgeCharacter: null,
          count: 1,
          colorRef: "#1f2d3d",
          visualDescription: "Piped lettering in dark icing across the lower tier",
          locator: "upper side wall of the base tier",
        },
      ],
    },
    decor: {
      ediblePrint: {
        approximateSizeInches: 5,
        shape: "round",
        subject: "Copyrighted cartoon dog on hind legs, blue coat",
        visualDescription: "Round edible print of a copyrighted cartoon dog in a blue coat",
        locator: "top of the upper tier, facing the camera",
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
          visualDescription: "Single sheet cake, whipped topping, no stacked diameters",
          locator: "the whole cake, sitting on a rectangular board",
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
          visualDescription: "Pink shell border piped along the top edge of the sheet",
          locator: "top edge, running around the rim",
        },
      ],
      surfaceElements: [
        {
          kind: "rosette",
          inferredNozzleFamily: "open_star",
          ridgeCharacter: "bold",
          count: 12,
          colorRef: "#ef89bb",
          visualDescription: "Bold open-star rosettes in rows across the top",
          locator: "top surface, in two rows inside the border",
        },
      ],
    },
    decor: {
      ediblePrint: {
        approximateSizeInches: 8,
        shape: "rectangular",
        subject: "Birthday balloons",
        visualDescription: "Rectangular edible print of birthday balloons",
        locator: "center of the top surface",
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
