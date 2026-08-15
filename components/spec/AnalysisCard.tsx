"use client";

import type { CakeSpec } from "@/lib/taxonomy";
import {
  accentChoices,
  borderChoices,
  coatingChoices,
  finishChoices,
  toppingChoices,
} from "@/lib/taxonomy";
import { CategoryBlock } from "@/components/spec/CategoryBlock";
import { ChoiceChecks } from "@/components/spec/ChoiceChecks";
import { FineTuneFields } from "@/components/spec/FineTuneFields";
import {
  setCoatingStyle,
  setOtherNote,
  setSummary,
  toggleAccent,
  toggleBorder,
  toggleFinish,
  toggleToppingKind,
} from "@/lib/spec-toggles";

export function AnalysisCard(props: {
  spec: CakeSpec;
  onChange: (spec: CakeSpec) => void;
  onSelect: (id: string) => void;
}) {
  const spec = props.spec;

  return (
    <div className="flex flex-col gap-5">
      <FineTuneFields spec={spec} onChange={props.onChange} />
      <CategoryBlock
        category="coating"
        defaultOpen={spec.coating !== null}
        lowConfidence={spec.confidence.coating < 0.6 && spec.coating !== null}
        sentence={spec.summaries.coating}
        onSentenceChange={(value) => props.onChange(setSummary(spec, "coating", value))}
        onSelect={() => props.onSelect("coating")}
      >
        <ChoiceChecks
          name="coating"
          multiple={false}
          selected={spec.coating ? [spec.coating.style] : ["none"]}
          options={[
            { id: "none", label: "None listed" },
            ...coatingChoices.map((item) => ({ id: item.id, label: item.label })),
          ]}
          onToggle={(id, on) =>
            props.onChange(
              setCoatingStyle(
                spec,
                !on || id === "none" ? "" : (id as NonNullable<CakeSpec["coating"]>["style"]),
              ),
            )
          }
        />
      </CategoryBlock>
      <CategoryBlock
        category="borders"
        defaultOpen={spec.borders.length > 0}
        lowConfidence={spec.confidence.borders < 0.6 && spec.borders.length > 0}
        sentence={spec.summaries.borders}
        onSentenceChange={(value) => props.onChange(setSummary(spec, "borders", value))}
        onSelect={() => spec.borders[0] && props.onSelect("border-0")}
      >
        <ChoiceChecks
          name="borders"
          multiple
          selected={spec.borders.map((item) => item.type)}
          options={borderChoices.map((item) => ({
            id: item.id,
            label: item.label,
            tip: item.derivedTip,
          }))}
          onToggle={(id, on) =>
            props.onChange(toggleBorder(spec, id as CakeSpec["borders"][number]["type"], on))
          }
        />
      </CategoryBlock>
      <CategoryBlock
        category="accents"
        defaultOpen={spec.accents.length > 0}
        lowConfidence={spec.confidence.accents < 0.6 && spec.accents.length > 0}
        sentence={spec.summaries.accents}
        onSentenceChange={(value) => props.onChange(setSummary(spec, "accents", value))}
        onSelect={() => spec.accents[0] && props.onSelect("accent-0")}
      >
        <ChoiceChecks
          name="accents"
          multiple
          selected={spec.accents.map((item) => item.type)}
          options={accentChoices.map((item) => ({ id: item.id, label: item.label }))}
          onToggle={(id, on) =>
            props.onChange(toggleAccent(spec, id as CakeSpec["accents"][number]["type"], on))
          }
        />
      </CategoryBlock>
      <CategoryBlock
        category="finishes"
        defaultOpen={spec.finishes.length > 0}
        lowConfidence={spec.confidence.finishes < 0.6 && spec.finishes.length > 0}
        sentence={spec.summaries.finishes}
        onSentenceChange={(value) => props.onChange(setSummary(spec, "finishes", value))}
        onSelect={() => spec.finishes[0] && props.onSelect("finish-0")}
      >
        <ChoiceChecks
          name="finishes"
          multiple
          selected={spec.finishes.map((item) => item.type)}
          options={finishChoices.map((item) => ({ id: item.id, label: item.label }))}
          onToggle={(id, on) =>
            props.onChange(toggleFinish(spec, id as CakeSpec["finishes"][number]["type"], on))
          }
        />
      </CategoryBlock>
      <CategoryBlock
        category="toppings"
        defaultOpen={spec.toppings.kinds.length > 0 || spec.toppings.items.length > 0}
        lowConfidence={spec.confidence.toppings < 0.6 && spec.toppings.kinds.length > 0}
        sentence={spec.summaries.toppings}
        onSentenceChange={(value) => props.onChange(setSummary(spec, "toppings", value))}
        onSelect={() => {
          if (spec.toppings.items[0]) props.onSelect("topping-item-0");
          else if (spec.toppings.kinds[0]) props.onSelect("topping-kind-0");
        }}
      >
        <ChoiceChecks
          name="toppings"
          multiple
          selected={spec.toppings.kinds.map((item) => item.type)}
          options={toppingChoices.map((item) => ({ id: item.id, label: item.label }))}
          onToggle={(id, on) =>
            props.onChange(
              toggleToppingKind(spec, id as CakeSpec["toppings"]["kinds"][number]["type"], on),
            )
          }
        />
      </CategoryBlock>
      <CategoryBlock
        category="other"
        defaultOpen={spec.other.length > 0 || spec.summaries.other.trim().length > 0}
        sentence={spec.summaries.other}
        onSentenceChange={(value) => props.onChange(setOtherNote(spec, value))}
        onSelect={() => spec.other[0] && props.onSelect("other-0")}
      >
        {spec.other.length === 0 ? (
          <p className="spec-label">
            Anything the photo showed that isn&apos;t in the lists above.
          </p>
        ) : (
          <ul className="spec-value">
            {spec.other.map((item, index) => (
              <li key={`${item.description}-${index}`}>{item.description}</li>
            ))}
          </ul>
        )}
      </CategoryBlock>
    </div>
  );
}
