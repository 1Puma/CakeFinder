import type { Operation } from "fast-json-patch";
import { applySpecPatch } from "./json-patch";
import type { CakeSpec } from "./taxonomy";
import type { ChangeDescription } from "./types";
import { lookupBorderTip } from "./taxonomy";

function change(path: string, from: unknown, to: unknown, summary: string): ChangeDescription {
  return { path, from, to, summary };
}

export function applyNaturalLanguageFallback(
  spec: CakeSpec,
  instruction: string,
): { spec: CakeSpec; changes: ChangeDescription[]; patch: Operation[] } {
  const text = instruction.toLowerCase();
  const patch: Operation[] = [];
  const changes: ChangeDescription[] = [];

  const twoTiers = /\b(two|2)\s+tiers?\b/.exec(text);
  if (twoTiers && spec.structure.tierCount !== 2) {
    patch.push({ op: "replace", path: "/structure/tierCount", value: 2 });
    patch.push({
      op: "replace",
      path: "/structure/tiers",
      value: spec.structure.tiers.slice(0, 2).map((t, index) => ({ ...t, index })),
    });
    patch.push({ op: "replace", path: "/structure/supportRequired", value: true });
    changes.push(
      change(
        "structure.tierCount",
        spec.structure.tierCount,
        2,
        `${spec.structure.tierCount} tiers → 2 tiers`,
      ),
    );
  }

  if (/\b(drop|remove|no)\b.*\bgold\b|\bgold leaf\b/.test(text)) {
    const gold = spec.toppings.kinds.filter((k) => k.type === "gold_leaf");
    if (gold.length > 0) {
      patch.push({
        op: "replace",
        path: "/toppings/kinds",
        value: spec.toppings.kinds.filter((k) => k.type !== "gold_leaf"),
      });
      changes.push(change("toppings.kinds", "gold leaf", "none", "gold leaf → none"));
    }
  }

  const borderMatch = /\b(shell|bead|ruffle|scallop|cornelli)\s+border\b/.exec(text);
  const firstBorder = spec.borders[0];
  if (borderMatch && firstBorder) {
    const type = borderMatch[1];
    if (type) {
      patch.push({ op: "replace", path: "/borders/0/type", value: type });
      patch.push({
        op: "replace",
        path: "/borders/0/derivedTip",
        value: lookupBorderTip(type),
      });
      changes.push(
        change(
          "borders.0.type",
          firstBorder.type,
          type,
          `${firstBorder.type} border → ${type} border`,
        ),
      );
    }
  }

  if (changes.length === 0) {
    return { spec, changes: [], patch: [] };
  }

  const confidenceKeys = [
    "structure",
    "coating",
    "borders",
    "accents",
    "finishes",
    "toppings",
  ] as const;
  for (const key of confidenceKeys) {
    if (changes.some((c) => c.path.startsWith(key))) {
      patch.push({ op: "replace", path: `/confidence/${key}`, value: 1 });
    }
  }
  patch.push({ op: "replace", path: "/editedByUser", value: true });

  const applied = applySpecPatch(spec, patch);
  if (!applied.ok) {
    return { spec, changes: [], patch: [] };
  }
  return { spec: applied.value, changes, patch };
}
