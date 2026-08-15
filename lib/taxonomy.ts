import { z } from "zod";
import bordersJson from "../data/taxonomy/borders.json";
import colorsJson from "../data/taxonomy/colors.json";
import decorJson from "../data/taxonomy/decor.json";
import finishJson from "../data/taxonomy/finish.json";
import frostingJson from "../data/taxonomy/frosting.json";
import mediumConstraintsJson from "../data/taxonomy/medium-constraints.json";
import nozzlesJson from "../data/taxonomy/nozzles.json";
import structureJson from "../data/taxonomy/structure.json";
import techniquesJson from "../data/taxonomy/techniques.json";

function enumFrom<T extends string>(ids: readonly T[]): z.ZodType<T> {
  const [first, ...rest] = ids;
  if (first === undefined) {
    throw new Error("taxonomy enum is empty");
  }
  if (rest.length === 0) {
    return z.literal(first);
  }
  return z.union([z.literal(first), ...rest.map((id) => z.literal(id))]) as z.ZodType<T>;
}

export const structureShapes = structureJson.shapes;
export const frostingTypes = frostingJson.types;
export const borderTypes = bordersJson.types;
export const borderPlacements = bordersJson.placements;
export const nozzleFamilies = nozzlesJson.families;
export const surfaceKinds = nozzlesJson.surfaceKinds;
export const ridgeCharacters = nozzlesJson.ridgeCharacters;
export const ediblePrintShapes = decorJson.ediblePrintShapes;
export const sculpturalMediums = decorJson.sculpturalMediums;
export const complianceStatuses = decorJson.complianceStatuses;
export const decorFlags = decorJson.flags;
export const finishFlags = finishJson.flags;
export const metallicLeafValues = finishJson.metallicLeaf;
export const gelFamilies = colorsJson.gelFamilies;
export const mediumConstraints = mediumConstraintsJson;
export const techniques = techniquesJson;

export const categoryKeys = ["structure", "frosting", "piping", "decor", "finish"] as const;

export type CategoryKey = (typeof categoryKeys)[number];

export const regionSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().min(0).max(1),
  h: z.number().min(0).max(1),
});

