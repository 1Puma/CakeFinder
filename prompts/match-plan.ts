export function matchPlanPrompt(args: {
  requiredFlags: string[];
  rarity: Array<{ flag: string; rarity: number }>;
}): string {
  return `You plan a decorator search. Rank which capability flags actually discriminate.

Universal flags like frosting:buttercream_american do not narrow a city.
Rare flags like finish:metallicLeaf and decor:licensed_print should drive the search.

Required flags:
${args.requiredFlags.join("\n")}

Rarity (1 = rare):
${args.rarity.map((r) => `${r.flag}: ${r.rarity}`).join("\n")}

Return JSON: { "limiting": ["flag", "..."], "rationale": "one sentence" }
Use 1–3 limiting flags.`;
}
