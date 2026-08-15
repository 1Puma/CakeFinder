export function substitutionPrompt(args: { blockedFlag: string; specJson: string }): string {
  return `A cake spec cannot be fulfilled locally because of this blocking requirement: ${args.blockedFlag}

If the block is a licensed/copyrighted character, propose a compliant alternative: palette, shapes, and motifs — not the character. Bakeries cannot legally freehand copyrighted characters. They can use licensed edible images when they have a print program.

Be direct. Do not apologize. Do not say sorry.

Spec:
${args.specJson}

Return JSON:
{
  "proposal": "No licensed print available within the search radius. Three decorators can match the palette and shapes.",
  "specPatchSummary": "what would change on the spec if accepted",
  "patch": [ { "op": "replace", "path": "/decor/licensedCharacters", "value": [] } ]
}`;
}
