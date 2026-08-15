"use client";

import { borderTypes, nozzleFamilies } from "@/lib/taxonomy";
import { useState } from "react";

export function SpecimenGrid() {
  const [active, setActive] = useState<string | null>(borderTypes[0]?.id ?? null);
  const border = borderTypes.find((b) => b.id === active);
  const nozzle = nozzleFamilies.find((n) => n.id === active);

  return (
    <section className="border-t border-ink px-4 py-10 md:px-6">
      <h2 className="mb-2 font-display text-[34px]">What it reads</h2>
      <p className="mb-6 max-w-2xl text-slate">
        Border shape is classified first. Tip numbers are a lookup. Hover a specimen.
      </p>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <p className="data mb-3 text-[13px]">Borders</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {borderTypes.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`min-h-11 border border-ink px-3 text-left ${active === item.id ? "bg-sunflower" : "bg-icing"}`}
                onMouseEnter={() => setActive(item.id)}
                onFocus={() => setActive(item.id)}
              >
                <span className="data block text-[12px]">{item.id.replaceAll("_", " ")}</span>
                <span className="text-[13px]">TIP {item.tip}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="data mb-3 text-[13px]">Nozzle families</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {nozzleFamilies.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`min-h-11 border border-ink px-3 text-left ${active === item.id ? "bg-sunflower" : "bg-icing"}`}
                onMouseEnter={() => setActive(item.id)}
                onFocus={() => setActive(item.id)}
              >
                <span className="data block text-[12px]">{item.id.replaceAll("_", " ")}</span>
                <span className="text-[13px]">{item.tip}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-6 max-w-3xl border-l-[3px] border-sky bg-butter px-4 py-3">
        {border
          ? `${border.id.replaceAll("_", " ")} — ${border.visualSignature}. Derived tip ${border.tip}.`
          : null}
        {nozzle
          ? `${nozzle.id.replaceAll("_", " ")} — produces ${nozzle.produces.join(", ")}.`
          : null}
      </p>
    </section>
  );
}
