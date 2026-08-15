"use client";

import { labelFor, type CakeSpec } from "@/lib/taxonomy";
import { SpecEntry } from "@/components/SpecEntry";

export function AccentFields(props: {
  spec: CakeSpec;
  expanded: boolean;
  onHeaderClick: () => void;
  onSelect: (id: string) => void;
}) {
  const spec = props.spec;
  return (
    <SpecEntry
      category="accents"
      label="Accents"
      lowConfidence={spec.confidence.accents < 0.6}
      expanded={props.expanded}
      onHeaderClick={() => {
        props.onHeaderClick();
        if (spec.accents[0]) props.onSelect("accent-0");
      }}
    >
      {spec.accents.length === 0 ? <p className="spec-label">No piped accents listed.</p> : null}
      {spec.accents.map((accent, index) => (
        <button
          key={`${accent.type}-${index}`}
          type="button"
          className="mt-2 block min-h-11 text-left"
          onClick={() => props.onSelect(`accent-${index}`)}
        >
          {labelFor("accent", accent.type)}
          {accent.count ? ` · ${accent.count}` : ""}
        </button>
      ))}
    </SpecEntry>
  );
}

export function FinishListFields(props: {
  spec: CakeSpec;
  expanded: boolean;
  onHeaderClick: () => void;
  onSelect: (id: string) => void;
}) {
  const spec = props.spec;
  return (
    <SpecEntry
      category="finishes"
      label="Finishes"
      lowConfidence={spec.confidence.finishes < 0.6}
      expanded={props.expanded}
      onHeaderClick={() => {
        props.onHeaderClick();
        if (spec.finishes[0]) props.onSelect("finish-0");
      }}
    >
      {spec.finishes.length === 0 ? <p className="spec-label">No glaze or drip listed.</p> : null}
      {spec.finishes.map((finish, index) => (
        <button
          key={`${finish.type}-${index}`}
          type="button"
          className="mt-2 block min-h-11 text-left"
          onClick={() => props.onSelect(`finish-${index}`)}
        >
          {labelFor("finish", finish.type)}
        </button>
      ))}
    </SpecEntry>
  );
}

export function ToppingFields(props: {
  spec: CakeSpec;
  expanded: boolean;
  onHeaderClick: () => void;
  onSelect: (id: string) => void;
}) {
  const spec = props.spec;
  return (
    <SpecEntry
      category="toppings"
      label="Toppings"
      lowConfidence={spec.confidence.toppings < 0.6}
      expanded={props.expanded}
      onHeaderClick={() => {
        props.onHeaderClick();
        if (spec.toppings.items[0]) props.onSelect("topping-item-0");
        else if (spec.toppings.kinds[0]) props.onSelect("topping-kind-0");
      }}
    >
      {spec.toppings.kinds.map((kind, index) => (
        <p key={`${kind.type}-${index}`} className="mt-2">
          {labelFor("topping", kind.type)}
        </p>
      ))}
      {spec.toppings.items.map((item, index) => (
        <button
          key={`${item.item}-${index}`}
          type="button"
          className="mt-2 block min-h-11 text-left"
          onClick={() => props.onSelect(`topping-item-${index}`)}
        >
          {item.count != null ? `${item.count} ` : ""}
          {item.item}, {item.arrangement}
        </button>
      ))}
      {spec.toppings.kinds.length === 0 && spec.toppings.items.length === 0 ? (
        <p className="spec-label">No toppings listed.</p>
      ) : null}
    </SpecEntry>
  );
}
