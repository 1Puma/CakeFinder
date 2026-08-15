import type { CakeSpec } from "../taxonomy";
import { cakeSpecSchema } from "../taxonomy";
import type { Decorator, MatchResult } from "../types";
import { prisma } from "./prisma";
import type { CityIndexSnapshot, Store } from "./types";

function parseDecorator(json: string): Decorator {
  const row = JSON.parse(json) as Decorator;
  return { ...row, lastIndexedAt: new Date(row.lastIndexedAt) };
}

export const prismaStore: Store = {
  async getSpec(id) {
    const row = await prisma.cakeSpecRecord.findUnique({ where: { id } });
    if (!row) return null;
    return cakeSpecSchema.parse(JSON.parse(row.specJson));
  },
  async saveSpec(spec: CakeSpec) {
    const specJson = JSON.stringify(spec);
    await prisma.cakeSpecRecord.upsert({
      where: { id: spec.id },
      create: { id: spec.id, specJson },
      update: { specJson },
    });
  },
  async listDecorators(city) {
    const rows = await prisma.decoratorRecord.findMany({ where: { city } });
    return rows.map((row) => parseDecorator(row.decoratorJson));
  },
  async saveDecorators(city, decorators) {
    for (const decorator of decorators) {
      await prisma.decoratorRecord.upsert({
        where: { id: decorator.id },
        create: {
          id: decorator.id,
          city,
          decoratorJson: JSON.stringify(decorator),
          lastIndexedAt: decorator.lastIndexedAt,
        },
        update: {
          decoratorJson: JSON.stringify(decorator),
          lastIndexedAt: decorator.lastIndexedAt,
        },
      });
    }
  },
  async getCityIndex(city): Promise<CityIndexSnapshot | null> {
    const row = await prisma.cityIndex.findUnique({ where: { city } });
    if (!row) return null;
    return {
      city: row.city,
      lastCrawledAt: row.lastCrawledAt,
      decoratorCount: row.decoratorCount,
    };
  },
  async touchCityIndex(city, count) {
    await prisma.cityIndex.upsert({
      where: { city },
      create: { city, lastCrawledAt: new Date(), decoratorCount: count },
      update: { lastCrawledAt: new Date(), decoratorCount: count },
    });
  },
  async saveMatchResult(specId, result: MatchResult) {
    await prisma.matchCache.upsert({
      where: { specId },
      create: { specId, resultJson: JSON.stringify(result) },
      update: { resultJson: JSON.stringify(result) },
    });
  },
  async getMatchResult(specId) {
    const row = await prisma.matchCache.findUnique({ where: { specId } });
    if (!row) return null;
    return JSON.parse(row.resultJson) as MatchResult;
  },
  async isSuppressed(decoratorId) {
    const row = await prisma.suppression.findUnique({ where: { decoratorId } });
    return Boolean(row);
  },
  async suppress(decoratorId) {
    await prisma.suppression.upsert({
      where: { decoratorId },
      create: { decoratorId },
      update: {},
    });
  },
  async recordOutreach(input) {
    await prisma.outreachSend.create({ data: input });
  },
};
