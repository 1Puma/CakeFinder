import type { CakeSpec } from "../taxonomy";
import type { Decorator, MatchResult } from "../types";

export type CityIndexSnapshot = {
  city: string;
  lastCrawledAt: Date;
  decoratorCount: number;
};

export type Store = {
  getSpec(id: string): Promise<CakeSpec | null>;
  saveSpec(spec: CakeSpec): Promise<void>;
  listDecorators(city: string): Promise<Decorator[]>;
  saveDecorators(city: string, decorators: Decorator[]): Promise<void>;
  getCityIndex(city: string): Promise<CityIndexSnapshot | null>;
  touchCityIndex(city: string, count: number): Promise<void>;
  saveMatchResult(specId: string, result: MatchResult): Promise<void>;
  getMatchResult(specId: string): Promise<MatchResult | null>;
  isSuppressed(decoratorId: string): Promise<boolean>;
  suppress(decoratorId: string): Promise<void>;
  recordOutreach(input: {
    id: string;
    specId: string;
    decoratorId: string;
    toEmail: string;
    status: string;
  }): Promise<void>;
};
