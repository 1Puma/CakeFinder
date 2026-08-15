"use client";

import { structureShapes, type CakeSpec } from "@/lib/taxonomy";
import { SpecEntry } from "@/components/SpecEntry";
import { SpecSelect } from "@/components/SpecSelect";
import { setConfidence } from "@/components/spec/set-confidence";

export function StructureFields(props: {
  spec: CakeSpec;
  onChange: (spec: CakeSpec) => void;
  expanded: boolean;
  onHeaderClick: () => void;
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const spec = props.spec;
  return (
    <SpecEntry
      category="structure"
      label="Structure"
      lowConfidence={spec.confidence.structure < 0.6}
      edited={spec.editedByUser && spec.confidence.structure === 1}
      expanded={props.expanded}
      selected={props.activeId?.startsWith("tier-") ?? false}
      onHeaderClick={() => {
        props.onHeaderClick();
        const first = spec.structure.tiers[0];
        if (first) props.onSelect(`tier-${first.index}`);
      }}
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
        <div key={tier.index} className="mt-2">
          <button
            type="button"
            className="spec-label mb-1 min-h-11 text-left"
            onClick={() => props.onSelect(`tier-${tier.index}`)}
          >
            Tier {index + 1} shape
          </button>
          <SpecSelect
            aria-label={`Tier ${index + 1} shape`}
            value={tier.shape}
            options={structureShapes.map((shape) => ({ value: shape.id, label: shape.label }))}
            onChange={(value) => {
              const tiers = spec.structure.tiers.map((t, i) =>
                i === index ? { ...t, shape: value as typeof t.shape } : t,
              );
              props.onChange(
                setConfidence({ ...spec, structure: { ...spec.structure, tiers } }, "structure"),
              );
              props.onSelect(`tier-${tier.index}`);
            }}
          />
        </div>
      ))}
    </SpecEntry>
  );
}
