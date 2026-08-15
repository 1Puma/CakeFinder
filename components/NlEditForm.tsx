"use client";

import { useState } from "react";

export function NlEditForm(props: {
  disabled?: boolean;
  onSubmit: (instruction: string) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="sticky bottom-0 z-10 border-t border-ink bg-icing p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      onSubmit={(event) => {
        event.preventDefault();
        if (!value.trim()) return;
        setBusy(true);
        void props.onSubmit(value).finally(() => {
          setBusy(false);
          setValue("");
        });
      }}
    >
      <label className="flex gap-2">
        <span className="sr-only">Describe a change</span>
        <input
          className="min-h-11 flex-1 border border-ink bg-icing px-3"
          placeholder="make it two tiers, drop the gold leaf, change the border to shell"
          value={value}
          disabled={props.disabled || busy}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit" className="btn" disabled={props.disabled || busy}>
          {busy ? "Reading the edit…" : "Apply"}
        </button>
      </label>
    </form>
  );
}
