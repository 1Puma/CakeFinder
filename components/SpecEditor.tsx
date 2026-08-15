"use client";

import {
  borderPlacements,
  borderTypes,
  frostingTypes,
  metallicLeafValues,
  structureShapes,
  type CakeSpec,
  type CategoryKey,
} from "@/lib/taxonomy";
import { SpecEntry } from "@/components/SpecEntry";
import { categoryKeys } from "@/lib/taxonomy";

function setConfidence(spec: CakeSpec, key: CategoryKey): CakeSpec {
  return {
    ...spec,
    editedByUser: true,
    confidence: { ...spec.confidence, [key]: 1 },
  };
}

export function SpecEditor(props: {
  spec: CakeSpec;
  onChange: (spec: CakeSpec) => void;
  accordion: boolean;
}) {
  const spec = props.spec;
  const low = (key: CategoryKey) => spec.confidence[key] < 0.6;
  const firstLow = categoryKeys.find((key) => low(key)) ?? "structure";

  return (
    <div className="flex flex-col gap-3">
      <details
        open={!props.accordion || firstLow === "structure"}
        className="border border-ink bg-icing"
      >
        <summary className="min-h-11 cursor-pointer px-3 py-2 font-medium">Structure</summary>
        <SpecEntry
          category="structure"
          label="Structure"
          lowConfidence={low("structure")}
          edited={spec.editedByUser && spec.confidence.structure === 1}
        >
          <label className="mt-2 flex min-h-11 items-center gap-2">
            Tiers
            <input
              className="min-h-11 w-20 border border-ink bg-icing px-2"
              type="number"
              min={1}
              max={8}
              value={spec.structure.tierCount}
              onChange={(e) => {
                const tierCount = Number(e.target.value);
                const tiers = spec.structure.tiers.slice(0, tierCount);
                while (tiers.length < tierCount) {
                  const last = tiers[tiers.length - 1];
                  tiers.push({
                    index: tiers.length,
                    shape: last?.shape ?? "round",
                    approximateDiameterInches: last?.approximateDiameterInches ?? 8,
                    approximateHeightInches: last?.approximateHeightInches ?? 4,
                    region: last?.region ?? null,
                  });
                }
                props.onChange(
                  setConfidence(
                    {
                      ...spec,
                      structure: {
                        ...spec.structure,
                        tierCount,
                        tiers: tiers.map((t, index) => ({ ...t, index })),
                        supportRequired: tierCount > 1,
                      },
                    },
                    "structure",
                  ),
                );
              }}
            />
          </label>
          {spec.structure.tiers.map((tier, index) => (
            <label key={tier.index} className="mt-2 flex min-h-11 items-center gap-2">
              Tier {index + 1} shape
              <select
                className="min-h-11 border border-ink bg-icing px-2"
                value={tier.shape}
                onChange={(e) => {
                  const tiers = spec.structure.tiers.map((t, i) =>
                    i === index ? { ...t, shape: e.target.value as typeof t.shape } : t,
                  );
                  props.onChange(
                    setConfidence(
                      { ...spec, structure: { ...spec.structure, tiers } },
                      "structure",
                    ),
                  );
                }}
              >
                {structureShapes.map((shape) => (
                  <option key={shape.id} value={shape.id}>
                    {shape.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </SpecEntry>
      </details>

      <details
        open={!props.accordion || firstLow === "frosting"}
        className="border border-ink bg-icing"
      >
        <summary className="min-h-11 cursor-pointer px-3 py-2 font-medium">Frosting</summary>
        <SpecEntry category="frosting" label="Frosting" lowConfidence={low("frosting")}>
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
      </details>

      <details
        open={!props.accordion || firstLow === "piping"}
        className="border border-ink bg-icing"
      >
        <summary className="min-h-11 cursor-pointer px-3 py-2 font-medium">Piping</summary>
        <SpecEntry category="piping" label="Piping" lowConfidence={low("piping")}>
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
      </details>

      <details
        open={!props.accordion || firstLow === "decor"}
        className="border border-ink bg-icing"
      >
        <summary className="min-h-11 cursor-pointer px-3 py-2 font-medium">Decor</summary>
        <SpecEntry
          category="decor"
          label="Decor"
          lowConfidence={low("decor")}
          flagged={spec.decor.licensedCharacters.length > 0}
        >
          <p>
            {spec.decor.ediblePrint
              ? `${spec.decor.ediblePrint.subject} · ${spec.decor.ediblePrint.shape}`
              : "No edible print"}
          </p>
          {spec.decor.licensedCharacters.length > 0 ? (
            <p className="text-flag">
              Licensed character — copyrighted/trademarked, not patented. Needs a licensed print
              program.
            </p>
          ) : null}
        </SpecEntry>
      </details>

      <details
        open={!props.accordion || firstLow === "finish"}
        className="border border-ink bg-icing"
      >
        <summary className="min-h-11 cursor-pointer px-3 py-2 font-medium">Finish</summary>
        <SpecEntry category="finish" label="Finish" lowConfidence={low("finish")}>
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
      </details>
    </div>
  );
}
