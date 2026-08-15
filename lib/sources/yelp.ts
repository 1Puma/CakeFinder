import { getEnv } from "../env";
import { err, ok, type Result } from "../result";
import type { RawDecorator } from "../types";
import type { DecoratorSource } from "./types";

type YelpSearchResponse = {
  businesses?: Array<{
    id?: string;
    name?: string;
    rating?: number;
    review_count?: number;
    url?: string;
    phone?: string;
    coordinates?: { latitude?: number; longitude?: number };
    location?: { display_address?: string[] };
    image_url?: string;
    is_closed?: boolean;
    price?: string;
  }>;
};

async function yelpSearch(
  city: string,
  apiKey: string,
): Promise<Result<RawDecorator[], { kind: "http" | "network"; message: string }>> {
  try {
    const url = new URL("https://api.yelp.com/v3/businesses/search");
    url.searchParams.set("term", "custom cakes");
    url.searchParams.set("location", city);
    url.searchParams.set("categories", "bakeries,customcakes");
    url.searchParams.set("limit", "20");
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const body = await response.text();
    if (!response.ok) {
      console.error("yelp search failed", response.status, body);
      return err({ kind: "http", message: body });
    }
    const parsed = JSON.parse(body) as YelpSearchResponse;
    const rows: RawDecorator[] = (parsed.businesses ?? []).map((biz) => ({
      sourceId: "yelp",
      externalId: biz.id ?? biz.name ?? "yelp",
      name: biz.name ?? "Unnamed bakery",
      address: biz.location?.display_address?.join(", ") ?? "",
      lat: biz.coordinates?.latitude ?? 0,
      lng: biz.coordinates?.longitude ?? 0,
      rating: biz.rating ?? null,
      reviewCount: biz.review_count ?? null,
      website: biz.url ?? null,
      email: null,
      phone: biz.phone ?? null,
      isChain: false,
      photoRefs: biz.image_url ? [biz.image_url] : [],
      url: biz.url ?? null,
      publishedPrice: biz.price ? `${biz.price} on Yelp (published, confirm with decorator)` : null,
    }));
    return ok(rows);
  } catch (error) {
    return err({
      kind: "network",
      message: error instanceof Error ? error.message : "yelp network error",
    });
  }
}

export const yelpSource: DecoratorSource = {
  id: "yelp",
  displayName: "Yelp Fusion",
  attribution: "Yelp",
  respectsRobots: true,
  async search(city: string) {
    const key = getEnv().YELP_API_KEY;
    if (!key) {
      return [];
    }
    const result = await yelpSearch(city, key);
    if (!result.ok) {
      return [];
    }
    return result.value;
  },
};
