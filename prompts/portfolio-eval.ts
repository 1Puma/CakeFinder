import { buildTaxonomyPromptSection } from "../lib/taxonomy";

export function portfolioEvalPrompt(args: { requiredFlags: string[] }): string {
  return `Identify only capabilities you can SEE DEMONSTRATED in these photographs.

A bakery listing "custom cakes" in its description is not evidence.
A photograph of a three-tier fondant cake is evidence for
structure:tiered and frosting:fondant.

For each capability you identify, cite which image number demonstrates it
and give a one-sentence justification.

Absence of evidence is not evidence of absence — omit capabilities you
cannot confirm rather than marking them false.

Focus especially on these required flags when present:
${args.requiredFlags.join(", ")}

${buildTaxonomyPromptSection()}

Return JSON:
{ "evidence": [ { "flag": "structure:tiered", "confidence": 0.8, "imageNumbers": [1], "reasoning": "..." } ] }`;
}
