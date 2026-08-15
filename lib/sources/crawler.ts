import { getEnv } from "../env";
import { sources } from "./index";
import { dedupeDecorators } from "./dedupe";
import { getCityIndex, listDecorators, saveDecorators, touchCityIndex } from "../store/index";
import type { Decorator, RawDecorator } from "../types";

function rawToDecorator(row: RawDecorator, city: string): Decorator {
  return {
    id: `${row.sourceId}:${row.externalId}`,
    name: row.name,
    sources: [
      {
        sourceId: row.sourceId,
        externalId: row.externalId,
        url: row.url,
      },
    ],
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    rating: row.rating,
    reviewCount: row.reviewCount,
    portfolioImages: row.photoRefs.slice(0, 10).map((ref, index) => ({
      id: `${row.externalId}-${index}`,
      url: ref.startsWith("http") ? ref : `/api/places-photo?ref=${encodeURIComponent(ref)}`,
      attribution:
        row.sourceId === "places" ? "Google Places" : row.sourceId === "yelp" ? "Yelp" : null,
      width: null,
      height: null,
    })),
    capabilities: [],
    hasLicensedPrintProgram: row.isChain ? true : null,
    isChain: row.isChain,
    claimedByUser: false,
    lastIndexedAt: new Date(),
    city,
    email: row.email,
    website: row.website,
    publishedPrice: row.publishedPrice,
    phone: row.phone,
  };
}

export async function crawlCity(city: string, radiusMiles: number): Promise<Decorator[]> {
  const existing = await listDecorators(city);
  const index = await getCityIndex(city);
  const ttlMs = getEnv().INDEX_TTL_DAYS * 24 * 60 * 60 * 1000;
  if (index && Date.now() - index.lastCrawledAt.getTime() < ttlMs && existing.length > 0) {
    return existing;
  }

  const batches = await Promise.all(sources.map((source) => source.search(city, radiusMiles)));
  const raw = dedupeDecorators(batches.flat());
  const crawled = raw.map((row) => rawToDecorator(row, city));
  const byId = new Map(existing.map((d) => [d.id, d]));
  for (const row of crawled) {
    const prior = byId.get(row.id);
    if (prior) {
      byId.set(row.id, {
        ...prior,
        ...row,
        capabilities: prior.capabilities.length > 0 ? prior.capabilities : row.capabilities,
        portfolioImages:
          prior.portfolioImages.length > 0 ? prior.portfolioImages : row.portfolioImages,
      });
    } else {
      byId.set(row.id, row);
    }
  }
  const merged = [...byId.values()];
  await saveDecorators(city, merged);
  await touchCityIndex(city, merged.length);
  return merged;
}
