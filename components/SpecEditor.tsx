"use client";

import { categoryKeys, type CakeSpec, type CategoryKey } from "@/lib/taxonomy";
import { StructureFields } from "@/components/spec/StructureFields";
import { FrostingFields } from "@/components/spec/FrostingFields";
import { PipingFields } from "@/components/spec/PipingFields";
import { DecorFields, FinishFields } from "@/components/spec/DecorFinishFields";

const sections: Array<{ key: CategoryKey; title: string }> = [
  { key: "structure", title: "Structure" },
  { key: "frosting", title: "Frosting" },
  { key: "piping", title: "Piping" },
  { key: "decor", title: "Decor" },
  { key: "finish", title: "Finish" },
];

function SectionBody(props: {
  category: CategoryKey;
  spec: CakeSpec;
  onChange: (spec: CakeSpec) => void;
}) {
  switch (props.category) {
    case "structure":
      return <StructureFields spec={props.spec} onChange={props.onChange} />;
    case "frosting":
      return <FrostingFields spec={props.spec} onChange={props.onChange} />;
    case "piping":
      return <PipingFields spec={props.spec} onChange={props.onChange} />;
    case "decor":
      return <DecorFields spec={props.spec} />;
    case "finish":
      return <FinishFields spec={props.spec} onChange={props.onChange} />;
    default: {
      const _never: never = props.category;
      return _never;
    }
  }
}

export function SpecEditor(props: {
  spec: CakeSpec;
  onChange: (spec: CakeSpec) => void;
  accordion: boolean;
}) {
  const firstLow = categoryKeys.find((key) => props.spec.confidence[key] < 0.6) ?? "structure";

  return (
    <div className="flex flex-col gap-3">
      {sections.map((section) => (
        <details
          key={section.key}
          open={!props.accordion || firstLow === section.key}
          className="border border-ink bg-icing"
        >
          <summary className="min-h-11 cursor-pointer px-3 py-2 font-medium">
            {section.title}
          </summary>
          <SectionBody category={section.key} spec={props.spec} onChange={props.onChange} />
        </details>
      ))}
    </div>
  );
}
