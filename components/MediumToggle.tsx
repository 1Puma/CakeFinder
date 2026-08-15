"use client";

export function MediumToggle(props: {
  value: "layered" | "ice_cream";
  onChange: (value: "layered" | "ice_cream") => void;
}) {
  return (
    <div className="inline-flex border border-hairline" role="group" aria-label="Cake medium">
      <button
        type="button"
        className={`min-h-11 px-3 ${props.value === "layered" ? "bg-ink text-card" : "bg-card text-ink"}`}
        aria-pressed={props.value === "layered"}
        onClick={() => props.onChange("layered")}
      >
        Layered cake
      </button>
      <button
        type="button"
        className={`min-h-11 border-l border-hairline px-3 ${props.value === "ice_cream" ? "bg-ink text-card" : "bg-card text-ink"}`}
        aria-pressed={props.value === "ice_cream"}
        onClick={() => props.onChange("ice_cream")}
      >
        Ice cream cake
      </button>
    </div>
  );
}
