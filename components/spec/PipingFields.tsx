"use client";

import { borderPlacements, borderTypes, type CakeSpec } from "@/lib/taxonomy";
import { SpecEntry } from "@/components/SpecEntry";
import { SpecSelect } from "@/components/SpecSelect";
import { setConfidence } from "@/components/spec/set-confidence";

export function PipingFields(props: {
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
      category="piping"
      label="Piping"
      lowConfidence={spec.confidence.piping < 0.6}
      expanded={props.expanded}
      selected={props.activeId?.startsWith("border-") || props.activeId?.startsWith("surface-")}
      onHeaderClick={() => {
        props.onHeaderClick();
        if (spec.piping.borders[0]) props.onSelect("border-0");
      }}
    >
      {spec.piping.borders.map((border, index) => (
        <div key={`${border.type}-${index}`} className="mt-2 grid gap-2">
          <button
            type="button"
            className="spec-label min-h-11 text-left"
            onClick={() => props.onSelect(`border-${index}`)}
          >
            Border {index + 1}
          </button>
          <SpecSelect
            aria-label={`Border ${index + 1} type`}
            value={border.type}
            options={borderTypes.map((type) => ({
              value: type.id,
              label: type.id.replaceAll("_", " "),
            }))}
            onChange={(value) => {
              const borders = spec.piping.borders.map((b, i) =>
                i === index ? { ...b, type: value as typeof b.type } : b,
              );
              props.onChange(
                setConfidence({ ...spec, piping: { ...spec.piping, borders } }, "piping"),
              );
              props.onSelect(`border-${index}`);
            }}
          />
          <SpecSelect
            aria-label={`Border ${index + 1} placement`}
            value={border.placement}
            options={borderPlacements.map((placement) => ({
              value: placement,
              label: placement.replaceAll("_", " "),
            }))}
            onChange={(value) => {
              const borders = spec.piping.borders.map((b, i) =>
                i === index ? { ...b, placement: value as typeof b.placement } : b,
              );
              props.onChange(
                setConfidence({ ...spec, piping: { ...spec.piping, borders } }, "piping"),
              );
            }}
          />
          <p className="font-data text-[13px] tracking-[0.02em] text-ink">
            TIP {border.derivedTip}
          </p>
        </div>
      ))}
    </SpecEntry>
  );
}
