import type { DecoratorSource } from "./types";

export const instagramSource: DecoratorSource = {
  id: "instagram",
  displayName: "Instagram (opt-in)",
  attribution: "Instagram, connected accounts only",
  respectsRobots: true,
  async search() {
    return [];
  },
};
