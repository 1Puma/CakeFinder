import { z } from "zod";

const envSchema = z.object({
  GROK_API_KEY: z.string().optional().default(""),
  GROK_MODEL: z.string().optional().default("grok-4.6"),
  GROK_BASE_URL: z.string().optional().default("https://api.x.ai/v1"),
  GOOGLE_PLACES_API_KEY: z.string().optional().default(""),
  YELP_API_KEY: z.string().optional().default(""),
  RESEND_API_KEY: z.string().optional().default(""),
  OUTREACH_FROM_ADDRESS: z.string().optional().default("inquiries@cakematch.local"),
  OUTREACH_TO_OVERRIDE: z.string().optional().default(""),
  DATABASE_URL: z.string().optional().default("file:./dev.db"),
  DEFAULT_CITY: z.string().optional().default("Austin, TX"),
  DEFAULT_RADIUS_MILES: z.coerce.number().optional().default(15),
  MAX_RADIUS_MILES: z.coerce.number().optional().default(40),
  INDEX_TTL_DAYS: z.coerce.number().optional().default(14),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

export function resetEnvCache(): void {
  cached = null;
}

export function getEnv(): AppEnv {
  if (cached) {
    return cached;
  }
  cached = envSchema.parse({
    GROK_API_KEY: process.env.GROK_API_KEY,
    GROK_MODEL: process.env.GROK_MODEL,
    GROK_BASE_URL: process.env.GROK_BASE_URL,
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
    YELP_API_KEY: process.env.YELP_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    OUTREACH_FROM_ADDRESS: process.env.OUTREACH_FROM_ADDRESS,
    OUTREACH_TO_OVERRIDE: process.env.OUTREACH_TO_OVERRIDE,
    DATABASE_URL: process.env.DATABASE_URL,
    DEFAULT_CITY: process.env.DEFAULT_CITY,
    DEFAULT_RADIUS_MILES: process.env.DEFAULT_RADIUS_MILES,
    MAX_RADIUS_MILES: process.env.MAX_RADIUS_MILES,
    INDEX_TTL_DAYS: process.env.INDEX_TTL_DAYS,
  });
  return cached;
}

export function hasGrokKey(): boolean {
  return getEnv().GROK_API_KEY.length > 0;
}
