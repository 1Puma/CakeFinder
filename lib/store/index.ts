import { memoryStore } from "./memory";
import type { Store } from "./types";

export const store: Store = memoryStore;

export const getSpec: Store["getSpec"] = (...args) => store.getSpec(...args);
export const saveSpec: Store["saveSpec"] = (...args) => store.saveSpec(...args);
export const listDecorators: Store["listDecorators"] = (...args) => store.listDecorators(...args);
export const saveDecorators: Store["saveDecorators"] = (...args) => store.saveDecorators(...args);
export const getCityIndex: Store["getCityIndex"] = (...args) => store.getCityIndex(...args);
export const touchCityIndex: Store["touchCityIndex"] = (...args) => store.touchCityIndex(...args);
export const saveMatchResult: Store["saveMatchResult"] = (...args) =>
  store.saveMatchResult(...args);
export const getMatchResult: Store["getMatchResult"] = (...args) => store.getMatchResult(...args);
export const isSuppressed: Store["isSuppressed"] = (...args) => store.isSuppressed(...args);
export const recordOutreach: Store["recordOutreach"] = (...args) => store.recordOutreach(...args);
