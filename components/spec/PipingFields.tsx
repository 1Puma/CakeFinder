"use client";

import { borderPlacements, borderTypes, type CakeSpec } from "@/lib/taxonomy";
import { SpecEntry } from "@/components/SpecEntry";
import { setConfidence } from "@/components/spec/set-confidence";

export function PipingFields(props: { spec: CakeSpec; onChange: (spec: CakeSpec) => void }) {
  const spec = props.spec;
  return (
    <SpecEntry category="piping" label="Piping" lowConfidence={spec.confidence.piping < 0.6}>
      {spec.piping.borders.map((border, index) => (
        <div key={`${border.type}-${index}`} className="mt-2 grid gap-2 sm:grid-cols-2">
          <select
            className="min-h-11 border border-ink bg-icing px-2"
            value={border.type}
            onChange={(e) => {
              const borders = spec.piping.borders.map((b, i) =>
                i === index ? { ...b, type: e.target.value as typeof b.type } : b,
              );
              props.onChange(
                setConfidence({ ...spec, piping: { ...spec.piping, borders } }, "piping"),
              );
            }}
          >
            {borderTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.id.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <select
            className="min-h-11 border border-ink bg-icing px-2"
            value={border.placement}
            onChange={(e) => {
              const borders = spec.piping.borders.map((b, i) =>
                i === index ? { ...b, placement: e.target.value as typeof b.placement } : b,
              );
              props.onChange(
                setConfidence({ ...spec, piping: { ...spec.piping, borders } }, "piping"),
              );
            }}
          >
            {borderPlacements.map((placement) => (
              <option key={placement} value={placement}>
                {placement.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <p className="data text-[13px]">TIP {border.derivedTip}</p>
        </div>
      ))}
    </SpecEntry>
  );
}
