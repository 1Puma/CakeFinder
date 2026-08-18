import { flagCategory, rarityScore } from "../capability";
import { cityCenter, haversineMiles } from "../geo";
import type { CapabilityFlag, Decorator, Match } from "../types";

/** Inferred capabilities below this used to be ignored; 0.3 still counts a weak photo match. */
export const FLAG_CONFIDENCE_MIN = 0.3;

/** Crawled Places/Yelp shops have empty capabilities. Treat them as local, not as coverage 0. */
export const UNKNOWN_SHOP_COVERAGE = 0.22;

export function decoratorHasFlag(decorator: Decorator, flag: CapabilityFlag): boolean {
  return decorator.capabilities.some((c) => c.flag === flag && c.confidence >= FLAG_CONFIDENCE_MIN);
}

export function scoreDecorator(
  decorator: Decorator,
  required: CapabilityFlag[],
  city: string,
): Match {
  const matchedFlags = required.filter((flag) => decoratorHasFlag(decorator, flag));
  const missingFlags = required.filter((flag) => !matchedFlags.includes(flag));
  const categories = {
    coating: 0,
    borders: 0,
    accents: 0,
    finishes: 0,
    toppings: 0,
  } as Match["categoryScores"];
  const totals = { ...categories };
  for (const flag of required) {
    const cat = flagCategory(flag);
    totals[cat] += 1;
    if (matchedFlags.includes(flag)) {
      categories[cat] += 1;
    }
  }
  for (const key of Object.keys(categories) as Array<keyof typeof categories>) {
    categories[key] = totals[key] === 0 ? 1 : categories[key] / totals[key];
  }
  const distanceMiles = haversineMiles(cityCenter(city), decorator);
  const reasoning = buildReasoning(decorator, matchedFlags, missingFlags);
  return {
    decorator,
    matchedFlags,
    missingFlags,
    categoryScores: categories,
    reasoning,
    distanceMiles,
  };
}

function buildReasoning(
  decorator: Decorator,
  matched: CapabilityFlag[],
  missing: CapabilityFlag[],
): string {
  const hits = matched.slice(0, 3).map(humanFlag).join(", ");
  const miss = missing.slice(0, 2).map(humanFlag).join(", ");
  if (decorator.capabilities.length === 0) {
    return "Local cake shop — techniques not indexed yet.";
  }
  if (matched.length === 0) {
    return `No demonstrated overlap with this spec in the indexed photos.`;
  }
  if (missing.length === 0) {
    return `${hits} shown in the portfolio.`;
  }
  return `${hits} in the portfolio; no evidence for ${miss}.`;
}

function humanFlag(flag: CapabilityFlag): string {
  return flag.replaceAll(":", " ").replaceAll("_", " ");
}

export function rankMatches(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => {
    const coverA = coverage(a);
    const coverB = coverage(b);
    if (coverB !== coverA) return coverB - coverA;
    const reviewsA = a.decorator.reviewCount ?? 0;
    const reviewsB = b.decorator.reviewCount ?? 0;
    if (reviewsB !== reviewsA) return reviewsB - reviewsA;
    return a.distanceMiles - b.distanceMiles;
  });
}

export function coverage(match: Match): number {
  if (match.decorator.capabilities.length === 0) {
    return UNKNOWN_SHOP_COVERAGE;
  }
  const all = [...match.matchedFlags, ...match.missingFlags];
  const weightMatched = match.matchedFlags.reduce((sum, flag) => sum + rarityScore(flag), 0);
  const weightAll = all.reduce((sum, flag) => sum + rarityScore(flag), 0);
  return weightAll === 0 ? 0 : weightMatched / weightAll;
}
