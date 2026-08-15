import { buildTaxonomyPromptSection } from "../lib/taxonomy";

export function decomposePrompt(args: {
  medium: "layered" | "ice_cream";
  mediumConstraints: string;
  schema: string;
  retryError?: string;
}): string {
  const retry = args.retryError
    ? `\nThe previous JSON failed validation:\n${args.retryError}\nReturn corrected JSON only.\n`
    : "";

  return `You are a cake decorating specialist producing a build specification from a photograph.

Your job is to identify the decorative choices used to make this cake,
so a different decorator could reproduce it.

CRITICAL RULES:

A TIER exists only where a SMALLER cake shape sits on top of a LARGER cake
shape. Look for a step change in diameter with a visible ledge.

Decorative bands, borders, drips, rows of piping, and rings of rosettes are
NOT tiers. A tall single cake is one tier no matter how many bands of
decoration it carries.

Default to 1. Only report 2 or more when you can see a smaller shape resting
on a larger one.

1. Do not detect or guess frosting type. Buttercream, Pastry Pride, and
   whipped coatings look the same in a photograph. Omit frosting from the JSON.

2. Classify borders by the decorative choice (shell, bead, ruffle, scallop,
   cornelli). Tip numbers are derived from that name — not your job.

3. Report only what is visible. Do not infer interior structure, flavor,
   or filling.

4. Give a confidence score per detected category. Be honest.

5. Named confections on the cake (Oreo, macaron, Kit Kat, berries, shards)
   go in toppings.items: name the item, whether it is brand-named, count it,
   and describe the arrangement in words. "There is a cookie on it" is not
   a spec.

6. Every coating, border, accent, finish, topping kind, topping item, and
   tier must include visualDescription and locator. Describe position in
   words a person would use, never as coordinates or pixel positions.

Medium for this photo: ${args.medium}

${buildTaxonomyPromptSection()}

MEDIUM CONSTRAINTS
${args.mediumConstraints}

Return JSON matching this schema exactly. Do not wrap in markdown.
Do not include a frosting field.
${args.schema}
${retry}`;
}
