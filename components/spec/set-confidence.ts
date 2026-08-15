import type { CakeSpec, CategoryKey } from "@/lib/taxonomy";

export function setConfidence(spec: CakeSpec, key: CategoryKey): CakeSpec {
  return {
    ...spec,
    editedByUser: true,
    confidence: { ...spec.confidence, [key]: 1 },
  };
}
