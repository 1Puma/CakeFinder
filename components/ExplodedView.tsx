"use client";

import { categoryColor } from "@/lib/category-color";
import type { CakeSpec, CategoryKey, Region } from "@/lib/taxonomy";
import { CakePhoto } from "@/components/CakePhoto";

type Layer = { id: string; category: CategoryKey; region: Region; label: string };

function layersFromSpec(spec: CakeSpec): Layer[] {
  const layers: Layer[] = [];
  for (const tier of spec.structure.tiers) {
    if (tier.region) {
      layers.push({
        id: `tier-${tier.index}`,
        category: "structure",
        region: tier.region,
        label: `Tier ${tier.index + 1}`,
      });
    }
  }
  spec.piping.borders.forEach((border, index) => {
    if (border.region) {
      layers.push({
        id: `border-${index}`,
        category: "piping",
        region: border.region,
        label: `${border.type.replaceAll("_", " ")} · TIP ${border.derivedTip}`,
      });
    }
  });
  spec.piping.surfaceElements.forEach((el, index) => {
    if (el.region) {
      layers.push({
        id: `surface-${index}`,
        category: "piping",
        region: el.region,
        label: el.kind.replaceAll("_", " "),
      });
    }
  });
  if (spec.decor.ediblePrint?.region) {
    layers.push({
      id: "print",
      category: "decor",
      region: spec.decor.ediblePrint.region,
      label: "Edible print",
    });
  }
  return layers;
}

export function ExplodedView(props: {
  spec: CakeSpec;
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const layers = layersFromSpec(props.spec);
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-image)] border border-ink bg-butter">
      <CakePhoto
        src={props.spec.sourceImageUrl}
        alt="Cake being specified"
        className="block h-auto w-full"
      />
      {layers.map((layer, index) => (
        <button
          key={layer.id}
          type="button"
          aria-label={layer.label}
          className="absolute border-2"
          style={{
            left: `${layer.region.x * 100}%`,
            top: `${layer.region.y * 100}%`,
            width: `${layer.region.w * 100}%`,
            height: `${layer.region.h * 100}%`,
            borderColor: categoryColor[layer.category],
            transform: `translateY(${(layers.length - index) * -10}px)`,
            boxShadow: "var(--shadow-explode)",
            background: props.activeId === layer.id ? "rgb(255 255 255 / 0.2)" : "transparent",
            transition: "transform var(--motion-explode), background var(--motion-state)",
          }}
          onClick={() => props.onSelect(layer.id)}
        />
      ))}
    </div>
  );
}
