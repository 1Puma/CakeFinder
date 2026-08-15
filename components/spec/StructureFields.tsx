"use client";

import { structureShapes, type CakeSpec } from "@/lib/taxonomy";
import { SpecEntry } from "@/components/SpecEntry";
import { setConfidence } from "@/components/spec/set-confidence";

export function StructureFields(props: { spec: CakeSpec; onChange: (spec: CakeSpec) => void }) {
  const spec = props.spec;
  return (
    <SpecEntry
      category="structure"
      label="Structure"
      lowConfidence={spec.confidence.structure < 0.6}
      edited={spec.editedByUser && spec.confidence.structure === 1}
    >
      <label className="mt-2 flex min-h-11 items-center gap-2">
        Tiers
        <input
          className="min-h-11 w-20 border border-ink bg-icing px-2"
          type="number"
          min={1}
          max={8}
          value={spec.structure.tierCount}
          onChange={(e) => {
            const tierCount = Number(e.target.value);
            const tiers = spec.structure.tiers.slice(0, tierCount);
            while (tiers.length < tierCount) {
              const last = tiers[tiers.length - 1];
              tiers.push({
                index: tiers.length,
                shape: last?.shape ?? "round",
                approximateDiameterInches: last?.approximateDiameterInches ?? 8,
                approximateHeightInches: last?.approximateHeightInches ?? 4,
                region: last?.region ?? null,
              });
            }
            props.onChange(
              setConfidence(
                {
                  ...spec,
                  structure: {
                    ...spec.structure,
                    tierCount,
                    tiers: tiers.map((t, index) => ({ ...t, index })),
                    supportRequired: tierCount > 1,
                  },
                },
                "structure",
              ),
            );
          }}
        />
      </label>
      {spec.structure.tiers.map((tier, index) => (
        <label key={tier.index} className="mt-2 flex min-h-11 items-center gap-2">
          Tier {index + 1} shape
          <select
            className="min-h-11 border border-ink bg-icing px-2"
            value={tier.shape}
            onChange={(e) => {
              const tiers = spec.structure.tiers.map((t, i) =>
                i === index ? { ...t, shape: e.target.value as typeof t.shape } : t,
              );
              props.onChange(
                setConfidence({ ...spec, structure: { ...spec.structure, tiers } }, "structure"),
              );
            }}
          >
            {structureShapes.map((shape) => (
              <option key={shape.id} value={shape.id}>
                {shape.label}
              </option>
            ))}
          </select>
        </label>
      ))}
    </SpecEntry>
  );
}
