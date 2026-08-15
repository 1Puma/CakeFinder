"use client";

import type { ChangeDescription } from "@/lib/types";

export function ChangeDiff(props: {
  changes: ChangeDescription[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="border border-ink bg-icing p-3">
      <p className="mb-2 font-medium">Confirm these edits</p>
      <ul className="space-y-1">
        {props.changes.map((change) => (
          <li key={change.path} className="font-data text-[15px] tracking-[0.02em]">
            {change.summary}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-2">
        <button type="button" className="btn" onClick={props.onConfirm}>
          Apply
        </button>
        <button type="button" className="btn btn-quiet" onClick={props.onCancel}>
          Discard
        </button>
      </div>
    </div>
  );
}
