import { getEnv } from "../env";
import { err, ok, type Result } from "../result";
import type { RawDecorator } from "../types";
import type { DecoratorSource } from "./types";

type PlacesSearchResponse = {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    location?: { latitude?: number; longitude?: number };
    rating?: number;
    userRatingCount?: number;
    websiteUri?: string;
    nationalPhoneNumber?: string;
    photos?: Array<{ name?: string }>;
    googleMapsUri?: string;
  }>;
};

const QUERY_TEMPLATES = [
  "custom cakes {city}",
  "cake decorator {city}",
  "bakery {city}",
  "ice cream cake {city}",
];

async function textSearch(
  query: string,
  apiKey: string,
): Promise<
  Result<
    RawDecorator[],
    { kind: "http"; status: number; body: string } | { kind: "network"; message: string }
  >
> {
  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber,places.photos,places.googleMapsUri",
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: 20 }),
    });
    const body = await response.text();
    if (!response.ok) {
      console.error("places search failed", response.status, body);
      return err({ kind: "http", status: response.status, body });
    }
    const parsed = JSON.parse(body) as PlacesSearchResponse;
    const rows: RawDecorator[] = (parsed.places ?? []).map((place) => ({
      sourceId: "places",
      externalId: place.id ?? query,
      name: place.displayName?.text ?? "Unnamed bakery",
      address: place.formattedAddress ?? "",
      lat: place.location?.latitude ?? 0,
      lng: place.location?.longitude ?? 0,
      rating: place.rating ?? null,
      reviewCount: place.userRatingCount ?? null,
      website: place.websiteUri ?? null,
      email: null,
      phone: place.nationalPhoneNumber ?? null,
      isChain: false,
      photoRefs: (place.photos ?? [])
        .slice(0, 10)
        .map((p) => p.name ?? "")
        .filter(Boolean),
      url: place.googleMapsUri ?? null,
      publishedPrice: null,
    }));
    return ok(rows);
  } catch (error) {
    return err({
      kind: "network",
      message: error instanceof Error ? error.message : "places network error",
    });
  }
}

export const placesSource: DecoratorSource = {
  id: "places",
  displayName: "Google Places",
  attribution: "Data from Google Places",
  respectsRobots: true,
  async search(city: string) {
    const key = getEnv().GOOGLE_PLACES_API_KEY;
    if (!key) {
      return [];
    }
    const seen = new Map<string, RawDecorator>();
    for (const template of QUERY_TEMPLATES) {
      const result = await textSearch(template.replace("{city}", city), key);
      if (!result.ok) {
        continue;
      }
      for (const row of result.value) {
        seen.set(row.externalId, row);
      }
    }
    return [...seen.values()];
  },
};
