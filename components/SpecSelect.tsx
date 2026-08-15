"use client";

import { useEffect, useId, useRef, useState } from "react";

export function SpecSelect(props: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  "aria-label": string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = props.options.find((option) => option.value === props.value);

  useEffect(() => {
    if (!open) return;
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        aria-label={props["aria-label"]}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className="spec-select min-h-11 w-full px-2 text-left text-[15px] text-ink"
        onClick={() => setOpen((v) => !v)}
      >
        {selected?.label ?? props.value}
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="spec-select absolute z-20 mt-1 max-h-56 w-full overflow-auto"
        >
          {props.options.map((option) => (
            <li key={option.value} role="option" aria-selected={option.value === props.value}>
              <button
                type="button"
                className="min-h-11 w-full px-2 text-left text-[15px] text-ink"
                onClick={() => {
                  props.onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
