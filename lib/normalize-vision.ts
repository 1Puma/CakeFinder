import {
  accentChoices,
  borderChoices,
  coatingChoices,
  finishChoices,
  lookupBorderTip,
  structureShapes,
  toppingChoices,
} from "./taxonomy";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function clamp01(value: unknown): number {
  const n = asNumber(value);
  if (n === null) return 0.7;
  return Math.min(1, Math.max(0, n));
}

function located(raw: unknown, fallback: string): { visualDescription: string; locator: string } {
  const rec = isRecord(raw) ? raw : {};
  return {
    visualDescription: asString(rec.visualDescription) || fallback,
    locator: asString(rec.locator) || "on the cake",
  };
}

const coatingIds = new Set(coatingChoices.map((c) => c.id));
const borderIds = new Set(borderChoices.map((c) => c.id));
const accentIds = new Set(accentChoices.map((c) => c.id));
const finishIds = new Set(finishChoices.map((c) => c.id));
const toppingIds = new Set(toppingChoices.map((c) => c.id));
const shapeIds = new Set(structureShapes.map((s) => s.id));

type OtherItem = { description: string; locator: string };

function takeOther(raw: unknown, other: OtherItem[]): void {
  if (!Array.isArray(raw)) return;
  for (const item of raw) {
    const rec = isRecord(item) ? item : {};
    const description = asString(rec.description) || asString(rec.visualDescription);
    if (!description) continue;
    other.push({ description, locator: asString(rec.locator) || "on the cake" });
  }
}

function keepKnown<T>(
  items: unknown,
  allowed: Set<string>,
  other: OtherItem[],
  build: (id: string, rec: Record<string, unknown>, loc: ReturnType<typeof located>) => T,
): T[] {
  if (!Array.isArray(items)) return [];
  const out: T[] = [];
  for (const item of items) {
    const rec = isRecord(item) ? item : {};
    const id = asString(rec.type) || asString(rec.style) || asString(rec.id);
    const loc = located(rec, id || "unlisted decoration");
    if (!id || !allowed.has(id)) {
      other.push({ description: loc.visualDescription, locator: loc.locator });
      continue;
    }
    out.push(build(id, rec, loc));
  }
  return out;
}

function normalizeStructure(raw: unknown) {
  const rec = isRecord(raw) ? raw : {};
  const incoming = Array.isArray(rec.tiers) ? rec.tiers : [];
  const tiers = incoming.map((tier, index) => {
    const t = isRecord(tier) ? tier : {};
    const shape = asString(t.shape);
    const diameter = asNumber(t.approximateDiameterInches);
    const height = asNumber(t.approximateHeightInches);
    return {
      index,
      shape: shapeIds.has(shape) ? shape : "round",
      approximateDiameterInches: diameter !== null && diameter > 0 ? diameter : null,
      approximateHeightInches: height !== null && height > 0 ? height : null,
      ...located(t, `Tier ${index + 1}`),
    };
  });
  if (tiers.length === 0) {
    tiers.push({
      index: 0,
      shape: "round",
      approximateDiameterInches: null,
      approximateHeightInches: null,
      visualDescription: "Single cake",
      locator: "the whole cake",
    });
  }
  const requested = asNumber(rec.tierCount);
  const tierCount = Math.min(8, Math.max(1, Math.round(requested ?? tiers.length)));
  return {
    tierCount,
    tiers: tiers.slice(0, tierCount).map((tier, index) => ({ ...tier, index })),
    estimatedServings:
      asNumber(rec.estimatedServings) !== null
        ? Math.max(1, Math.round(asNumber(rec.estimatedServings) as number))
        : null,
    supportRequired: rec.supportRequired === true || tierCount > 1,
  };
}

export function normalizeVisionPayload(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  const other: OtherItem[] = [];
  takeOther(raw.other, other);

  let coating: unknown = null;
  if (raw.coating !== null && raw.coating !== undefined && isRecord(raw.coating)) {
    const style = asString(raw.coating.style);
    const loc = located(raw.coating, style || "unlisted coating");
    if (style && coatingIds.has(style)) {
      coating = { style, ...loc };
    } else {
      other.push({ description: loc.visualDescription, locator: loc.locator });
    }
  }

  const borders = keepKnown(raw.borders, borderIds, other, (id, rec, loc) => ({
    type: id,
    derivedTip: asString(rec.derivedTip) || lookupBorderTip(id),
    ...loc,
  }));
  const accents = keepKnown(raw.accents, accentIds, other, (id, rec, loc) => ({
    type: id,
    count:
      asNumber(rec.count) !== null ? Math.max(0, Math.round(asNumber(rec.count) as number)) : null,
    ...loc,
  }));
  const finishes = keepKnown(raw.finishes, finishIds, other, (id, _rec, loc) => ({
    type: id,
    ...loc,
  }));

  const toppingsRaw = isRecord(raw.toppings) ? raw.toppings : {};
  const kinds = keepKnown(toppingsRaw.kinds, toppingIds, other, (id, _rec, loc) => ({
    type: id,
    ...loc,
  }));
  const items = Array.isArray(toppingsRaw.items)
    ? toppingsRaw.items.flatMap((item) => {
        const rec = isRecord(item) ? item : {};
        const name = asString(rec.item);
        if (!name) return [];
        return [
          {
            item: name,
            brandNamed: rec.brandNamed === true,
            count:
              asNumber(rec.count) !== null
                ? Math.max(0, Math.round(asNumber(rec.count) as number))
                : null,
            arrangement: asString(rec.arrangement) || "on the cake",
            ...located(rec, name),
          },
        ];
      })
    : [];

  const conf = isRecord(raw.confidence) ? raw.confidence : {};

  return {
    medium: raw.medium === "ice_cream" ? "ice_cream" : "layered",
    sourceImageUrl: asString(raw.sourceImageUrl),
    structure: normalizeStructure(raw.structure),
    coating,
    borders,
    accents,
    finishes,
    toppings: { kinds, items },
    other,
    confidence: {
      structure: clamp01(conf.structure),
      coating: clamp01(conf.coating),
      borders: clamp01(conf.borders),
      accents: clamp01(conf.accents),
      finishes: clamp01(conf.finishes),
      toppings: clamp01(conf.toppings),
    },
    flags: Array.isArray(raw.flags)
      ? raw.flags.filter((flag) => {
          if (!isRecord(flag)) return false;
          return (
            (flag.code === "parse_failure" ||
              flag.code === "medium_constraint" ||
              flag.code === "low_confidence") &&
            typeof flag.message === "string"
          );
        })
      : [],
    editedByUser: false,
  };
}
