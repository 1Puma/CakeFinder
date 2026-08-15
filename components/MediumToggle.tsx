"use client";

export function MediumToggle(props: {
  value: "layered" | "ice_cream";
  onChange: (value: "layered" | "ice_cream") => void;
}) {
  return (
    <div className="inline-flex border border-ink" role="group" aria-label="Cake medium">
      <button
        type="button"
        className={`min-h-11 px-3 ${props.value === "layered" ? "bg-ink text-icing" : "bg-icing text-ink"}`}
        aria-pressed={props.value === "layered"}
        onClick={() => props.onChange("layered")}
      >
        Layered cake
      </button>
      <button
        type="button"
        className={`min-h-11 border-l border-ink px-3 ${props.value === "ice_cream" ? "bg-ink text-icing" : "bg-icing text-ink"}`}
        aria-pressed={props.value === "ice_cream"}
        onClick={() => props.onChange("ice_cream")}
      >
        Ice cream cake
      </button>
    </div>
  );
}
