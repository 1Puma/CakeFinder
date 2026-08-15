"use client";

import type { CakeSpec } from "@/lib/taxonomy";
import { CakePhoto } from "@/components/CakePhoto";
import { findSpecComponent } from "@/lib/spec-components";

export function ExplodedView(props: { spec: CakeSpec; activeId: string | null }) {
  const active = props.activeId ? findSpecComponent(props.spec, props.activeId) : null;
  return (
    <div className="min-[1120px]:sticky min-[1120px]:top-0">
      <div className="overflow-hidden rounded-[var(--radius-image)] bg-icing">
        <CakePhoto
          src={props.spec.sourceImageUrl}
          alt="Cake being specified"
          className="mx-auto block h-auto max-h-[70vh] w-full object-contain"
        />
      </div>
      <div className="mt-3 border-t border-ink py-3">
        {active ? (
          <>
            <p className="font-data text-[13px] tracking-[0.02em] text-slate">{active.locator}</p>
            <p className="mt-1 text-[15px] text-ink">{active.visualDescription}</p>
          </>
        ) : (
          <p className="text-[15px] text-slate">Select a component to see where it sits.</p>
        )}
      </div>
    </div>
  );
}
