"use client";

import { frostingTypes, type CakeSpec } from "@/lib/taxonomy";
import { SpecEntry } from "@/components/SpecEntry";
import { setConfidence } from "@/components/spec/set-confidence";

export function FrostingFields(props: { spec: CakeSpec; onChange: (spec: CakeSpec) => void }) {
  const spec = props.spec;
  return (
    <SpecEntry category="frosting" label="Frosting" lowConfidence={spec.confidence.frosting < 0.6}>
      <select
        className="mt-2 min-h-11 w-full border border-ink bg-icing px-2"
        value={spec.frosting.primary}
        onChange={(e) =>
          props.onChange(
            setConfidence(
              {
                ...spec,
                frosting: {
                  ...spec.frosting,
                  primary: e.target.value as typeof spec.frosting.primary,
                },
              },
              "frosting",
            ),
          )
        }
      >
        {frostingTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.label}
          </option>
        ))}
      </select>
    </SpecEntry>
  );
}
