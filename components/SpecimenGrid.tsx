"use client";

import { borderTypes, nozzleFamilies } from "@/lib/taxonomy";
import { BorderMark, NozzleMark } from "@/components/SpecimenMarks";
import { useState } from "react";

const featuredBorders = borderTypes.filter((item) =>
  ["straight", "wavy", "bead", "shell", "reverse_shell", "ruffle", "band"].includes(item.id),
);

export function SpecimenGrid() {
  const [active, setActive] = useState<string | null>(featuredBorders[0]?.id ?? null);
  const border = borderTypes.find((b) => b.id === active);
  const nozzle = nozzleFamilies.find((n) => n.id === active);

  return (
    <section className="border-t border-ink px-4 py-10 md:px-6">
      <h2 className="mb-2 font-display text-[34px]">What it reads</h2>
      <p className="mb-6 max-w-2xl text-slate">
        Border shape is classified first. Tip numbers are a lookup. Hover a specimen.
      </p>
      <div className="grid gap-8 desk:grid-cols-2">
        <div>
          <p className="data mb-3 text-[13px]">Borders</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {featuredBorders.map((item) => (
              <button
                key={item.id}
                type="button"
                className="spec-select min-h-11 px-3 py-2 text-left"
                onMouseEnter={() => setActive(item.id)}
                onFocus={() => setActive(item.id)}
              >
                <BorderMark id={item.id} active={active === item.id} />
                <span className="data mt-1 block text-[12px]">{item.id.replaceAll("_", " ")}</span>
                <span className="font-data text-[13px]">TIP {item.tip}</span>
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
                className="spec-select min-h-11 px-3 py-2 text-left"
                onMouseEnter={() => setActive(item.id)}
                onFocus={() => setActive(item.id)}
              >
                <NozzleMark id={item.id} active={active === item.id} />
                <span className="data mt-1 block text-[12px]">{item.id.replaceAll("_", " ")}</span>
                <span className="font-data text-[13px]">{item.tip}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <p
        className="mt-6 max-w-3xl bg-icing px-4 py-3 text-[15px]"
        style={{ borderLeft: "3px solid var(--gel-teal)" }}
      >
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
