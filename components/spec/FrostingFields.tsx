"use client";

import { frostingTypes, type CakeSpec } from "@/lib/taxonomy";
import { SpecSelect } from "@/components/SpecSelect";

export function FrostingFields(props: {
  spec: CakeSpec;
  onChange: (spec: CakeSpec) => void;
  expanded: boolean;
  onHeaderClick: () => void;
}) {
  const unset = props.spec.frosting.primary === null;
  return (
    <article
      className="px-3 py-2"
      style={{
        borderLeft: unset ? "3px dashed var(--ink-soft)" : "3px solid var(--ink)",
      }}
    >
      <button
        type="button"
        className="flex min-h-11 w-full items-center text-left"
        onClick={props.onHeaderClick}
      >
        <span className="font-data text-[12px] uppercase tracking-[0.02em] text-[var(--ink-soft)]">
          Frosting
        </span>
      </button>
      {props.expanded ? (
        <>
          {unset ? (
            <p className="mt-1 text-[13px] text-flag">
              Pick a frosting — this can&apos;t be read from a photo.
            </p>
          ) : null}
          <div className="mt-2">
            <SpecSelect
              aria-label="Frosting"
              value={props.spec.frosting.primary ?? ""}
              options={[
                { value: "", label: "Not chosen" },
                ...frostingTypes.map((type) => ({ value: type.id, label: type.label })),
              ]}
              onChange={(value) =>
                props.onChange({
                  ...props.spec,
                  frosting: {
                    primary:
                      value === "" ? null : (value as NonNullable<CakeSpec["frosting"]["primary"]>),
                  },
                  editedByUser: true,
                })
              }
            />
          </div>
        </>
      ) : null}
    </article>
  );
}
