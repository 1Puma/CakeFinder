import austinSeed from "../../data/seed/austin-decorators.json";
import type { CakeSpec } from "../taxonomy";
import { cakeSpecSchema } from "../taxonomy";
import type { Decorator, MatchResult } from "../types";
import type { CityIndexSnapshot, Store } from "./types";

type SeedDecorator = Omit<Decorator, "lastIndexedAt"> & { lastIndexedAt: string };

function loadSeed(): Decorator[] {
  return (austinSeed as SeedDecorator[]).map((row) => ({
    ...row,
    lastIndexedAt: new Date(row.lastIndexedAt),
  }));
}

function cityKey(city: string): string {
  return city.trim().toLowerCase();
}

export function createMemoryStore(): Store {
  const specs = new Map<string, CakeSpec>();
  const decoratorsByCity = new Map<string, Decorator[]>();
  const cityIndex = new Map<string, CityIndexSnapshot>();
  const matches = new Map<string, MatchResult>();
  const suppressed = new Set<string>();
  const outreach: Array<{
    id: string;
    specId: string;
    decoratorId: string;
    toEmail: string;
    status: string;
  }> = [];

  const austin = loadSeed();
  decoratorsByCity.set(cityKey("Austin, TX"), austin);
  cityIndex.set(cityKey("Austin, TX"), {
    city: "Austin, TX",
    lastCrawledAt: new Date("2026-08-01T00:00:00.000Z"),
    decoratorCount: austin.length,
  });

  return {
    async getSpec(id) {
      const spec = specs.get(id);
      return spec ?? null;
    },
    async saveSpec(spec) {
      specs.set(spec.id, cakeSpecSchema.parse(spec));
    },
    async listDecorators(city) {
      return decoratorsByCity.get(cityKey(city)) ?? [];
    },
    async saveDecorators(city, decorators) {
      decoratorsByCity.set(cityKey(city), decorators);
    },
    async getCityIndex(city) {
      return cityIndex.get(cityKey(city)) ?? null;
    },
    async touchCityIndex(city, count) {
      cityIndex.set(cityKey(city), {
        city,
        lastCrawledAt: new Date(),
        decoratorCount: count,
      });
    },
    async saveMatchResult(specId, result) {
      matches.set(specId, result);
    },
    async getMatchResult(specId) {
      return matches.get(specId) ?? null;
    },
    async isSuppressed(decoratorId) {
      return suppressed.has(decoratorId);
    },
    async suppress(decoratorId) {
      suppressed.add(decoratorId);
    },
    async recordOutreach(input) {
      outreach.push(input);
    },
  };
}

export const memoryStore = createMemoryStore();
