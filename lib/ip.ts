import type { CakeSpec } from "./taxonomy";
import type { Decorator } from "./types";

export function licensedCharactersPresent(spec: CakeSpec): boolean {
  return spec.decor.licensedCharacters.length > 0;
}

export function acceptSubstitution(spec: CakeSpec): CakeSpec {
  return {
    ...spec,
    decor: {
      ...spec.decor,
      licensedCharacters: [],
    },
    flags: spec.flags.filter((f) => f.code !== "licensed_character"),
    editedByUser: true,
    confidence: { ...spec.confidence, decor: 1 },
  };
}

export function decoratorHasLicensedPrint(decorator: Decorator): boolean {
  if (decorator.hasLicensedPrintProgram === true) {
    return true;
  }
  return decorator.capabilities.some(
    (c) => c.flag === "decor:licensed_print" && c.confidence >= 0.5,
  );
}

export function substitutionCopy(args: {
  characterLabel: string;
  radiusMiles: number;
  matchingPaletteCount: number;
}): string {
  return `No licensed ${args.characterLabel} print available within ${args.radiusMiles} miles. ${args.matchingPaletteCount} decorator${args.matchingPaletteCount === 1 ? "" : "s"} can match the palette and shapes.`;
}
