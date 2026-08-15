import type { CakeSpec } from "@/lib/taxonomy";
import { cakeSpecSchema } from "@/lib/taxonomy";

const prefix = "cakematch:spec:";

export function persistSpec(spec: CakeSpec): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(prefix + spec.id, JSON.stringify(spec));
  sessionStorage.setItem("cakematch:last-spec-id", spec.id);
}

export function readPersistedSpec(id: string): CakeSpec | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(prefix + id);
  if (!raw) return null;
  try {
    return cakeSpecSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function persistMatchCity(city: string, radiusMiles: number): void {
  sessionStorage.setItem("cakematch:city", city);
  sessionStorage.setItem("cakematch:radius", String(radiusMiles));
}

export function readMatchCity(): { city: string; radiusMiles: number } {
  return {
    city: sessionStorage.getItem("cakematch:city") ?? "Austin, TX",
    radiusMiles: Number(sessionStorage.getItem("cakematch:radius") ?? "15"),
  };
}
