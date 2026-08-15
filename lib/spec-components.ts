import type { CakeSpec, CategoryKey } from "./taxonomy";

export type SpecComponent = {
  id: string;
  category: CategoryKey;
  locator: string;
  visualDescription: string;
};

export function specComponents(spec: CakeSpec): SpecComponent[] {
  const items: SpecComponent[] = [];
  if (spec.coating) {
    items.push({
      id: "coating",
      category: "coating",
      locator: spec.coating.locator,
      visualDescription: spec.coating.visualDescription,
    });
  }
  spec.borders.forEach((border, index) => {
    items.push({
      id: `border-${index}`,
      category: "borders",
      locator: border.locator,
      visualDescription: border.visualDescription,
    });
  });
  spec.accents.forEach((accent, index) => {
    items.push({
      id: `accent-${index}`,
      category: "accents",
      locator: accent.locator,
      visualDescription: accent.visualDescription,
    });
  });
  spec.finishes.forEach((finish, index) => {
    items.push({
      id: `finish-${index}`,
      category: "finishes",
      locator: finish.locator,
      visualDescription: finish.visualDescription,
    });
  });
  spec.toppings.kinds.forEach((kind, index) => {
    items.push({
      id: `topping-kind-${index}`,
      category: "toppings",
      locator: kind.locator,
      visualDescription: kind.visualDescription,
    });
  });
  spec.toppings.items.forEach((item, index) => {
    items.push({
      id: `topping-item-${index}`,
      category: "toppings",
      locator: item.locator,
      visualDescription: item.visualDescription,
    });
  });
  spec.other.forEach((item, index) => {
    items.push({
      id: `other-${index}`,
      category: "toppings",
      locator: item.locator,
      visualDescription: item.description,
    });
  });
  return items;
}

export function findSpecComponent(spec: CakeSpec, id: string): SpecComponent | undefined {
  return specComponents(spec).find((item) => item.id === id);
}
