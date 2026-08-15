"use client";

import type { Match } from "@/lib/types";
import { CakePhoto } from "@/components/CakePhoto";
import { CapabilityDots } from "@/components/CapabilityDots";

export function DecoratorCard(props: {
  match: Match;
  selected: boolean;
  contacted: boolean;
  onToggle: () => void;
}) {
  const photos = props.match.decorator.portfolioImages.slice(0, 3);
  return (
    <article
      className="card p-4"
      style={props.selected ? { outline: "2px solid var(--ink)", outlineOffset: "2px" } : undefined}
    >
      <div className="mb-3 grid grid-cols-3 gap-1">
        {photos.map((photo) => (
          <CakePhoto
            key={photo.id}
            src={photo.url}
            alt=""
            className="h-20 w-full rounded-[var(--r-image)] object-cover"
          />
        ))}
      </div>
      <h3 className="font-display text-xl">{props.match.decorator.name}</h3>
      <p className="data text-[13px] text-slate">
        {props.match.decorator.rating ?? "—"} · {props.match.decorator.reviewCount ?? 0} reviews ·{" "}
        {props.match.distanceMiles.toFixed(1)} mi
      </p>
      <CapabilityDots match={props.match} />
      <p className="mt-2 italic">{props.match.reasoning}</p>
      {props.match.decorator.publishedPrice ? (
        <p className="mt-2 text-[13px] text-slate">{props.match.decorator.publishedPrice}</p>
      ) : null}
      <button type="button" className="btn mt-3 w-full" onClick={props.onToggle}>
        {props.contacted ? "Contacted" : props.selected ? "Selected" : "Select"}
      </button>
    </article>
  );
}
