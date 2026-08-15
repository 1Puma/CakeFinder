"use client";

import type { CakeSpec, CategoryKey } from "@/lib/taxonomy";
import { StructureFields } from "@/components/spec/StructureFields";
import { FrostingFields } from "@/components/spec/FrostingFields";
import { CoatingFields } from "@/components/spec/CoatingFields";
import { BorderFields } from "@/components/spec/BorderFields";
import {
  AccentFields,
  FinishListFields,
  ToppingFields,
} from "@/components/spec/AccentToppingFields";
import { useState } from "react";

type AccordionKey =
  "structure" | "frosting" | "coating" | "borders" | "accents" | "finishes" | "toppings";

export function SpecEditor(props: {
  spec: CakeSpec;
  onChange: (spec: CakeSpec) => void;
  accordion: boolean;
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const firstLow =
    (Object.entries(props.spec.confidence) as Array<[CategoryKey | "structure", number]>).find(
      ([, value]) => value < 0.6,
    )?.[0] ?? "coating";
  const [openKey, setOpenKey] = useState<AccordionKey>(
    firstLow === "structure" ? "structure" : (firstLow as AccordionKey),
  );

  function open(key: AccordionKey) {
    if (props.accordion) setOpenKey(key);
  }

  return (
    <div className="flex flex-col gap-5">
      <StructureFields
        spec={props.spec}
        onChange={props.onChange}
        expanded={!props.accordion || openKey === "structure"}
        onHeaderClick={() => open("structure")}
      />
      <FrostingFields
        spec={props.spec}
        onChange={props.onChange}
        expanded={!props.accordion || openKey === "frosting"}
        onHeaderClick={() => open("frosting")}
      />
      <CoatingFields
        spec={props.spec}
        onChange={props.onChange}
        expanded={!props.accordion || openKey === "coating"}
        onHeaderClick={() => open("coating")}
        onSelect={props.onSelect}
      />
      <BorderFields
        spec={props.spec}
        onChange={props.onChange}
        expanded={!props.accordion || openKey === "borders"}
        onHeaderClick={() => open("borders")}
        activeId={props.activeId}
        onSelect={props.onSelect}
      />
      <AccentFields
        spec={props.spec}
        expanded={!props.accordion || openKey === "accents"}
        onHeaderClick={() => open("accents")}
        onSelect={props.onSelect}
      />
      <FinishListFields
        spec={props.spec}
        expanded={!props.accordion || openKey === "finishes"}
        onHeaderClick={() => open("finishes")}
        onSelect={props.onSelect}
      />
      <ToppingFields
        spec={props.spec}
        expanded={!props.accordion || openKey === "toppings"}
        onHeaderClick={() => open("toppings")}
        onSelect={props.onSelect}
      />
    </div>
  );
}
