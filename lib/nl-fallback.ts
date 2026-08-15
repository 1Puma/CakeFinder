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
        `Reduced from ${spec.structure.tierCount} tiers to 2`,
      ),
    );
  }

  if (
    /\b(drop|remove|no)\b.*\bgold\b|\bgold leaf\b/.test(text) &&
    spec.finish.metallicLeaf !== "none"
  ) {
    patch.push({ op: "replace", path: "/finish/metallicLeaf", value: "none" });
    changes.push(
      change("finish.metallicLeaf", spec.finish.metallicLeaf, "none", "Dropped gold leaf"),
    );
  }

  const borderMatch = /\b(shell|bead|ruffle|wavy|straight|band|rope|zigzag|scroll)\s+border\b/.exec(
    text,
  );
  const firstBorder = spec.piping.borders[0];
  if (borderMatch && firstBorder) {
    const type = borderMatch[1];
    if (type) {
      patch.push({ op: "replace", path: "/piping/borders/0/type", value: type });
      patch.push({
        op: "replace",
        path: "/piping/borders/0/derivedTip",
        value: lookupBorderTip(type),
      });
      changes.push(
        change("piping.borders.0.type", firstBorder.type, type, `Changed border to ${type}`),
      );
    }
  }

  if (changes.length === 0) {
    return { spec, changes: [], patch: [] };
  }

  for (const key of ["structure", "frosting", "piping", "decor", "finish"] as const) {
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
