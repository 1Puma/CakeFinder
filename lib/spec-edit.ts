import type { Operation } from "fast-json-patch";
import { hasGrokKey } from "./env";
import { grokJson } from "./grok";
import { applySpecPatch } from "./json-patch";
import { err, ok, type Result } from "./result";
import type { CakeSpec } from "./taxonomy";
import type { ChangeDescription } from "./types";
import { specEditPrompt } from "../prompts/spec-edit";
import { applyNaturalLanguageFallback } from "./nl-fallback";

const patchOpSchema = {
  parse(value: unknown): { patch: Operation[]; changes: ChangeDescription[] } {
    const record = value as {
      patch?: Operation[];
      changes?: ChangeDescription[];
    };
    if (!Array.isArray(record.patch)) {
      throw new Error("patch missing");
    }
    return {
      patch: record.patch,
      changes: Array.isArray(record.changes) ? record.changes : [],
    };
  },
};

export type EditSpecError = { kind: "invalid_patch" | "model"; message: string };

export async function editSpec(input: {
  spec: CakeSpec;
  instruction: string;
}): Promise<
  Result<{ spec: CakeSpec; changes: ChangeDescription[]; patch: Operation[] }, EditSpecError>
> {
  if (!hasGrokKey()) {
    const fallback = applyNaturalLanguageFallback(input.spec, input.instruction);
    return ok(fallback);
  }

  const modeled = await grokJson(
    {
      messages: [
        {
          role: "user",
          content: specEditPrompt({
            specJson: JSON.stringify(input.spec),
            instruction: input.instruction,
          }),
        },
      ],
    },
    (value) => patchOpSchema.parse(value),
  );

  if (!modeled.ok) {
    const fallback = applyNaturalLanguageFallback(input.spec, input.instruction);
    if (fallback.changes.length > 0) {
      return ok(fallback);
    }
    return err({
      kind: "model",
      message:
        "Could not turn that instruction into an edit. Try naming a field: two tiers, drop the gold leaf, shell border.",
    });
  }

  const applied = applySpecPatch(input.spec, modeled.value.patch);
  if (!applied.ok) {
    return applied;
  }
  return ok({
    spec: applied.value,
    changes: modeled.value.changes,
    patch: modeled.value.patch,
  });
}
