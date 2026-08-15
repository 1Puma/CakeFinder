import { haversineMiles } from "../geo";
import type { RawDecorator } from "../types";

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function phonesMatch(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  const digits = (s: string) => s.replace(/\D/g, "").slice(-10);
  return digits(a).length === 10 && digits(a) === digits(b);
}

export function dedupeDecorators(rows: RawDecorator[]): RawDecorator[] {
  const kept: RawDecorator[] = [];
  for (const row of rows) {
    const twin = kept.find((existing) => {
      if (phonesMatch(existing.phone, row.phone)) return true;
      const close = haversineMiles(existing, row) * 1609.34 <= 50;
      return close && normalizeName(existing.name) === normalizeName(row.name);
    });
    if (!twin) {
      kept.push(row);
    }
  }
  return kept;
}
