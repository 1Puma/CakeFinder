import { cottageRegistrySource } from "./cottage-registry";
import { instagramSource } from "./instagram";
import { placesSource } from "./places";
import type { DecoratorSource } from "./types";
import { yelpSource } from "./yelp";

export const sources: DecoratorSource[] = [
  placesSource,
  yelpSource,
  cottageRegistrySource,
  instagramSource,
];

export type { DecoratorSource } from "./types";
