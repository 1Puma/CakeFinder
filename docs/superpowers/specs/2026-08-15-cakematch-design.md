# CakeMatch design

**Date:** 2026-08-15  
**Product:** CakeMatch  
**Source of truth for domain and contracts:** `/cake-app-build-spec.md`  
**How to build:** `/AGENTS.md`

## What it is

Upload a photo of a cake. CakeMatch decomposes it into a structured, buildable specification, lets you edit that spec, then finds local decorators whose portfolio work demonstrates they can build it — and emails them on your behalf.

Two surfaces, one engine:

- Customer: photo → spec + ranked decorators + outreach
- Bakery intake: bakery customers upload a photo; the bakery receives a structured order spec

The product is a translator, not a generator. It does not invent a cake image. It specifies an existing one.

## Deltas from the build spec

These are the only product-level changes from `cake-app-build-spec.md`. Everything else in that document still applies.

1. **Name.** Working name `crumb` is replaced by **CakeMatch** in UI, email footer, and metadata.
2. **Palette.** Spec §13.2 gel-violet tokens are replaced by the owner palette, still bound to spec categories:

   | Token          | Hex       | Role                                      |
   | -------------- | --------- | ----------------------------------------- |
   | `--sunflower`  | `#fdce40` | Frosting category, primary fill, CTA      |
   | `--icing`      | `#fff2cc` | Page surface                              |
   | `--butter`     | `#ffe599` | Raised panels                             |
   | `--rose`       | `#ef89bb` | Piping category                           |
   | `--sky`        | `#6fa8dc` | Structure category                        |
   | `--ink`        | `#1f2d3d` | Text (darkened from `--sky` for contrast) |
   | `--gel-decor`  | `#c45a94` | Decor category (rose, darkened)           |
   | `--gel-finish` | `#3a6ea3` | Finish category (sky, darkened)           |

   Derived ink/decor/finish exist only so category color remains readable on `--icing`. Brand surfaces use the five given colors unchanged.

3. **Host.** Production target is Vercel. SQLite is local-only. Prisma schema is Postgres-shaped; when `DATABASE_URL` is unset, a seed-backed store (Austin JSON + in-memory writes) keeps the demo runnable on serverless. Outreach never sends to real bakeries unless `OUTREACH_TO_OVERRIDE` is unset on purpose.
4. **Demo without keys.** Missing `GROK_API_KEY` / Places / Yelp / Resend must not blank the product. Decomposition falls back to fixture specs the user can edit. Matching uses `/data/seed/austin-decorators.json`. Copy states what is missing and what to do.

## Architecture

```
photo → sharp resize → Grok 4.6 vision (JSON) → Zod CakeSpec
      → medium constraints → persist
      → spec UI (direct + JSON Patch NL edit)
      → match agent (plan → search index → evaluate portfolio → replan → rank)
      → SSE trace + ranked cards
      → outreach (Resend, customer is reply-to)
```

Index is cache-on-demand. Austin is pre-seeded. Sources register behind `DecoratorSource`. Texas cottage registry is a stub. Instagram is opt-in only.

## Stack

Next.js App Router, TypeScript strict (`noUncheckedIndexedAccess`), Tailwind + `/styles/tokens.css`, Zod at every LLM/API boundary, Prisma, Grok 4.6 via `https://api.x.ai/v1` (`env.GROK_MODEL`, default `grok-4.6`), Google Places (New), Yelp Fusion, Resend, sharp.

## Testing

- `npm run taxonomy:validate` — JSON taxonomy + generated Zod agree
- Grok client round-trip unit test with a mocked fetch
- Playwright demo flow (§16) against fixture mode (no live keys required)

## Out of scope for this build

National pre-crawl, price estimation, Instagram scraping, Facebook/Thumbtack/Nextdoor, fabricated agent traces.
