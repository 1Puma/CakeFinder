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
      className="fixed inset-x-0 bottom-0 z-20 border-t border-hairline bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:static"
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
          className="spec-select min-h-11 flex-1 px-3 text-[15px]"
          placeholder="describe a change"
          value={value}
          disabled={props.disabled || busy}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit" className="btn" disabled={props.disabled || busy}>
          {busy ? "Applying…" : "Apply"}
        </button>
      </label>
    </form>
  );
}
