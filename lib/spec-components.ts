import type { CakeSpec, CategoryKey } from "./taxonomy";

export type SpecComponent = {
  id: string;
  category: CategoryKey;
  locator: string;
  visualDescription: string;
};

export function specComponents(spec: CakeSpec): SpecComponent[] {
  const items: SpecComponent[] = spec.structure.tiers.map((tier) => ({
    id: `tier-${tier.index}`,
    category: "structure",
    locator: tier.locator,
    visualDescription: tier.visualDescription,
  }));
  spec.piping.borders.forEach((border, index) => {
    items.push({
      id: `border-${index}`,
      category: "piping",
      locator: border.locator,
      visualDescription: border.visualDescription,
    });
  });
  spec.piping.surfaceElements.forEach((el, index) => {
    items.push({
      id: `surface-${index}`,
      category: "piping",
      locator: el.locator,
      visualDescription: el.visualDescription,
    });
  });
  if (spec.decor.ediblePrint) {
    items.push({
      id: "print",
      category: "decor",
      locator: spec.decor.ediblePrint.locator,
      visualDescription: spec.decor.ediblePrint.visualDescription,
    });
  }
  return items;
}

export function findSpecComponent(spec: CakeSpec, id: string): SpecComponent | undefined {
  return specComponents(spec).find((item) => item.id === id);
}
