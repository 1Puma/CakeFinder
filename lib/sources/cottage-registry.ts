import type { DecoratorSource } from "./types";

export const cottageRegistrySource: DecoratorSource = {
  id: "cottage-registry",
  displayName: "Cottage food registry",
  attribution: "State cottage food registry",
  respectsRobots: true,
  async search(city: string) {
    // SPEC-GAP: Texas registration is optional; no public bulk download confirmed.
    // Adapter is registered so a mandatory-registration state can be added later.
    if (city.toLowerCase().includes("austin") || city.toLowerCase().includes("tx")) {
      return [];
    }
    return [];
  },
};
