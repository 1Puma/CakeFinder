"use client";

import { coatingChoices, labelFor, type CakeSpec } from "@/lib/taxonomy";
import { SpecEntry } from "@/components/SpecEntry";
import { SpecSelect } from "@/components/SpecSelect";
import { setConfidence } from "@/components/spec/set-confidence";

export function CoatingFields(props: {
  spec: CakeSpec;
  onChange: (spec: CakeSpec) => void;
  expanded: boolean;
  onHeaderClick: () => void;
  onSelect: (id: string) => void;
}) {
  const spec = props.spec;
  return (
    <SpecEntry
      category="coating"
      label="Coating"
      lowConfidence={spec.confidence.coating < 0.6}
      expanded={props.expanded}
      onHeaderClick={() => {
        props.onHeaderClick();
        props.onSelect("coating");
      }}
    >
      <SpecSelect
        aria-label="Coating style"
        value={spec.coating?.style ?? ""}
        options={[
          { value: "", label: "None listed" },
          ...coatingChoices.map((item) => ({ value: item.id, label: item.label })),
        ]}
        onChange={(value) => {
          props.onChange(
            setConfidence(
              {
                ...spec,
                coating:
                  value === ""
                    ? null
                    : {
                        style: value as NonNullable<CakeSpec["coating"]>["style"],
                        visualDescription:
                          spec.coating?.visualDescription ?? labelFor("coating", value),
                        locator: spec.coating?.locator ?? "outer coat, all visible sides",
                      },
              },
              "coating",
            ),
          );
        }}
      />
    </SpecEntry>
  );
}
