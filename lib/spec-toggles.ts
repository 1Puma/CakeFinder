import {
  labelFor,
  lookupBorderTip,
  type CakeSpec,
  type AnalysisCategoryKey,
  type CategoryKey,
} from "./taxonomy";

function markEdited(spec: CakeSpec, key: CategoryKey): CakeSpec {
  return {
    ...spec,
    editedByUser: true,
    confidence: { ...spec.confidence, [key]: 1 },
  };
}

function locatedFromLabel(
  kind: "coating" | "border" | "accent" | "finish" | "topping",
  id: string,
): { visualDescription: string; locator: string } {
  return {
    visualDescription: labelFor(kind, id),
    locator: "on the cake",
  };
}

export function setSummary(spec: CakeSpec, key: AnalysisCategoryKey, value: string): CakeSpec {
  return {
    ...spec,
    summaries: { ...spec.summaries, [key]: value },
    editedByUser: true,
  };
}

export function setCoatingStyle(
  spec: CakeSpec,
  style: NonNullable<CakeSpec["coating"]>["style"] | "",
): CakeSpec {
  const coating =
    style === ""
      ? null
      : {
          style,
          visualDescription:
            spec.coating?.visualDescription ?? locatedFromLabel("coating", style).visualDescription,
          locator: spec.coating?.locator ?? locatedFromLabel("coating", style).locator,
        };
  return markEdited({ ...spec, coating }, "coating");
}

export function toggleBorder(
  spec: CakeSpec,
  type: CakeSpec["borders"][number]["type"],
  on: boolean,
): CakeSpec {
  const exists = spec.borders.some((b) => b.type === type);
  if (on === exists) return spec;
  const borders = on
    ? [
        ...spec.borders,
        {
          type,
          derivedTip: lookupBorderTip(type),
          ...locatedFromLabel("border", type),
        },
      ]
    : spec.borders.filter((b) => b.type !== type);
  return markEdited({ ...spec, borders }, "borders");
}

export function toggleAccent(
  spec: CakeSpec,
  type: CakeSpec["accents"][number]["type"],
  on: boolean,
): CakeSpec {
  const exists = spec.accents.some((a) => a.type === type);
  if (on === exists) return spec;
  const accents = on
    ? [...spec.accents, { type, count: null, ...locatedFromLabel("accent", type) }]
    : spec.accents.filter((a) => a.type !== type);
  return markEdited({ ...spec, accents }, "accents");
}

export function toggleFinish(
  spec: CakeSpec,
  type: CakeSpec["finishes"][number]["type"],
  on: boolean,
): CakeSpec {
  const exists = spec.finishes.some((f) => f.type === type);
  if (on === exists) return spec;
  const finishes = on
    ? [...spec.finishes, { type, ...locatedFromLabel("finish", type) }]
    : spec.finishes.filter((f) => f.type !== type);
  return markEdited({ ...spec, finishes }, "finishes");
}

export function toggleToppingKind(
  spec: CakeSpec,
  type: CakeSpec["toppings"]["kinds"][number]["type"],
  on: boolean,
): CakeSpec {
  const exists = spec.toppings.kinds.some((k) => k.type === type);
  if (on === exists) return spec;
  const kinds = on
    ? [...spec.toppings.kinds, { type, ...locatedFromLabel("topping", type) }]
    : spec.toppings.kinds.filter((k) => k.type !== type);
  return markEdited({ ...spec, toppings: { ...spec.toppings, kinds } }, "toppings");
}

export function setOtherNote(spec: CakeSpec, note: string): CakeSpec {
  const trimmed = note.trim();
  const other =
    trimmed.length === 0
      ? []
      : spec.other.length > 0
        ? spec.other.map((item, index) => (index === 0 ? { ...item, description: trimmed } : item))
        : [{ description: trimmed, locator: "on the cake" }];
  return {
    ...spec,
    other,
    summaries: { ...spec.summaries, other: note },
    editedByUser: true,
  };
}