export const colorRefSchema = z.object({
  hex: z.string().regex(/^#?[0-9A-Fa-f]{6}$/),
  gelFamily: z.string(),
  coverage: z.enum(["primary", "accent", "detail"]),
});

const shapeSchema = enumFrom(structureShapes.map((s) => s.id));
const frostingTypeSchema = enumFrom(frostingTypes.map((s) => s.id));
const borderTypeSchema = enumFrom(borderTypes.map((s) => s.id));
const placementSchema = enumFrom([...borderPlacements]);
const nozzleSchema = enumFrom(nozzleFamilies.map((s) => s.id));
const surfaceKindSchema = enumFrom([...surfaceKinds]);
const ridgeSchema = enumFrom([...ridgeCharacters]);
const printShapeSchema = enumFrom([...ediblePrintShapes]);
const sculptMediumSchema = enumFrom([...sculpturalMediums]);
const complianceSchema = enumFrom([...complianceStatuses]);
const metallicSchema = enumFrom([...metallicLeafValues]);

export const specFlagSchema = z.object({
  code: z.enum(["parse_failure", "medium_constraint", "low_confidence", "licensed_character"]),
  message: z.string(),
  details: z.array(z.string()).optional(),
});

export const tierSchema = z.object({
  index: z.number().int().min(0),
  shape: shapeSchema,
  approximateDiameterInches: z.number().positive().nullable(),
  approximateHeightInches: z.number().positive().nullable(),
  region: regionSchema.nullable().optional(),
});

export const borderSchema = z.object({
  type: borderTypeSchema,
  derivedTip: z.string(),
  placement: placementSchema,
  repeatCount: z.number().int().min(0).nullable(),
  colorRef: z.string(),
  region: regionSchema.nullable().optional(),
});

export const surfaceElementSchema = z.object({
  kind: surfaceKindSchema,
  inferredNozzleFamily: nozzleSchema.nullable(),
  ridgeCharacter: ridgeSchema.nullable(),
  count: z.number().int().min(0).nullable(),
  colorRef: z.string(),
  region: regionSchema.nullable().optional(),
});

export const cakeSpecBodySchema = z.object({
  medium: z.enum(["layered", "ice_cream"]),
  sourceImageUrl: z.string(),
  structure: z.object({
    tierCount: z.number().int().min(1).max(8),
    tiers: z.array(tierSchema).min(1),
    estimatedServings: z.number().int().positive().nullable(),
    supportRequired: z.boolean(),
  }),
  frosting: z.object({
    primary: frostingTypeSchema,
    secondary: frostingTypeSchema.nullable(),
    colors: z.array(colorRefSchema),
  }),
  piping: z.object({
    borders: z.array(borderSchema),
    surfaceElements: z.array(surfaceElementSchema),
  }),
  decor: z.object({
    ediblePrint: z
      .object({
        approximateSizeInches: z.number().positive().nullable(),
        shape: printShapeSchema,
        subject: z.string(),
        region: regionSchema.nullable().optional(),
      })
      .nullable(),
    licensedCharacters: z.array(
      z.object({
        detectedName: z.string().nullable(),
        franchise: z.string().nullable(),
        confidence: z.number().min(0).max(1),
        complianceStatus: complianceSchema,
      }),
    ),
    nonEdibleToppers: z.array(z.string()),
    sculptural: z.array(
      z.object({
        description: z.string(),
        medium: sculptMediumSchema,
        approximateSizeInches: z.number().positive().nullable(),
      }),
    ),
    freshFlorals: z.boolean(),
  }),
  finish: z.object({
    metallicLeaf: metallicSchema,
    pearls: z.boolean(),
    sprinkles: z.boolean(),
    edibleGlitter: z.boolean(),
    isomalt: z.boolean(),
    waferPaper: z.boolean(),
    airbrush: z.boolean(),
    drip: z.boolean(),
    marbling: z.boolean(),
    texturedPaletteKnife: z.boolean(),
  }),
  confidence: z.object({
    structure: z.number().min(0).max(1),
    frosting: z.number().min(0).max(1),
    piping: z.number().min(0).max(1),
    decor: z.number().min(0).max(1),
    finish: z.number().min(0).max(1),
  }),
  flags: z.array(specFlagSchema),
  editedByUser: z.boolean(),
});

export const cakeSpecSchema = cakeSpecBodySchema.extend({
  id: z.string().min(1),
  createdAt: z.coerce.date(),
});

export type CakeSpec = z.infer<typeof cakeSpecSchema>;
export type CakeSpecBody = z.infer<typeof cakeSpecBodySchema>;
export type Region = z.infer<typeof regionSchema>;
export type SpecFlag = z.infer<typeof specFlagSchema>;

export function buildSpecZodSchema(): z.ZodType<CakeSpec> {
  return cakeSpecSchema;
}

export function buildTaxonomyPromptSection(): string {
  const borders = borderTypes
    .map((b) => `- ${b.id}: ${b.visualSignature} (derived tip ${b.tip}, family ${b.family})`)
    .join("\n");
  const nozzles = nozzleFamilies
    .map(
      (n) =>
        `- ${n.id} (tip ${n.tip}): produces ${n.produces.join(", ")}. Capability flags: ${n.capabilityFlags.join(", ")}`,
    )
    .join("\n");
  const frostings = frostingTypes.map((f) => `- ${f.id}: ${f.label}`).join("\n");
  const shapes = structureShapes.map((s) => `- ${s.id}: ${s.label}`).join("\n");
  const gels = gelFamilies.map((g) => `- ${g.id} ${g.hex}`).join("\n");
  const finish = finishFlags.map((f) => `- ${f.id}: ${f.label}`).join("\n");
  const excluded = techniques.excluded.map((t) => `- ${t.id}: ${t.reason}`).join("\n");

  return [
    "TAXONOMY (use these ids exactly)",
    "",
    "Structure shapes:",
    shapes,
    "",
    "Frosting types:",
    frostings,
    "",
    "Border morphology (classify shape, never tip):",
    borders,
    "Placements: " + borderPlacements.join(", "),
    "",
    "Nozzle families (surface and floral). Petal 104 maps to both ruffle borders and florals:",
    nozzles,
    "Surface element kinds: " + surfaceKinds.join(", "),
    "Ridge character for rosettes/swirls: " + ridgeCharacters.join(", "),
    "",
    "Edible print shapes: " + ediblePrintShapes.join(", "),
    "Sculptural mediums: " + sculpturalMediums.join(", "),
    "Finish booleans:",
    finish,
    "metallicLeaf: " + metallicLeafValues.join(", "),
    "",
    "Gel families (snap hex to nearest):",
    gels,
    "",
    "Excluded techniques:",
    excluded,
  ].join("\n");
}

export function lookupBorderTip(type: string): string {
  return borderTypes.find((b) => b.id === type)?.tip ?? "unknown";
}

export function nearestGelFamily(hex: string): string {
  const n = parseInt(hex.replace("#", ""), 16);
  if (Number.isNaN(n)) {
    return gelFamilies[0]?.id ?? "ivory";
  }
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  let best = gelFamilies[0]?.id ?? "ivory";
  let bestDist = Infinity;
  for (const family of gelFamilies) {
    const fn = parseInt(family.hex.replace("#", ""), 16);
    const fr = (fn >> 16) & 255;
    const fg = (fn >> 8) & 255;
    const fb = fn & 255;
    const dist = (r - fr) ** 2 + (g - fg) ** 2 + (b - fb) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = family.id;
    }
  }
  return best;
}

export function labelFor(
  kind: "shape" | "frosting" | "border" | "nozzle" | "finish" | "surface",
  id: string,
): string {
  switch (kind) {
    case "shape":
      return structureShapes.find((s) => s.id === id)?.label ?? id;
    case "frosting":
      return frostingTypes.find((s) => s.id === id)?.label ?? id.replaceAll("_", " ");
    case "border":
      return id.replaceAll("_", " ");
    case "nozzle":
      return id.replaceAll("_", " ");
    case "finish":
      return finishFlags.find((s) => s.id === id)?.label ?? id.replaceAll("_", " ");
    case "surface":
      return id.replaceAll("_", " ");
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}
