export function matchPlanPrompt(args: {
  requiredFlags: string[];
  rarity: Array<{ flag: string; rarity: number }>;
}): string {
  return `You plan a decorator search. Rank which capability flags actually discriminate.

Universal flags like coating:smooth do not narrow a city.
Rare flags like topping:gold_leaf and finish:mirror_glaze should drive the search.

Required flags:
${args.requiredFlags.join("\n")}

Rarity (1 = rare):
${args.rarity.map((r) => `${r.flag}: ${r.rarity}`).join("\n")}

Return JSON: { "limiting": ["flag", "..."], "rationale": "one sentence" }
Use 1–3 limiting flags.`;
}
