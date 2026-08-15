"use client";

import { borderChoices, type CakeSpec } from "@/lib/taxonomy";
import { SpecEntry } from "@/components/SpecEntry";
import { SpecSelect } from "@/components/SpecSelect";
import { setConfidence } from "@/components/spec/set-confidence";

export function BorderFields(props: {
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
      category="borders"
      label="Borders"
      lowConfidence={spec.confidence.borders < 0.6}
      expanded={props.expanded}
      selected={props.activeId?.startsWith("border-") ?? false}
      onHeaderClick={() => {
        props.onHeaderClick();
        if (spec.borders[0]) props.onSelect("border-0");
      }}
    >
      {spec.borders.length === 0 ? <p className="spec-label">No borders listed.</p> : null}
      {spec.borders.map((border, index) => (
        <div key={`${border.type}-${index}`} className="mt-2">
          <button
            type="button"
            className="spec-label min-h-11 text-left"
            onClick={() => props.onSelect(`border-${index}`)}
          >
            Border {index + 1}
          </button>
          <SpecSelect
            aria-label={`Border ${index + 1}`}
            value={border.type}
            options={borderChoices.map((item) => ({ value: item.id, label: item.label }))}
            onChange={(value) => {
              const borders = spec.borders.map((b, i) =>
                i === index ? { ...b, type: value as typeof b.type } : b,
              );
              props.onChange(setConfidence({ ...spec, borders }, "borders"));
              props.onSelect(`border-${index}`);
            }}
          />
          <p className="font-data mt-1 text-[13px] tracking-[0.02em] text-ink">
            TIP {border.derivedTip}
          </p>
        </div>
      ))}
    </SpecEntry>
  );
}
