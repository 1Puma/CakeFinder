"use client";

import { frostingTypes, type CakeSpec } from "@/lib/taxonomy";
import { SpecEntry } from "@/components/SpecEntry";
import { SpecSelect } from "@/components/SpecSelect";
import { setConfidence } from "@/components/spec/set-confidence";

export function FrostingFields(props: {
  spec: CakeSpec;
  onChange: (spec: CakeSpec) => void;
  expanded: boolean;
  onHeaderClick: () => void;
}) {
  const spec = props.spec;
  return (
    <SpecEntry
      category="frosting"
      label="Frosting"
      lowConfidence={spec.confidence.frosting < 0.6}
      expanded={props.expanded}
      onHeaderClick={props.onHeaderClick}
    >
      <p className="spec-label mt-2">Primary</p>
      <SpecSelect
        aria-label="Primary frosting"
        value={spec.frosting.primary}
        options={frostingTypes.map((type) => ({ value: type.id, label: type.label }))}
        onChange={(value) =>
          props.onChange(
            setConfidence(
              {
                ...spec,
                frosting: {
                  ...spec.frosting,
                  primary: value as typeof spec.frosting.primary,
                },
              },
              "frosting",
            ),
          )
        }
      />
    </SpecEntry>
  );
}
