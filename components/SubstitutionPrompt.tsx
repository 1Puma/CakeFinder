"use client";

import type { Substitution } from "@/lib/types";

export function SubstitutionPrompt(props: {
  substitution: Substitution;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <aside
      className="border border-ink bg-icing px-4 py-3"
      style={{ borderLeft: "3px solid var(--amber-flag)" }}
    >
      <p className="data text-[13px] text-flag line-through">{props.substitution.blockedFlag}</p>
      <p className="mt-1">{props.substitution.proposal}</p>
      <p className="mt-1 text-[13px] text-slate">{props.substitution.specPatchSummary}</p>
      <div className="mt-3 flex gap-2">
        <button type="button" className="btn" onClick={props.onAccept}>
          Accept
        </button>
        <button type="button" className="btn btn-quiet" onClick={props.onDecline}>
          Keep looking
        </button>
      </div>
    </aside>
  );
}
