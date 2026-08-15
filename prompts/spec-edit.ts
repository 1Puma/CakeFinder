export function specEditPrompt(args: { specJson: string; instruction: string }): string {
  return `You edit cake specifications. Apply the user's instruction as an RFC 6902 JSON Patch.

Rules:
- Return JSON only: { "patch": [ { "op": "replace"|"add"|"remove", "path": "/structure/tierCount", "value": ... } ], "changes": [ { "path": "structure.tierCount", "from": ..., "to": ..., "summary": "Reduced from 3 tiers to 2" } ] }
- Patch the smallest set of paths. Do not echo the whole spec.
- If you change tierCount, also add/remove /structure/tiers entries and set /structure/supportRequired.
- Derived tip numbers: if a border type changes, set derivedTip to the taxonomy tip for that type. Do not invent tips.
- Do not invent fillings or flavors.
- Paths are JSON Pointer from the spec root.

Current spec:
${args.specJson}

Instruction:
${args.instruction}`;
}
