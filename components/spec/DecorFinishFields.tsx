"use client";

import type { CakeSpec } from "@/lib/taxonomy";
import { SpecEntry } from "@/components/SpecEntry";
import { metallicLeafValues } from "@/lib/taxonomy";
import { setConfidence } from "@/components/spec/set-confidence";

export function DecorFields(props: { spec: CakeSpec }) {
  const spec = props.spec;
  return (
    <SpecEntry
      category="decor"
      label="Decor"
      lowConfidence={spec.confidence.decor < 0.6}
      flagged={spec.decor.licensedCharacters.length > 0}
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

export function FinishFields(props: { spec: CakeSpec; onChange: (spec: CakeSpec) => void }) {
  const spec = props.spec;
  return (
    <SpecEntry category="finish" label="Finish" lowConfidence={spec.confidence.finish < 0.6}>
      <select
        className="mt-2 min-h-11 w-full border border-ink bg-icing px-2"
        value={spec.finish.metallicLeaf}
        onChange={(e) =>
          props.onChange(
            setConfidence(
              {
                ...spec,
                finish: {
                  ...spec.finish,
                  metallicLeaf: e.target.value as typeof spec.finish.metallicLeaf,
                },
              },
              "finish",
            ),
          )
        }
      >
        {metallicLeafValues.map((value) => (
          <option key={value} value={value}>
            Metallic leaf: {value}
          </option>
        ))}
      </select>
    </SpecEntry>
  );
}
