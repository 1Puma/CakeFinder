import { getEnv, hasGrokKey } from "../env";
import { grokJson } from "../grok";
import { limitingConstraints, rarityScore, specToRequiredFlags } from "../capability";
import { crawlCity } from "../sources/crawler";
import { isSuppressed } from "../store/index";
import type { CakeSpec } from "../taxonomy";
import type {
  CapabilityFlag,
  Decorator,
  Match,
  MatchResult,
  Substitution,
  TraceStep,
} from "../types";
import { coverage, rankMatches, scoreDecorator } from "./score";
import { makeTraceStep } from "./trace";
import { matchPlanPrompt } from "../../prompts/match-plan";

/** Partial overlap is enough. 0.45 dropped shops that only hit the rare flag. */
export const MATCH_THRESHOLD = 0.18;
const SPARSE_MATCH_COUNT = 5;
const NEARBY_FALLBACK_COUNT = 8;

async function planLimiting(required: CapabilityFlag[]): Promise<{
  limiting: CapabilityFlag[];
  rationale: string;
}> {
  const fallback = {
    limiting: limitingConstraints(required, 3),
    rationale: "Highest-rarity requirements used as the search filter.",
  };
  if (!hasGrokKey()) {
    return fallback;
  }
  const planned = await grokJson(
    {
      messages: [
        {
          role: "user",
          content: matchPlanPrompt({
            requiredFlags: required,
            rarity: required.map((flag) => ({ flag, rarity: rarityScore(flag) })),
          }),
        },
      ],
    },
    (value) => {
      const record = value as { limiting?: string[]; rationale?: string };
      return {
        limiting: (record.limiting ?? fallback.limiting) as CapabilityFlag[],
        rationale: record.rationale ?? fallback.rationale,
      };
    },
  );
  return planned.ok ? planned.value : fallback;
}

export function pickMatches(scored: Match[]): Match[] {
  const ranked = rankMatches(scored);
  const above = ranked.filter((m) => coverage(m) >= MATCH_THRESHOLD);
  if (above.length >= SPARSE_MATCH_COUNT) return above;
  if (above.length === 0) return ranked.slice(0, NEARBY_FALLBACK_COUNT);
  const ids = new Set(above.map((m) => m.decorator.id));
  const padded = [...above];
  for (const match of ranked) {
    if (padded.length >= SPARSE_MATCH_COUNT) break;
    if (ids.has(match.decorator.id)) continue;
    padded.push(match);
    ids.add(match.decorator.id);
  }
  return padded;
}

export async function matchDecorators(input: {
  spec: CakeSpec;
  city: string;
  radiusMiles: number;
  onTrace: (step: TraceStep) => void;
}): Promise<MatchResult> {
  const trace: TraceStep[] = [];
  const emit = (type: TraceStep["type"], message: string) => {
    const step = makeTraceStep(type, message);
    trace.push(step);
    input.onTrace(step);
  };

  const required = specToRequiredFlags(input.spec);
  const plan = await planLimiting(required);
  emit("plan", `Limiting constraint: ${plan.limiting.join(" + ")}. ${plan.rationale}`);

  const env = getEnv();
  let radius = Math.max(input.radiusMiles, env.DEFAULT_RADIUS_MILES);
  let decorators = await crawlCity(input.city, radius);
  decorators = (
    await Promise.all(decorators.map(async (d) => ((await isSuppressed(d.id)) ? null : d)))
  ).filter((d): d is Decorator => d !== null);

  emit(
    "search",
    `Searching Places, Yelp, cottage registry — ${decorators.length} candidates within ${radius} miles of ${input.city}.`,
  );

  const evaluate = (pool: Decorator[], miles: number): Match[] =>
    rankMatches(
      pool
        .map((decorator) => scoreDecorator(decorator, required, input.city))
        .filter((match) => match.distanceMiles <= miles),
    );

  let scored = evaluate(decorators, radius);
  const rejects = scored.filter((m) => coverage(m) < MATCH_THRESHOLD);
  const reject = rejects[0];
  if (reject) {
    emit("reject", `Rejected ${reject.decorator.name}: ${reject.reasoning}`);
  }
  emit("evaluate", `Scored ${scored.length} shops against ${required.length} required flags.`);

  const substitutions: Substitution[] = [];
  let matches = pickMatches(scored);

  if (matches.length < SPARSE_MATCH_COUNT && radius < env.MAX_RADIUS_MILES) {
    const next = env.MAX_RADIUS_MILES;
    emit("replan", `Widened radius ${radius}→${next}mi to find more local shops.`);
    radius = next;
    decorators = await crawlCity(input.city, radius);
    scored = evaluate(decorators, radius);
    matches = pickMatches(scored);
  }

  if (matches.length > 15) {
    emit("replan", "Tightened on review count and evidence strength.");
    matches = matches
      .sort((a, b) => (b.decorator.reviewCount ?? 0) - (a.decorator.reviewCount ?? 0))
      .slice(0, 12);
  }

  matches = rankMatches(matches).slice(0, 12);
  const unmet = required.filter((flag) => matches.every((m) => m.missingFlags.includes(flag)));
  emit("rank", `Ranked ${matches.length} matches. Coverage first, then reviews, then distance.`);
  emit(
    "complete",
    matches.length === 0 ? "No matches in range." : `Returning ${matches.length} matches.`,
  );

  return {
    matches,
    substitutions,
    unmetRequirements: unmet,
    trace,
  };
}
