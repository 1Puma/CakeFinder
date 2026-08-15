import { z } from "zod";
import accentsJson from "../data/taxonomy/accents.json";
import bordersJson from "../data/taxonomy/borders.json";
import coatingJson from "../data/taxonomy/coating.json";
import finishesJson from "../data/taxonomy/finishes.json";
import frostingJson from "../data/taxonomy/frosting.json";
import mediumConstraintsJson from "../data/taxonomy/medium-constraints.json";
import structureJson from "../data/taxonomy/structure.json";
import toppingsJson from "../data/taxonomy/toppings.json";

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

export const coatingChoices = coatingJson.choices;
export const borderChoices = bordersJson.choices;
export const accentChoices = accentsJson.choices;
export const finishChoices = finishesJson.choices;
export const toppingChoices = toppingsJson.choices;
export const frostingTypes = frostingJson.types;
export const structureShapes = structureJson.shapes;
export const mediumConstraints = mediumConstraintsJson;

export const categoryKeys = ["coating", "borders", "accents", "finishes", "toppings"] as const;
export const analysisCategoryKeys = [
  "coating",
  "borders",
  "accents",
  "finishes",
  "toppings",
  "other",
] as const;

export type CategoryKey = (typeof categoryKeys)[number];
export type AnalysisCategoryKey = (typeof analysisCategoryKeys)[number];

const coatingIdSchema = enumFrom(coatingChoices.map((c) => c.id));
const borderIdSchema = enumFrom(borderChoices.map((c) => c.id));
const accentIdSchema = enumFrom(accentChoices.map((c) => c.id));
const finishIdSchema = enumFrom(finishChoices.map((c) => c.id));
const toppingIdSchema = enumFrom(toppingChoices.map((c) => c.id));
const frostingIdSchema = enumFrom(frostingTypes.map((c) => c.id));
const shapeSchema = enumFrom(structureShapes.map((s) => s.id));

export const specFlagSchema = z.object({
  code: z.enum(["parse_failure", "medium_constraint", "low_confidence"]),
  message: z.string(),
  details: z.array(z.string()).optional(),
});

const locatedFields = {
  visualDescription: z.string().min(1),
  locator: z.string().min(1),
};

export const tierSchema = z.object({
  index: z.number().int().min(0),
  shape: shapeSchema,
  approximateDiameterInches: z.number().positive().nullable(),
  approximateHeightInches: z.number().positive().nullable(),
  ...locatedFields,
});

export const toppingItemSchema = z.object({
  item: z.string().min(1),
  brandNamed: z.boolean(),
  count: z.number().int().min(0).nullable(),
  arrangement: z.string().min(1),
  ...locatedFields,
});

export const otherItemSchema = z.object({
  description: z.string().min(1),
  locator: z.string().min(1),
});

export const summariesSchema = z.object({
  coating: z.string(),
  borders: z.string(),
  accents: z.string(),
  finishes: z.string(),
  toppings: z.string(),
  other: z.string(),
});

export const cakeSpecVisionSchema = z.object({
  medium: z.enum(["layered", "ice_cream"]),
  sourceImageUrl: z.string(),
  structure: z.object({
    tierCount: z.number().int().min(1).max(8),
    tiers: z.array(tierSchema).min(1),
    estimatedServings: z.number().int().positive().nullable(),
    supportRequired: z.boolean(),
  }),
  coating: z
    .object({
      style: coatingIdSchema,
      ...locatedFields,
    })
    .nullable(),
  borders: z.array(
    z.object({
      type: borderIdSchema,
      derivedTip: z.string(),
      ...locatedFields,
    }),
  ),
  accents: z.array(
    z.object({
      type: accentIdSchema,
      count: z.number().int().min(0).nullable(),
      ...locatedFields,
    }),
  ),
  finishes: z.array(
    z.object({
      type: finishIdSchema,
      ...locatedFields,
    }),
  ),
  toppings: z.object({
    kinds: z.array(
      z.object({
        type: toppingIdSchema,
        ...locatedFields,
      }),
    ),
    items: z.array(toppingItemSchema),
  }),
  other: z.array(otherItemSchema).default([]),
  confidence: z.object({
    structure: z.number().min(0).max(1),
    coating: z.number().min(0).max(1),
    borders: z.number().min(0).max(1),
    accents: z.number().min(0).max(1),
    finishes: z.number().min(0).max(1),
    toppings: z.number().min(0).max(1),
  }),
  flags: z.array(specFlagSchema),
  editedByUser: z.boolean(),
});

export const cakeSpecBodySchema = cakeSpecVisionSchema.extend({
  frosting: z.object({
    primary: frostingIdSchema.nullable(),
  }),
  summaries: summariesSchema,
});

export const cakeSpecSchema = cakeSpecBodySchema.extend({
  id: z.string().min(1),
  createdAt: z.coerce.date(),
});

export type CakeSpec = z.infer<typeof cakeSpecSchema>;
export type CakeSpecBody = z.infer<typeof cakeSpecBodySchema>;
export type CakeSpecVision = z.infer<typeof cakeSpecVisionSchema>;
export type SpecFlag = z.infer<typeof specFlagSchema>;
export type ToppingItem = z.infer<typeof toppingItemSchema>;

export function buildSpecZodSchema(): z.ZodType<CakeSpec> {
  return cakeSpecSchema;
}

export function buildTaxonomyPromptSection(): string {
  const line = (
    items: Array<{ id: string; label: string; description: string; derivedTip?: string }>,
  ) =>
    items
      .map((item) => {
        const tip = item.derivedTip ? ` (derived tip ${item.derivedTip})` : "";
        return `- ${item.id}: ${item.label}. ${item.description}${tip}`;
      })
      .join("\n");

  return [
    "TAXONOMY (use these ids exactly). Detect decorative choices, not tools.",
    "",
    "Coating style & texture:",
    line(coatingChoices),
    "",
    "Piped borders & lines:",
    line(borderChoices),
    "",
    "Piped tops & accents:",
    line(accentChoices),
    "",
    "Liquid & glaze finishes:",
    line(finishChoices),
    "",
    "Toppings & embellishments:",
    line(toppingChoices),
    "When toppings include named confections, fill toppings.items with item, brandNamed, count, arrangement.",
    "",
    "If a decoration is visible but has no taxonomy id, put it in other[] with description and locator.",
    "Do not invent taxonomy ids.",
    "",
    "Do not detect frosting type. Leave frosting out of the vision output.",
  ].join("\n");
}

export function lookupBorderTip(type: string): string {
  return borderChoices.find((b) => b.id === type)?.derivedTip ?? "unknown";
}

export function labelFor(
  kind: "shape" | "frosting" | "coating" | "border" | "accent" | "finish" | "topping",
  id: string,
): string {
  switch (kind) {
    case "shape":
      return structureShapes.find((s) => s.id === id)?.label ?? id;
    case "frosting":
      return frostingTypes.find((s) => s.id === id)?.label ?? id.replaceAll("_", " ");
    case "coating":
      return coatingChoices.find((s) => s.id === id)?.label ?? id.replaceAll("_", " ");
    case "border":
      return borderChoices.find((s) => s.id === id)?.label ?? id.replaceAll("_", " ");
    case "accent":
      return accentChoices.find((s) => s.id === id)?.label ?? id.replaceAll("_", " ");
    case "finish":
      return finishChoices.find((s) => s.id === id)?.label ?? id.replaceAll("_", " ");
    case "topping":
      return toppingChoices.find((s) => s.id === id)?.label ?? id.replaceAll("_", " ");
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}
