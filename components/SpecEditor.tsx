"use client";

import { categoryKeys, type CakeSpec, type CategoryKey } from "@/lib/taxonomy";
import { StructureFields } from "@/components/spec/StructureFields";
import { FrostingFields } from "@/components/spec/FrostingFields";
import { PipingFields } from "@/components/spec/PipingFields";
import { DecorFields, FinishFields } from "@/components/spec/DecorFinishFields";
import { useState } from "react";

const sections: Array<{ key: CategoryKey; title: string }> = [
  { key: "structure", title: "Structure" },
  { key: "frosting", title: "Frosting" },
  { key: "piping", title: "Piping" },
  { key: "decor", title: "Decor" },
  { key: "finish", title: "Finish" },
];

export function SpecEditor(props: {
  spec: CakeSpec;
  onChange: (spec: CakeSpec) => void;
  accordion: boolean;
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const firstLow = categoryKeys.find((key) => props.spec.confidence[key] < 0.6) ?? "structure";
  const [openKey, setOpenKey] = useState<CategoryKey>(firstLow);

  return (
    <div className="flex flex-col gap-3">
      {sections.map((section) => {
        const expanded = props.accordion ? openKey === section.key : true;
        const shared = {
          spec: props.spec,
          expanded,
          onHeaderClick: () => {
            if (props.accordion) setOpenKey(section.key);
          },
        };
        switch (section.key) {
          case "structure":
            return (
              <StructureFields
                key={section.key}
                {...shared}
                onChange={props.onChange}
                activeId={props.activeId}
                onSelect={props.onSelect}
              />
            );
          case "frosting":
            return <FrostingFields key={section.key} {...shared} onChange={props.onChange} />;
          case "piping":
            return (
              <PipingFields
                key={section.key}
                {...shared}
                onChange={props.onChange}
                activeId={props.activeId}
                onSelect={props.onSelect}
              />
            );
          case "decor":
            return <DecorFields key={section.key} {...shared} onSelect={props.onSelect} />;
          case "finish":
            return <FinishFields key={section.key} {...shared} onChange={props.onChange} />;
          default: {
            const _never: never = section.key;
            return _never;
          }
        }
      })}
    </div>
  );
}
