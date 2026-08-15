export function ChoiceChecks(props: {
  name: string;
  multiple: boolean;
  options: Array<{ id: string; label: string; tip?: string }>;
  selected: string[];
  onToggle: (id: string, on: boolean) => void;
}) {
  return (
    <div
      role={props.multiple ? "group" : "radiogroup"}
      aria-label={props.name}
      className="flex flex-col"
    >
      {props.options.map((option) => {
        const checked = props.selected.includes(option.id);
        return (
          <label key={option.id} className="flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type={props.multiple ? "checkbox" : "radio"}
              name={props.name}
              value={option.id}
              checked={checked}
              onChange={(event) => props.onToggle(option.id, event.target.checked)}
            />
            <span className="spec-value">{option.label}</span>
            {option.tip ? (
              <span className="font-data ml-auto text-[13px] tracking-[0.02em] text-ink-soft">
                TIP {option.tip}
              </span>
            ) : null}
          </label>
        );
      })}
    </div>
  );
}
