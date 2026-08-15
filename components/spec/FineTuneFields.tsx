"use client";

import { frostingTypes, structureShapes, type CakeSpec } from "@/lib/taxonomy";
import { applyMediumConstraints } from "@/lib/medium-constraints";
import { MediumToggle } from "@/components/MediumToggle";
import { SpecSelect } from "@/components/SpecSelect";

export function FineTuneFields(props: { spec: CakeSpec; onChange: (spec: CakeSpec) => void }) {
  const spec = props.spec;
  const unset = spec.frosting.primary === null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="font-data text-[12px] uppercase tracking-[0.02em] text-ink-soft">Cake type</p>
        <div className="mt-2">
          <MediumToggle
            value={spec.medium}
            onChange={(medium) =>
              props.onChange(applyMediumConstraints({ ...spec, medium, editedByUser: true }))
            }
          />
        </div>
      </div>
      <div
        style={{
          borderLeft: unset ? "3px dashed var(--ink-soft)" : "3px solid var(--ink)",
          paddingLeft: "var(--space-3)",
        }}
      >
        <p className="font-data text-[12px] uppercase tracking-[0.02em] text-ink-soft">Frosting</p>
        {unset ? (
          <p className="mt-1 text-[13px] text-flag">
            Pick a frosting — this can&apos;t be read from a photo.
          </p>
        ) : null}
        <div className="mt-2">
          <SpecSelect
            aria-label="Frosting"
            value={spec.frosting.primary ?? ""}
            options={[
              { value: "", label: "Not chosen" },
              ...frostingTypes.map((type) => ({ value: type.id, label: type.label })),
            ]}
            onChange={(value) =>
              props.onChange({
                ...spec,
                frosting: {
                  primary:
                    value === "" ? null : (value as NonNullable<CakeSpec["frosting"]["primary"]>),
                },
                editedByUser: true,
              })
            }
          />
        </div>
      </div>
      <label className="flex min-h-11 items-center gap-2">
        <span className="spec-label">Tiers</span>
        <input
          className="spec-select min-h-11 w-20 px-2 font-data text-[15px]"
          type="number"
          min={1}
          max={8}
          value={spec.structure.tierCount}
          onChange={(event) => {
            const tierCount = Number(event.target.value);
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
                tiers: tiers.map((tier, index) => ({ ...tier, index })),
                supportRequired: tierCount > 1,
              },
              editedByUser: true,
              confidence: { ...spec.confidence, structure: 1 },
            });
          }}
        />
      </label>
      {spec.structure.tiers.map((tier, index) => (
        <div key={tier.index}>
          <p className="spec-label mb-1">Tier {index + 1} shape</p>
          <SpecSelect
            aria-label={`Tier ${index + 1} shape`}
            value={tier.shape}
            options={structureShapes.map((shape) => ({ value: shape.id, label: shape.label }))}
            onChange={(value) => {
              const tiers = spec.structure.tiers.map((item, i) =>
                i === index ? { ...item, shape: value as typeof item.shape } : item,
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
    </div>
  );
}
