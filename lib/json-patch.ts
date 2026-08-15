import { applyPatch, type Operation } from "fast-json-patch";
import { cakeSpecSchema, lookupBorderTip, type CakeSpec } from "./taxonomy";
import { err, ok, type Result } from "./result";

export type PatchError = { kind: "invalid_patch"; message: string };

export function applySpecPatch(spec: CakeSpec, patch: Operation[]): Result<CakeSpec, PatchError> {
  try {
    const document = JSON.parse(JSON.stringify(spec)) as CakeSpec;
    const patched = applyPatch(document, patch, true, true).newDocument as CakeSpec;
    patched.borders = patched.borders.map((border) => ({
      ...border,
      derivedTip: lookupBorderTip(border.type),
    }));
    patched.editedByUser = true;
    return ok(cakeSpecSchema.parse(patched));
  } catch (error) {
    return err({
      kind: "invalid_patch",
      message:
        error instanceof Error
          ? `The edit could not be applied: ${error.message}. Try a smaller change.`
          : "The edit could not be applied. Try a smaller change.",
    });
  }
}
