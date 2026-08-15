"use client";

import { structureShapes, type CakeSpec } from "@/lib/taxonomy";
import { SpecEntry } from "@/components/SpecEntry";
import { SpecSelect } from "@/components/SpecSelect";

export function StructureFields(props: {
  spec: CakeSpec;
  onChange: (spec: CakeSpec) => void;
  expanded: boolean;
  onHeaderClick: () => void;
}) {
  const spec = props.spec;
  return (
    <SpecEntry
      category="coating"
      label="Structure"
      lowConfidence={spec.confidence.structure < 0.6}
      expanded={props.expanded}
      onHeaderClick={props.onHeaderClick}
    >
      <label className="mt-2 flex min-h-11 items-center gap-2">
        <span className="spec-label">Tiers</span>
        <input
          className="spec-select min-h-11 w-20 px-2 font-data text-[15px]"
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
                visualDescription: last?.visualDescription ?? "Additional stacked cake",
                locator: last?.locator ?? "stacked above the previous tier",
              });
            }
            props.onChange({
              ...spec,
              structure: {
                ...spec.structure,
                tierCount,
                tiers: tiers.map((t, index) => ({ ...t, index })),
                supportRequired: tierCount > 1,
              },
              editedByUser: true,
              confidence: { ...spec.confidence, structure: 1 },
            });
          }}
        />
      </label>
      {spec.structure.tiers.map((tier, index) => (
        <div key={tier.index} className="mt-2">
          <p className="spec-label mb-1">Tier {index + 1} shape</p>
          <SpecSelect
            aria-label={`Tier ${index + 1} shape`}
            value={tier.shape}
            options={structureShapes.map((shape) => ({ value: shape.id, label: shape.label }))}
            onChange={(value) => {
              const tiers = spec.structure.tiers.map((t, i) =>
                i === index ? { ...t, shape: value as typeof t.shape } : t,
              );
              props.onChange({
                ...spec,
                structure: { ...spec.structure, tiers },
                editedByUser: true,
                confidence: { ...spec.confidence, structure: 1 },
              });
            }}
          />
        </div>
      ))}
    </SpecEntry>
  );
}
