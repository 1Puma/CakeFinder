"use client";

import type { CakeSpec } from "@/lib/taxonomy";
import { SpecEntry } from "@/components/SpecEntry";
import { SpecSelect } from "@/components/SpecSelect";
import { metallicLeafValues } from "@/lib/taxonomy";
import { setConfidence } from "@/components/spec/set-confidence";

export function DecorFields(props: {
  spec: CakeSpec;
  expanded: boolean;
  onHeaderClick: () => void;
  onSelect: (id: string) => void;
}) {
  const spec = props.spec;
  return (
    <SpecEntry
      category="decor"
      label="Decor"
      lowConfidence={spec.confidence.decor < 0.6}
      flagged={spec.decor.licensedCharacters.length > 0}
      expanded={props.expanded}
      onHeaderClick={() => {
        props.onHeaderClick();
        if (spec.decor.ediblePrint) props.onSelect("print");
      }}
    >
      <p>
        {spec.decor.ediblePrint
          ? `${spec.decor.ediblePrint.subject} · ${spec.decor.ediblePrint.shape}`
          : "No edible print"}
      </p>
      {spec.decor.licensedCharacters.length > 0 ? (
        <p className="text-flag">
          Licensed character. Copyrighted and trademarked, not patented. Needs a licensed print
          program.
        </p>
      ) : null}
    </SpecEntry>
  );
}

export function FinishFields(props: {
  spec: CakeSpec;
  onChange: (spec: CakeSpec) => void;
  expanded: boolean;
  onHeaderClick: () => void;
}) {
  const spec = props.spec;
  return (
    <SpecEntry
      category="finish"
      label="Finish"
      lowConfidence={spec.confidence.finish < 0.6}
      expanded={props.expanded}
      onHeaderClick={props.onHeaderClick}
    >
      <p className="spec-label mt-2">Metallic leaf</p>
      <SpecSelect
        aria-label="Metallic leaf"
        value={spec.finish.metallicLeaf}
        options={metallicLeafValues.map((value) => ({
          value,
          label: value,
        }))}
        onChange={(value) =>
          props.onChange(
            setConfidence(
              {
                ...spec,
                finish: {
                  ...spec.finish,
                  metallicLeaf: value as typeof spec.finish.metallicLeaf,
                },
              },
              "finish",
            ),
          )
        }
      />
    </SpecEntry>
  );
}
