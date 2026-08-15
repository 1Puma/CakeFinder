# BUILD SPEC — Cake Decomposition & Decorator Matching

**Working name:** `crumb`
**Audience for this document:** an AI coding agent (Grok 4.6) building the application, plus the human owner editing and extending it.

---

## 0. How to use this document

### If you are the coding agent

Read sections 1–5 fully before writing any code. They define the domain model everything else depends on.

Build in the order given in §14. Each module has a **Contract** block defining its inputs and outputs. Honor the contracts exactly — downstream modules depend on them. If you must change a contract, update this document in the same commit.

Rules:

- TypeScript strict mode. No `any` outside third-party shims.
- Every LLM boundary is validated with Zod. Never trust model output shape.
- Every external API call is wrapped, typed, and cached.
- Taxonomy lives in **data files**, never inline in prompts or components. §4 explains why.
- If a requirement here is ambiguous, implement the simplest correct version and add a `// SPEC-GAP:` comment naming the ambiguity. Do not invent product behavior silently.
- Prompts live in `/prompts/*.ts` as exported template functions. Never inline a prompt string in a route handler.

### If you are the human owner

The places you will edit most:

| To change                       | Edit                               |
| ------------------------------- | ---------------------------------- |
| What the vision model looks for | `/data/taxonomy/*.json` — see §4.6 |
| How the agent reasons           | `/prompts/*.ts`                    |
| Where decorators come from      | `/lib/sources/*.ts` — see §8.6     |
| Look and feel                   | `/styles/tokens.css` — see §13     |
| Email wording                   | `/templates/outreach.tsx`          |

The taxonomy files are the highest-leverage thing in the repo. Adding a new border type or nozzle family is a JSON edit, not a code change.

---

## 1. Product summary

Upload a photo of a cake. The system decomposes it into a structured, buildable specification, lets you edit that spec, then finds local decorators whose demonstrated portfolio work proves they can build it — and emails them on your behalf.

Two surfaces, one engine:

- **Customer surface** — photo in, spec + ranked decorators + outreach out
- **Bakery intake surface** — a bakery's own customers upload a photo, the bakery receives a structured order spec instead of a screenshot and a guess

### Core insight the product rests on

Every AI cake tool today is a **generator**: prompt in, pretty image out, "show this to your baker." They produce more unbuildable pictures. Nothing converts an image into a _specification_. That translation is the product.

### Second insight, from the piping charts

Do not ask a vision model "what piping tip made this?" Three distinct borders come from a single #10 round tip. Tip identification is unreliable and unnecessary.

Ask instead: **"what shape is this border?"** Morphology is visually distinct and classifies with high confidence. The tip is then a table lookup. This inverts the weakest part of the design into one of the strongest, and it is the reason the taxonomy is structured the way it is in §4.

---

## 2. Stack

| Layer          | Choice                                                   | Notes                                             |
| -------------- | -------------------------------------------------------- | ------------------------------------------------- |
| Framework      | Next.js 15, App Router                                   | Server actions for agent orchestration            |
| Language       | TypeScript, strict                                       |                                                   |
| Styling        | Tailwind CSS + CSS custom properties                     | Tokens in `:root`, Tailwind reads them            |
| Validation     | Zod                                                      | Every LLM and API boundary                        |
| Database       | SQLite via Prisma (dev) → Postgres (prod)                | Same Prisma schema, swap the provider             |
| LLM            | Grok 4.6 via xAI API                                     | OpenAI-compatible endpoint, `https://api.x.ai/v1` |
| Vision         | Grok 4.6 multimodal                                      | Same client                                       |
| Places         | Google Places API (New)                                  | Text Search + Place Details + Photos              |
| Reviews        | Yelp Fusion API                                          | Secondary source                                  |
| Email          | Resend                                                   | Verified sender domain required                   |
| Image handling | `sharp` server-side                                      | Resize before sending to vision                   |
| State          | React Server Components + `useOptimistic` for spec edits |                                                   |

**Model identifier:** put the Grok model string in `env.GROK_MODEL`, do not hardcode it. Confirm the current identifier from xAI's docs at build time — model strings change and a wrong constant buried in a client is a bad failure mode.

---

## 3. Repository structure

```
/app
  /page.tsx                    Customer surface — upload
  /spec/[id]/page.tsx          Spec review + edit
  /matches/[id]/page.tsx       Ranked decorators
  /intake/[bakeryId]/page.tsx  Bakery intake surface
  /api
    /decompose/route.ts
    /spec-edit/route.ts
    /match/route.ts            Streams agent trace via SSE
    /outreach/route.ts
/lib
  /grok.ts                     Client wrapper, retry, JSON-mode helper
  /sources
    /places.ts
    /yelp.ts
    /cottage-registry.ts
    /instagram.ts              Opt-in only
    /index.ts                  Source registry — see §8.6
  /agent
    /match-agent.ts            The orchestration loop
    /tools.ts                  Tool definitions
    /trace.ts                  Reasoning trace emitter
  /capability.ts               Spec → capability flags
  /ip.ts                       Licensed character handling
/data
  /taxonomy
    structure.json
    frosting.json
    borders.json
    nozzles.json
    decor.json
    finish.json
    techniques.json
    medium-constraints.json    Ice cream cake exclusions
  /seed
    austin-decorators.json     Pre-cached demo data
/prompts
  decompose.ts
  spec-edit.ts
  portfolio-eval.ts
  match-plan.ts
  substitution.ts
  outreach.ts
/components
  ExplodedView.tsx
  SpecPanel.tsx
  SpecEntry.tsx
  CapabilityDots.tsx
  AgentTrace.tsx
  DecoratorCard.tsx
  SubstitutionPrompt.tsx
  MediumToggle.tsx
/templates
  outreach.tsx
/styles
  tokens.css
/prisma
  schema.prisma
```

---

## 4. Domain model

### 4.1 The CakeSpec

The central object. Everything reads and writes this.

```ts
type CakeSpec = {
  id: string;
  medium: "layered" | "ice_cream";
  sourceImageUrl: string;
  structure: Structure;
  frosting: Frosting;
  piping: Piping;
  decor: Decor;
  finish: Finish;
  confidence: Record<CategoryKey, number>; // 0–1 per category
  flags: SpecFlag[];
  createdAt: Date;
  editedByUser: boolean;
};

type CategoryKey = "structure" | "frosting" | "piping" | "decor" | "finish";
```

### 4.2 Structure

```ts
type Structure = {
  tierCount: number;
  tiers: Tier[];
  estimatedServings: number | null;
  supportRequired: boolean; // derived: tierCount > 1 || sculpted
};

type Tier = {
  index: number; // 0 = bottom
  shape: "round" | "square" | "hexagon" | "sheet" | "sculpted" | "character_mold";
  approximateDiameterInches: number | null;
  approximateHeightInches: number | null;
};
```

### 4.3 Frosting

```ts
type Frosting = {
  primary: FrostingType;
  secondary: FrostingType | null; // e.g. fondant over buttercream
  colors: ColorRef[];
};

type FrostingType =
  | "buttercream_american"
  | "buttercream_swiss"
  | "buttercream_italian"
  | "pastry_pride" // whipped topping
  | "whipped_stabilized"
  | "fondant"
  | "ganache"
  | "cream_cheese"
  | "royal_icing";

type ColorRef = {
  hex: string;
  gelFamily: string; // mapped from hex, see /data/taxonomy/colors
  coverage: "primary" | "accent" | "detail";
};
```

### 4.4 Piping — the two-axis model

This is the part the charts define. **Two independent axes.** Do not collapse them.

**Axis 1 — Border morphology.** The edge work. Classify shape, derive tip.

```ts
type BorderType = "straight" | "wavy" | "bead" | "shell" | "reverse_shell" | "ruffle" | "band";
// extend in /data/taxonomy/borders.json: rope, zigzag, dot, scroll, drop_string

type Border = {
  type: BorderType;
  derivedTip: string; // lookup, not detected
  placement: "top_edge" | "base" | "tier_seam" | "vertical" | "other";
  repeatCount: number | null;
  colorRef: string;
};
```

Border → tip lookup table (`/data/taxonomy/borders.json`):

| Border        | Tip  | Family      | Visual signature                               |
| ------------- | ---- | ----------- | ---------------------------------------------- |
| straight      | #10  | round       | Smooth continuous tube, uniform diameter       |
| wavy          | #10  | round       | Same tube, sinusoidal path                     |
| bead          | #10  | round       | Repeating swelling spheres with pinch points   |
| shell         | #32  | open star   | Ridged fan, tapering tail, forward-facing      |
| reverse_shell | #22  | open star   | Ridged spiral, alternating curl direction      |
| ruffle        | #104 | petal       | Dense overlapping folds, thin-to-thick section |
| band          | #48  | basketweave | Flat wide strip, longitudinal striations       |

Three of seven share tip #10. This is exactly why morphology is the detected field and tip is the derived one.

**Axis 2 — Nozzle families.** Surface and floral work.

```ts
type NozzleFamily =
  | "round"
  | "open_star"
  | "closed_star"
  | "french_star"
  | "leaf"
  | "petal"
  | "basketweave"
  | "grass";

type SurfaceElement = {
  kind:
    | "rosette"
    | "drop_flower"
    | "swirl"
    | "sugar_floral"
    | "leaves"
    | "basketweave_panel"
    | "grass_texture"
    | "lettering"
    | "stringwork"
    | "cornelli";
  inferredNozzleFamily: NozzleFamily | null;
  ridgeCharacter: "fine" | "medium" | "bold" | null; // disambiguates star families
  count: number | null;
  colorRef: string;
};
```

Nozzle family reference (`/data/taxonomy/nozzles.json`):

| Family      | Tip      | Produces                                                     |
| ----------- | -------- | ------------------------------------------------------------ |
| round       | R1 / #10 | Writing, outlining, dots, beads                              |
| open_star   | 1M / #32 | Shells, rosettes, stars, borders                             |
| closed_star | 6B       | Large rosettes, swirls, drop flowers                         |
| french_star | 869      | Rosettes, cupcake swirls, ridged shell borders, drop flowers |
| leaf        | 352      | Leaves, petals, ruffles                                      |
| petal       | 104      | Petals, ruffles, flower designs                              |
| basketweave | 47 / #48 | Basketweave panels, flat bands, textured panels              |
| grass       | 233      | Grass, fur, textured accents                                 |

**Two overlaps that matter and must be encoded:**

1. Open star, closed star, and French star all make rosettes with different ridge counts and swirl density. Classify **rosette + ridgeCharacter**, never guess the exact tip.
2. Petal 104 appears in _both_ charts — it produces the ruffle border and flower petals. Its presence in a portfolio is evidence for **two** capability flags. `/data/taxonomy/nozzles.json` must express this as a one-to-many mapping.

```ts
type Piping = {
  borders: Border[];
  surfaceElements: SurfaceElement[];
};
```

### 4.5 Decor and Finish

```ts
type Decor = {
  ediblePrint: EdiblePrint | null;
  licensedCharacters: LicensedCharacter[];
  nonEdibleToppers: string[];
  sculptural: SculpturalElement[];
  freshFlorals: boolean;
};

type EdiblePrint = {
  approximateSizeInches: number | null;
  shape: "round" | "rectangular" | "custom_cut";
  subject: string; // free text description
};

type LicensedCharacter = {
  detectedName: string | null; // null if recognized as licensed but unidentified
  franchise: string | null;
  confidence: number;
  complianceStatus: "licensed_print_available" | "requires_substitution" | "unknown";
};

type SculpturalElement = {
  description: string;
  medium: "fondant" | "modeling_chocolate" | "gum_paste" | "rice_cereal_treat" | "unknown";
  approximateSizeInches: number | null;
};

type Finish = {
  metallicLeaf: "gold" | "silver" | "none";
  pearls: boolean;
  sprinkles: boolean;
  edibleGlitter: boolean;
  isomalt: boolean;
  waferPaper: boolean;
  airbrush: boolean;
  drip: boolean;
  marbling: boolean;
  texturedPaletteKnife: boolean;
};
```

Note: **no `ombre`** — deliberately excluded from the technique set.

### 4.6 Why taxonomy lives in JSON

Every enum above has a matching file in `/data/taxonomy/`. The vision prompt is **generated** from these files at request time, not hand-written.

Consequence: adding `rope` as a border type means adding one object to `borders.json`. The prompt updates, the Zod schema updates (generated from the same source), the UI picker updates. No code change, no prompt rewrite, no drift between what the prompt asks for and what the schema accepts.

Build this generation step early. It is the difference between a taxonomy you can grow and one that calcifies.

```ts
// /lib/taxonomy.ts
export function buildTaxonomyPromptSection(): string;
export function buildSpecZodSchema(): z.ZodType<CakeSpec>;
```

### 4.7 Medium constraints — ice cream cake

Ice cream cakes are **decor over a frozen brick**. Structure is fixed; decoration is the entire product. This is a first-class mode, not an edge case.

`/data/taxonomy/medium-constraints.json`:

```json
{
  "ice_cream": {
    "structureRestrictedTo": ["round", "sheet", "character_mold"],
    "maxTiers": 1,
    "frostingAllowed": ["pastry_pride", "whipped_stabilized", "buttercream_american"],
    "excludedFinish": ["metallicLeaf", "isomalt", "waferPaper"],
    "excludedDecor": ["freshFlorals"],
    "sculpturalAllowed": false,
    "rationale": "Frozen storage and serving temperature rule out these techniques."
  }
}
```

When `medium === 'ice_cream'`, the constraint filter runs after decomposition and before matching. Anything excluded is stripped from the spec and surfaced as an informational flag, not an error.

This filter is why the taxonomy above matters _more_ for ice cream cakes, not less: with structure and frosting collapsed to a small set, piping and edible print carry the entire design.

### 4.8 Capability flags

The bridge between a spec and a decorator.

```ts
type CapabilityFlag =
  | `frosting:${FrostingType}`
  | `border:${BorderType}`
  | `nozzle:${NozzleFamily}`
  | `surface:${SurfaceElement["kind"]}`
  | `decor:edible_print`
  | `decor:licensed_print`
  | `decor:sculptural`
  | `finish:${string}`
  | `structure:tiered`
  | `structure:sculpted`
  | `medium:ice_cream`;
```

```ts
// /lib/capability.ts
export function specToRequiredFlags(spec: CakeSpec): CapabilityFlag[];
export function rarityScore(flag: CapabilityFlag): number; // 0–1, drives search planning
```

**Rarity matters.** `frosting:buttercream_american` is near-universal and useless for narrowing. `finish:metallicLeaf` and `decor:licensed_print` are rare and should drive the search. The agent uses rarity to decide its strategy — see §9.3.

Seed rarity values in `/data/taxonomy/*.json` per entry; refine from observed index data later.

### 4.9 Decorator

```ts
type Decorator = {
  id: string;
  name: string;
  sources: SourceRef[]; // may be found in multiple places
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  reviewCount: number | null;
  portfolioImages: PortfolioImage[];
  capabilities: CapabilityEvidence[];
  hasLicensedPrintProgram: boolean | null;
  isChain: boolean;
  claimedByUser: boolean; // opted in and manages their own profile
  lastIndexedAt: Date;
};

type CapabilityEvidence = {
  flag: CapabilityFlag;
  confidence: number;
  evidenceImageIds: string[]; // which portfolio photos demonstrate it
  reasoning: string; // agent's one-line justification
};
```

`CapabilityEvidence` is deliberately not a boolean. The product's credibility rests on being able to say _why_ a decorator matched, and to show the photo that proves it.

---

## 5. Environment and configuration

```bash
GROK_API_KEY=
GROK_MODEL=                     # confirm current identifier from xAI docs
GROK_BASE_URL=https://api.x.ai/v1

GOOGLE_PLACES_API_KEY=
YELP_API_KEY=

RESEND_API_KEY=
OUTREACH_FROM_ADDRESS=          # must be on a verified domain
OUTREACH_REPLY_TO=              # the customer's address, set per-send

DATABASE_URL=file:./dev.db

DEFAULT_CITY=Austin, TX
DEFAULT_RADIUS_MILES=15
MAX_RADIUS_MILES=40
```

---

## 6. Module 1 — Vision decomposition

### Read this before writing any code

**Grok 4.6 is multimodal. There is no separate vision model.** Do not add CLIP, do not add a segmentation service, do not add a second provider. The image goes in the message content of the same call, through the same client in `/lib/grok.ts`, using the same API key.

```ts
messages: [
  {
    role: "user",
    content: [
      { type: "image_url", image_url: { url: `data:image/jpeg;base64,${b64}` } },
      { type: "text", text: prompt },
    ],
  },
];
```

**Region masks for the exploded view.** The animation needs to know roughly where each component sits in the photo. Do not add a segmentation model for this. Two acceptable approaches, in order of preference:

1. Ask the vision call to return normalized bounding boxes per component as part of the spec JSON (`{ x, y, w, h }`, values 0–1). Add a `region` field to `Tier`, `Border`, `SurfaceElement`, and `EdiblePrint`.
2. If box quality is poor, fall back to fixed proportional bands — tiers split the image vertically by `tierCount`, borders sit at the seams. Visually adequate for what is a stylized effect, not a measurement.

### Contract

```ts
decompose(input: {
  imageBuffer: Buffer
  medium: 'layered' | 'ice_cream'
}): Promise<CakeSpec>
```

### Implementation

1. `sharp` resize to max 1568px on the long edge, JPEG q85. Larger wastes tokens and does not improve accuracy.
2. Single Grok 4.6 multimodal call, JSON mode.
3. Prompt assembled from `buildTaxonomyPromptSection()` — never hand-written.
4. Validate against `buildSpecZodSchema()`. On validation failure, retry once with the Zod error appended to the prompt. On second failure, return a partial spec with low confidence and a `parse_failure` flag rather than throwing — a degraded spec the user can edit beats an error screen.
5. Apply medium constraints (§4.7).
6. Persist.

### Prompt — `/prompts/decompose.ts`

Structure the prompt in this order. Order matters; the constraints must land before the model starts describing.

```
You are a cake decorating specialist producing a build specification from a photograph.

Your job is to identify what techniques and materials were used to make this cake,
so a different decorator could reproduce it.

CRITICAL RULES:

1. Classify border SHAPE, never piping tip number.
   Three different borders (straight, wavy, bead) all come from a #10 round tip.
   Tip numbers are derived from shape by lookup — that is not your job.
   Report the morphology you can see.

2. For rosettes and swirls, report ridge character (fine / medium / bold),
   not a specific tip. Open star, closed star, and French star all produce
   rosettes and are not reliably distinguishable in a photograph.

3. Report only what is visible. Do not infer interior structure, flavor,
   or filling. If a tier's height is obscured, return null.

4. Give a confidence score per category. Be honest — a low score on a
   genuinely ambiguous category is more useful than a confident guess.

5. If you recognize a copyrighted or trademarked character, report it in
   licensedCharacters. Do not omit it. Do not attempt to identify the
   franchise if you are unsure — report detectedName: null with the
   franchise you suspect.

{TAXONOMY_SECTION}

{MEDIUM_CONSTRAINTS}

Return JSON matching this schema exactly:
{SCHEMA}
```

### Confidence handling

Per-category confidence drives the UI. Below 0.6, `SpecEntry` renders in an unconfirmed state with a prompt to review. This is a feature — it directs the user's editing attention to exactly where the model was unsure.

---

## 7. Module 2 — Spec editing

Two edit paths. Both write to the same `CakeSpec`.

### 7.1 Direct manipulation

On load, **auto-expand every category the vision layer populated**, with detected values prefilled and colors set. The user is reviewing a filled form, never an empty one.

Every field is editable:

- Enums → select, options from taxonomy JSON
- Counts → stepper
- Colors → swatch picker seeded with detected hex, snapping to gel families
- Booleans → toggle
- Arrays (borders, surface elements) → add / remove / reorder

Any edit sets `editedByUser = true` and the touched category's confidence to `1.0`.

### 7.2 Natural language editing

A persistent text input: _"make it two tiers, drop the gold leaf, change the border to shell."_

### Contract

```ts
editSpec(input: {
  spec: CakeSpec
  instruction: string
}): Promise<{ spec: CakeSpec; changes: ChangeDescription[] }>

type ChangeDescription = {
  path: string        // 'structure.tierCount'
  from: unknown
  to: unknown
  summary: string     // 'Reduced from 3 tiers to 2'
}
```

Implementation: send the current spec JSON plus the instruction to Grok, request a **JSON Patch** (RFC 6902) rather than a whole new spec. Patches are smaller, faster, verifiable, and cannot silently drop fields the model forgot to echo back.

Validate the patched result against the schema. Show `changes` to the user as a confirmable diff before applying — never mutate silently.

### 7.3 Re-matching

Any spec change invalidates existing matches. Do not auto-rerun; show a "Spec changed — find decorators again" affordance. Re-running costs money and the user may be mid-edit.

---

## 8. Module 3 — Supply index

### 8.1 Strategy: cache-on-demand

Not a pre-built national database. Not live search per query.

- First request for a city triggers a live crawl that builds decorator profiles
- Profiles persist in the database
- Subsequent requests in that city hit cache
- Background refresh on a TTL (default 14 days — reviews change, portfolios grow, businesses close)
- Coverage grows only where demand exists

**Why not pre-built:** stale data, expensive, cold start in every new market, and you crawl markets you never serve.

**Why not pure live:** 30–90 second queries, real per-request cost, no ranking depth, and a live API call is the single most likely thing to fail during a demo.

Austin is pre-seeded into `/data/seed/austin-decorators.json`.

### 8.2 Google Places — primary

Text Search across a query matrix, not a single query:

```
custom cakes {city}
cake decorator {city}
bakery {city}
ice cream cake {city}
custom cake shop {neighborhood}   // for each neighborhood in the metro
```

Then Place Details for each result: rating, review count, photos, website, business status.

Fetch up to 10 photos per place. Photos are the portfolio and the entire basis for capability evidence.

### 8.3 Yelp Fusion — secondary

Better review text, catches businesses Places misses. Deduplicate against Places by name + geographic proximity (within ~50m) and normalized phone.

### 8.4 Cottage food registries — differentiator, but verify per state

Some states require home bakers to register, and publish those registrations. Where that holds, it is public government data, free, and structured — reaching the long-tail home decorators Places cannot see.

**Texas is not one of those states.** Verified: Texas requires no state or local permit, license, or inspection for cottage food operations. DSHS registration exists but is **free and optional** — mandatory only for operators selling time-and-temperature-control-for-safety (TCS) foods, or for third-party cottage food vendors reselling. Most Austin home bakers will not be in it, and public searchability of the registry is unconfirmed.

**Consequence for the build:** do not make this a load-bearing source for the Austin demo. Implement the adapter interface, leave the Texas parser as a stub, and target a mandatory-registration state if the source is ever needed for real coverage.

It remains legitimate to name as a differentiator in the pitch — just describe it as an available source, not as one currently populating the index.

`// SPEC-GAP:` if pursuing this, confirm (a) which states mandate registration, (b) whether those registries are publicly downloadable, (c) whether the data includes anything beyond a name and identifier.

### 8.5 Instagram — opt-in only

Instagram Graph API, business accounts only, decorator connects their own account through OAuth. Their recent media becomes portfolio images.

**Never scrape Instagram for non-consenting accounts.** There is no discovery API for other people's content, it violates the terms, and it is the single easiest way to have the project dismissed by anyone who knows the space.

### 8.6 Source registry — how to add a source

```ts
// /lib/sources/index.ts
export interface DecoratorSource {
  id: string;
  displayName: string;
  search(city: string, radiusMiles: number): Promise<RawDecorator[]>;
  fetchPortfolio?(decorator: RawDecorator): Promise<PortfolioImage[]>;
  attribution: string; // required display attribution, if any
  respectsRobots: boolean;
}
```

Register new sources in the array in `/lib/sources/index.ts`. The crawler iterates the registry; nothing else changes.

### 8.7 Explicitly excluded sources

Document these so the decision is not silently revisited:

| Source                 | Why excluded                                                             |
| ---------------------- | ------------------------------------------------------------------------ |
| Facebook Marketplace   | No API, aggressive anti-scraping, terms prohibit                         |
| Instagram (non-opt-in) | No discovery API for others' content, terms prohibit                     |
| Thumbtack              | No public search API; lead-gen is their core business and they defend it |
| Nextdoor               | Address-verified, semi-private content, no content API                   |

"Scrapable" and "permitted" are different things. This product's pitch depends on being a real business, not a demo that survives one afternoon.

### 8.8 Portfolio capability extraction

For each decorator, evaluate their portfolio images against the taxonomy to produce `CapabilityEvidence[]`.

Batch: send up to 6 images per Grok call with the taxonomy, ask which capabilities are _demonstrated_.

### Prompt principle — `/prompts/portfolio-eval.ts`

```
Identify only capabilities you can SEE DEMONSTRATED in these photographs.

A bakery listing "custom cakes" in its description is not evidence.
A photograph of a three-tier fondant cake is evidence for
structure:tiered and frosting:fondant.

For each capability you identify, cite which image number demonstrates it
and give a one-sentence justification.

Absence of evidence is not evidence of absence — omit capabilities you
cannot confirm rather than marking them false.
```

That last line matters. A decorator with two photos is under-indexed, not incapable. The UI must distinguish "no evidence" from "cannot do."

---

## 9. Module 4 — The match agent

**This is the agentic core.** Everything else is a pipeline; this plans, acts, evaluates, and re-plans.

### 9.1 Contract

```ts
matchDecorators(input: {
  spec: CakeSpec
  city: string
  radiusMiles: number
  onTrace: (step: TraceStep) => void   // streamed to UI
}): Promise<MatchResult>

type MatchResult = {
  matches: Match[]
  substitutions: Substitution[]
  unmetRequirements: CapabilityFlag[]
  trace: TraceStep[]
}

type Match = {
  decorator: Decorator
  matchedFlags: CapabilityFlag[]
  missingFlags: CapabilityFlag[]
  categoryScores: Record<CategoryKey, number>   // drives capability dots
  reasoning: string
  distanceMiles: number
}
```

### 9.2 Tools available to the agent

```ts
searchDecorators(city, radiusMiles, filters?) → Decorator[]
getPortfolioEvidence(decoratorId) → CapabilityEvidence[]
evaluatePortfolio(decoratorId, flags) → CapabilityEvidence[]   // on-demand deep eval
checkLicensedPrintProgram(decoratorId) → boolean | null
widenSearch(newRadiusMiles) → Decorator[]
proposeSubstitution(blockedFlag, spec) → Substitution
```

### 9.3 The loop

**Step 1 — Plan.**
Compute required flags from the spec. Rank by rarity. Identify the _limiting constraints_ — typically one to three rare flags. Emit a trace line naming them.

This is a real decision. Searching on `frosting:buttercream_american` returns every bakery in Austin and narrows nothing. Searching on `finish:metallicLeaf` + `decor:licensed_print` finds the handful who can actually do the job. The agent must reason about which requirements are discriminating.

**Step 2 — Search.**
Query the index (cached) or trigger a crawl (cold). Emit candidate count.

**Step 3 — Evaluate.**
For each candidate, compare demonstrated capabilities against required flags. Compute per-category scores. Emit rejections _with reasons_ — the rejections are as convincing as the matches.

**Step 4 — Assess and re-plan.**

- Fewer than 3 matches above threshold → widen radius (up to `MAX_RADIUS_MILES`), or identify the single blocking flag and call `proposeSubstitution`
- More than 15 matches → tighten on quality signals (review count, evidence strength)
- Blocked flag is a licensed character → route to §10

Every re-plan emits a trace line stating _what_ changed and _why_.

**Step 5 — Rank.**
Capability coverage first, weighted by rarity. Then review quality. Then distance. Never a single opaque composite number in the UI — show the dimensions.

**Step 6 — Explain.**
One sentence per match, generated, specific: _"Tiered fondant across six recent posts and a licensed print program; no gold leaf evidence."_

### 9.4 The trace is a product feature

The category is agentic orchestration. A ranked list with no visible reasoning is a search engine. The same list with the agent's plan, rejections, and re-planning shown live is the entry.

`TraceStep` types: `plan` · `search` · `evaluate` · `reject` · `replan` · `substitute` · `rank` · `complete`

Stream over SSE. Render as it arrives. Never buffer and dump at the end — the streaming is what makes it read as reasoning rather than a log file.

Do not fabricate trace steps for effect. If the agent did not re-plan, do not show a re-plan line. A judge who spots a scripted trace in an agentic category has found the worst possible thing.

---

## 10. Module 5 — IP compliance

Bakeries cannot legally freehand copyrighted characters onto cakes. They **can** use licensed edible images through official programs — the DecoPac / PhotoCake ecosystem that most chain and franchise bakeries run on.

Terminology: these are **copyrighted and trademarked**, not patented. Get this right in the UI copy.

### Flow

1. Vision layer flags `licensedCharacters[]`
2. `checkLicensedPrintProgram` against candidates — chains and franchises typically yes, independents typically no
3. Branch:
   - **Licensed print available locally** → match to those decorators, set `complianceStatus: 'licensed_print_available'`
   - **Not available** → `proposeSubstitution` generates a compliant alternative: themed palette, shapes, and motifs rather than the character

### Substitution copy

Direct, non-apologetic, actionable:

> No licensed Bluey print available within 25 miles. Three decorators can match the palette and shapes.

Never: _"Sorry, we couldn't find…"_

This is a strong agentic moment and a genuine domain-depth signal. It is also a real problem every bakery faces daily.

---

## 11. Module 6 — Report and outreach

### 11.1 The report

Customer-facing summary:

- Spec in plain language, category by category
- Ranked decorators with per-match reasoning and capability dots
- Complexity assessment (not price — see below)
- Flagged compromises and accepted substitutions
- Generated outreach message per decorator

**Price:** no estimation model. Where a decorator publishes pricing on their website or listing, surface it verbatim with attribution and a "published price, confirm with decorator" label. Never generate a number.

### 11.2 Outreach email

### Contract

```ts
sendOutreach(input: {
  specId: string
  decoratorIds: string[]
  customerEmail: string
  customerName: string
  eventDate: string | null
  notes: string | null
}): Promise<{ sent: string[]; failed: string[] }>
```

Template (`/templates/outreach.tsx`):

```
Subject: Custom cake inquiry — {eventDate or 'date flexible'}

Hi {decoratorName},

I'm looking for someone to make this cake and your work looks like a match.

WHAT I'M ASKING FOR
{spec rendered as a readable list — structure, frosting, piping, decor, finish}

{reference image attached}

{eventDate ? `I need it by ${eventDate}.` : 'My date is flexible.'}
{notes}

Can you take this on, and what would it cost?

{customerName}
{customerEmail}

—
This inquiry was sent through crumb, which matched your portfolio to this
design. Claim your profile to manage what shows: {signupUrl}
```

**Sending model — get this right.** The customer is the sender. `reply-to` is the customer's address. The `from` is a verified crumb domain for deliverability. The signup line is a footer on a message the customer chose to send, not a marketing blast.

This distinction matters legally and it matters if a judge asks. Have the answer ready: it is transactional correspondence initiated by a customer to a business, with a footer, not cold bulk marketing.

Also required:

- Rate limit: max 5 decorators per send
- The customer sees and can edit the message before it sends
- Never send without explicit confirmation
- Suppression list for decorators who ask out

---

## 12. Module 7 — Bakery intake surface

Route: `/intake/[bakeryId]`

Same engine, inverted audience. A bakery embeds or links this. Their customer uploads a photo and gets a structured spec. The bakery receives the spec instead of a screenshot and a guess.

Differences from the customer surface:

|                    | Customer              | Bakery intake                                        |
| ------------------ | --------------------- | ---------------------------------------------------- |
| After spec         | Find decorators       | Submit to this bakery                                |
| Matching           | Runs                  | Skipped                                              |
| Capability check   | Across all decorators | Against **this bakery's** capability profile only    |
| Out-of-scope items | Substitution proposal | Flagged to bakery as "cannot fulfill" before quoting |
| Branding           | crumb                 | Bakery's                                             |
| Output             | Outreach emails       | Order record + printable build sheet                 |

The build sheet is the deliverable: spec rendered for a decorator's bench, with derived tip numbers, color references, border counts, and placement.

**This is the better business model.** Consumer cake referral economics are thin; selling an intake tool to bakeries is a real subscription. Build both, but understand which one is the business.

For a franchise operator with existing licensed-print access and ice cream cake constraints, the intake mode with `medium: 'ice_cream'` locked is the most immediately deployable version of this entire product.

---

## 13. Design system

### 13.1 Thesis

**A spec sheet for something delicious.**

Cake is soft, warm, handmade, imprecise. This product's entire value is making it precise. The interface holds both — confectionery color, engineering structure. A piping tip chart is already exactly this: candy-colored product photography in a rigorous specification grid. That artifact is the north star.

Reference world: the decorator's bench. Gel color bottles, tip charts, parchment triangles, turntables, swatch books, the numbered drawer of couplers.

### 13.2 Tokens — `/styles/tokens.css`

Colors derive from gel food coloring. The candy colors are **not decoration** — each is permanently bound to a spec category, exactly as the borderology chart binds a color to each border type. Color encodes meaning.

```css
:root {
  --ink-violet: #3d1e5c; /* primary ink, headers, structural rules */
  --icing-white: #f7f8fa; /* surface — cool, royal icing, not parchment */
  --gel-teal: #2fb8af; /* structure */
  --gel-coral: #e23d2e; /* piping */
  --gel-marigold: #f5b02e; /* frosting */
  --gel-lilac: #c4b5e8; /* decor */
  --gel-plum: #7b4ba8; /* finish */
  --slate-60: #6b6478; /* secondary text */
  --amber-flag: #c77700; /* warnings, substitutions */

  --radius-data: 2px; /* spec surfaces, chips, tables */
  --radius-image: 16px; /* photography, cards */

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-10: 40px;
  --space-16: 64px;

  --motion-state: 180ms cubic-bezier(0, 0, 0.2, 1);
  --motion-explode: 600ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

Deliberately avoiding warm-cream-and-terracotta, which reads as an AI default, and pastel-pink-and-gold, which is the default for anything cake-adjacent. Violet and gel brights is both more distinctive and more accurate to what a decorator's workspace actually looks like.

The radius pair carries the thesis: hard edges on the spec, soft edges on the cake.

### 13.3 Type

| Role    | Face                | Use                                                                     |
| ------- | ------------------- | ----------------------------------------------------------------------- |
| Display | Bricolage Grotesque | Headlines. Variable width, slightly irregular — warmth without cuteness |
| Body    | Inter Tight         | Interface text, descriptions, reasoning traces                          |
| Data    | JetBrains Mono      | Tip numbers, measurements, counts, capability flags                     |

The mono carries the whole idea. `TIP #32` set in monospace beside a photograph of a buttercream shell is the product in one line: this soft thing, specified.

Scale: 13 / 15 / 18 / 24 / 34 / 52. Display 500 and 700 only. Body 400 and 500. Mono 400, `letter-spacing: 0.02em` below 15px.

### 13.4 Signature element — the exploded view

The one thing this product is remembered by.

On decomposition, the photograph does not sit still and grow a sidebar. It **comes apart**. Components lift along a vertical axis — tiers separate, borders detach from tier seams, the edible print floats forward off the surface, toppers rise — and each settles beside its spec entry, connected by a thin leader line in that component's assigned gel color.

An exploded-view engineering diagram, for a cake.

Implementation: full 3D segmentation is out of scope. Use 2D layer separation with parallax offset — segment masks translated along Z-approximating vectors with slight scale increase. Reads as an explosion at a fraction of the cost.

Sequence: 600ms, staggered 80ms per component, bottom-up. `prefers-reduced-motion` collapses to a cross-fade.

Everything else in the interface stays quiet so this can be loud.

### 13.5 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  crumb                    [layered ▾] [Austin ▾]  [+ new]    │
├──────────────────────────────┬──────────────────────────────┤
│                              │  SPEC                        │
│      [ exploded cake ]       │  ▏ STRUCTURE          teal   │
│                              │    3 tier · round · ~60 srv  │
│         ╱ leader lines       │  ▏ FROSTING       marigold   │
│        ╱  to spec entries    │    Fondant over buttercream  │
│       ╱                      │  ▏ PIPING            coral   │
│                              │    Shell border   TIP #32    │
│                              │    Bead border    TIP #10    │
│                              │  ▏ DECOR            lilac    │
│                              │    Edible print · 6" round   │
│                              │    ⚠ Licensed character      │
│                              │  ▏ FINISH             plum   │
│                              │    Gold leaf accents         │
│                              │  ┌────────────────────────┐  │
│                              │  │ describe a change…     │  │
│                              │  └────────────────────────┘  │
├──────────────────────────────┴──────────────────────────────┤
│  AGENT                                                       │
│  ▸ Limiting constraint: gold leaf + licensed print access    │
│  ▸ Searching Places, Yelp, cottage registry — 34 candidates  │
│  ▸ Rejected 21: no tiered fondant evidence in portfolio      │
│  ▸ Widened radius 15→25mi to clear match threshold           │
├─────────────────────────────────────────────────────────────┤
│  MATCHES                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │ [photos] │ │ [photos] │ │ [photos] │                     │
│  │ Name     │ │ Name     │ │ Name     │                     │
│  │ 4.8 ·200 │ │ 4.9 · 87 │ │ 4.6 ·310 │                     │
│  │ ●●●●○    │ │ ●●●●●    │ │ ●●●○○    │                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

### 13.6 Components

**SpecEntry**
Variants bound to category color. States: default · hovered (highlights its cake region and leader line) · low-confidence (dashed left rule, review prompt) · flagged (amber rule) · edited · confirmed.
Chrome is a 3px left rule in the category color. Nothing else. Label in mono, value in body.

**CapabilityDots**
Five dots, category-ordered, color-bound. Filled = portfolio evidence. Hollow = no evidence found. **Not a rating — an evidence map.** Hover reveals the specific portfolio images behind each fill.
Accessibility: never color alone. Each dot carries a `title`; the group carries an `aria-label` reading categories as text.

**AgentTrace**
Live-streaming reasoning log. Monospace, dim violet, one line per step, fade-in on arrival. Collapsible after completion, never hidden during. This is a feature, not a loading state.

**DecoratorCard**
Three portfolio thumbnails, name, rating with count, capability dots, distance, one-line agent reasoning in body italic. States: default · hover (lifts 2px, thumbnails advance) · selected · contacted.

**SubstitutionPrompt**
Amber left rule. Blocked requirement struck through, proposal beneath, accept / decline.

**MediumToggle**
Layered cake / ice cream cake. Switching re-applies constraints and re-runs decomposition against the new medium.

### 13.7 Copy voice

Plain, specific, decorator-literate. Use the words a decorator uses — _shell border_, _tier seam_, _crumb coat_. Using the real vocabulary is what signals the product understands the domain.

Errors state what happened and what to do. Empty states invite action.

- Empty upload: _"Drop a cake photo. Pinterest screenshots work fine."_
- No matches: _"Nothing within 25 miles does gold leaf. Widen the radius, or drop the gold leaf and see 12 matches."_
- Failed decomposition: _"Couldn't read the cake — the photo is too dark to separate tiers. Try a straight-on shot."_
- Low confidence: _"Not sure about the border. Check this one."_

Never apologize. Never say "oops." Never call the cake "your creation."

---

### 13.8 Landing page

Route: `/` when no upload is in progress. This is the first thing a judge sees — treat it as part of the product, not a marketing afterthought.

**The hero is the thesis, not a headline over a gradient.**

A cake, already exploded, mid-air. Components separated along the vertical axis with their leader lines and spec labels visible — shell border `TIP #32`, fondant over buttercream, edible print 6". It is the product's output, presented as the hero image, running as an ambient loop: assemble, hold, explode, hold, repeat. Roughly 8 seconds, `prefers-reduced-motion` shows the exploded state statically.

Someone understands the entire product in three seconds without reading a word.

```
┌──────────────────────────────────────────────────────┐
│  crumb                              How it works  ↗  │
│                                                       │
│  ┌────────────────────┐   Every custom cake order    │
│  │                    │   starts with a screenshot    │
│  │   [ exploded       │   and a guess.                │
│  │     cake, looping ] │                              │
│  │                    │   Upload the photo. Get the   │
│  │   ─── TIP #32      │   spec. Find who can build it.│
│  │   ─── fondant      │                              │
│  │   ─── edible print │   ┌─────────────────────────┐│
│  │                    │   │  Drop a cake photo      ││
│  └────────────────────┘   │  or browse examples     ││
│                            └─────────────────────────┘│
├──────────────────────────────────────────────────────┤
│  THE PROBLEM                                          │
│  Three columns, no icons:                             │
│  Supermarket tools │ AI generators │ DMing bakers     │
│  make you pick     │ hand you an   │ takes days and   │
│  from a menu       │ unbuildable   │ usually ends in  │
│                    │ picture       │ a compromise     │
├──────────────────────────────────────────────────────┤
│  WHAT IT READS                                        │
│  The taxonomy, as a live specimen grid — borders and  │
│  nozzle families rendered as the charts they came     │
│  from. Hover any one to see what it produces.         │
│  This is the credibility moment. Show the depth.      │
├──────────────────────────────────────────────────────┤
│  FOR BAKERIES                                         │
│  One block, one CTA. The business model, stated       │
│  plainly: stop receiving screenshots, start           │
│  receiving specs.                                     │
└──────────────────────────────────────────────────────┘
```

**Copy rules for this page.** No "revolutionizing." No "powered by AI." No adjective stacks. The problem statement does the selling: _"Every custom cake order starts with a screenshot and a guess."_ State what it does in verbs.

**The specimen grid is the section to spend effort on.** Rendering the seven border types and eight nozzle families as an interactive chart — the borderology and nozzle-guide visual language, live — demonstrates domain depth faster than any copy could. It also doubles as documentation.

### 13.9 Responsive strategy

Mobile is not a narrowed desktop. The layouts differ structurally because the exploded view cannot share a row with the spec panel on a phone.

**Breakpoints**

```css
/* mobile-first; these are the only three */
--bp-md: 768px; /* tablet: spec panel becomes a sidebar */
--bp-lg: 1120px; /* desktop: three-zone layout */
```

**Layout by breakpoint**

| Zone          | Mobile (<768)                                                           | Tablet (768–1120)     | Desktop (>1120)       |
| ------------- | ----------------------------------------------------------------------- | --------------------- | --------------------- |
| Exploded view | Full-width, top, tap-to-expand fullscreen                               | Left 55%              | Left 60%              |
| Spec panel    | Below the cake, accordion — one category open at a time                 | Right 45%, scrolls    | Right 40%, sticky     |
| Agent trace   | Bottom sheet, collapsed to a one-line status ticker, swipe up to expand | Full-width band below | Full-width band below |
| Matches       | Vertical stack, one card per row                                        | 2-column grid         | 3-column grid         |
| NL edit input | Sticky bottom bar above the safe area                                   | Inline under spec     | Inline under spec     |

**Mobile-specific behavior**

- **Exploded view** — the leader lines that work on desktop become unreadable at 375px. On mobile, drop the lines. Instead, tapping a component in the cake scrolls to and highlights its spec entry; tapping a spec entry highlights its region on the cake. Same relationship, expressed through interaction instead of geometry.
- **Spec panel** — accordion, not a long open list. Auto-open the lowest-confidence category first, since that is where attention is needed.
- **Agent trace** — a full streaming log destroys a phone screen. Collapse to a single ticker line showing the current step; swipe up for the full trace. The trace still streams underneath.
- **Capability dots** — 44px minimum touch target on the group, not per dot.
- **Upload** — camera capture as a first-class option, not just file picker. `<input type="file" accept="image/*" capture="environment">`. Someone standing in a bakery photographing a display case is a real use.

**Quality floor, non-negotiable**

- Every interactive target ≥44×44px on touch
- Visible keyboard focus rings, never `outline: none` without a replacement
- `prefers-reduced-motion` respected on the exploded view and the trace fade-in
- Text remains legible at 200% zoom
- Test at 375px (iPhone SE), 768px, and 1440px before calling anything done
- Safe-area insets respected on the sticky bottom bar: `padding-bottom: env(safe-area-inset-bottom)`

**On strict mode and creative UI** — these are unrelated. Strict mode governs whether `tiers[0]` can be `undefined`; it has no bearing on visual ambition. Keep it on. It will catch the empty-state bugs that otherwise surface as a blank screen during the demo.

---

## 14. Build order

Each phase ends in something runnable. Do not proceed until the current phase's exit criterion is met.

| Phase  | Build                                                                                  | Exit criterion                                               |
| ------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **1**  | Taxonomy JSON files, `buildTaxonomyPromptSection`, `buildSpecZodSchema`, Prisma schema | `npm run taxonomy:validate` passes; schema generates         |
| **2**  | Grok client wrapper, retry, JSON mode, error types                                     | Unit test round-trips a JSON response                        |
| **3**  | Vision decomposition + medium constraints                                              | Photo in → valid `CakeSpec` out, in a test script            |
| **4**  | Design tokens, base components, upload page                                            | Static spec renders correctly from a fixture                 |
| **5**  | Exploded view                                                                          | Fixture spec animates and leader-lines correctly             |
| **6**  | Spec editing — direct manipulation                                                     | Every field editable, persists                               |
| **7**  | Spec editing — natural language, JSON Patch, diff confirm                              | "make it two tiers" works end to end                         |
| **8**  | Places source + crawler + Decorator persistence                                        | Austin index populated                                       |
| **9**  | Portfolio capability extraction                                                        | Decorators have `CapabilityEvidence` with cited images       |
| **10** | Match agent — plan, search, evaluate, rank                                             | Ranked matches returned in a test script                     |
| **11** | Trace streaming + AgentTrace component                                                 | Reasoning renders live in the UI                             |
| **12** | Re-planning: widen, tighten, substitute                                                | Over-constrained spec triggers a visible re-plan             |
| **13** | IP compliance + SubstitutionPrompt                                                     | Licensed character photo produces the substitution flow      |
| **14** | Report + outreach email                                                                | Email actually arrives, correctly formatted                  |
| **15** | Yelp source                                                                            | Dedupes cleanly against Places                               |
| **16** | Cottage registry source (Texas)                                                        | Registry entries enter the index                             |
| **17** | Instagram opt-in OAuth                                                                 | Decorator connects, portfolio ingests                        |
| **18** | Bakery intake surface + build sheet                                                    | Intake produces a printable build sheet                      |
| **19** | Ice cream cake mode end to end                                                         | Toggle produces correctly constrained spec and matches       |
| **20** | Landing page + specimen grid                                                           | Loads under 2s, ambient loop runs, specimen grid interactive |
| **21** | Responsive pass — mobile layouts, accordion spec, trace bottom sheet, camera capture   | Full flow usable at 375px                                    |
| **22** | Polish, empty states, error states, a11y pass, reduced motion                          | Keyboard-navigable, screen-reader sane, 200% zoom legible    |

---

## 15. How to extend

### Add a border type

Append to `/data/taxonomy/borders.json`:

```json
{
  "id": "rope",
  "tip": "#21",
  "family": "open_star",
  "visualSignature": "Twisted overlapping S-strokes forming a continuous cord",
  "rarity": 0.4
}
```

Prompt, schema, and UI picker all update. No code change.

### Add a nozzle family

Same pattern in `nozzles.json`. Include the `produces` array — that is what generates capability flags.

### Add a data source

Implement `DecoratorSource` (§8.6), register it. Check terms of service first, and record the decision in §8.7 either way.

### Add a city

Nothing to do. Cache-on-demand handles it. To pre-seed, run the crawler and commit the output to `/data/seed/`.

### Add a medium

Add an entry to `medium-constraints.json` and a `MediumToggle` option. Cupcakes, cookie cakes, and dessert tables all fit this shape.

### Change the agent's reasoning

`/prompts/match-plan.ts`. Keep the rarity-driven planning — it is what makes the search intelligent rather than a filter.

---

## 16. Demo script

1. Open on a real Pinterest cake photo — visibly complex, tiered, with an edible print element
2. Upload. Exploded view animates, components separate and label
3. Spec appears, categories auto-expanded, colors prefilled
4. Type an edit: _"make it two tiers and drop the gold leaf"_ — diff confirms, spec updates
5. Enter Austin. Agent trace runs live: plan, sources, candidates, a rejection with a stated reason
6. Ranked results with capability dots and per-match reasoning
7. IP beat: licensed character detected, substitution proposed, accept it
8. Generate outreach, review the message, send. Show it arrive
9. Switch to `/intake` — same photo, bakery view, printable build sheet
10. Toggle ice cream cake mode — constraints visibly change the spec

### Non-negotiables

- **The agent trace stays visible.** The category is agentic orchestration; the trace is the entry.
- **Never fabricate a trace step.** A scripted re-plan that did not happen is the worst possible finding in this category.
- **Show a rejection.** The decorators the agent turned down are more convincing than the ones it chose.

---

## 17. Known friction — read before building

None of these are blockers, but each will cost you time if you meet it unprepared.

**Google Places photo terms.** Place photos come with usage and caching restrictions, and passing them to a third-party model for analysis is not clearly covered. For a demo this is fine. For anything beyond, read the current Places terms before building capability extraction on cached photos. Mitigation: store photo _references_, fetch at display time, and keep derived capability data rather than the images themselves.

**Yelp Fusion caching limits.** Yelp restricts how long you may store their data and requires attribution and linkback. Treat Yelp as a live-read enrichment source, not something you persist into the index for weeks.

**SQLite will not persist on serverless hosts.** If you deploy to Vercel or similar, the file resets. Run locally for the demo, or switch the Prisma provider to Postgres. Same schema either way — this is a one-line change made painful only if discovered late.

**Vision model refusal on licensed characters.** Some models decline to name copyrighted characters. If Grok hedges, fall back to detecting _that_ a licensed character is present without naming the franchise — the compliance flow works identically, and `detectedName: null` is already in the schema for exactly this reason.

**JSON mode plus vision.** Confirm the two work together on your model before building around it. If structured output is unavailable alongside images, fall back to a strict prompt plus Zod parse with one retry — already specified in §6.

**Do not send real outreach to real bakeries during the hackathon.** Point `OUTREACH_TO_OVERRIDE` at your own address for the demo. Emailing actual Austin businesses from an unproven build is the one mistake here with consequences outside the room.

**Fonts.** Bricolage Grotesque, Inter Tight, and JetBrains Mono are all openly licensed and self-hostable. No friction, listed only so you do not go looking for a paid foundry.

---

## 18. Open items

- [ ] Product name — `crumb` is a placeholder
- [ ] Confirm current Grok model identifier from xAI docs
- [x] Texas cottage food registry — verified: registration is optional in TX, source deprioritized
- [ ] Extend borders beyond the 7 base types: rope, zigzag, dot, scroll, drop string
- [ ] Enumerate full ice cream cake exclusion list with a decorator's review
- [ ] Choose three demo photos — one must contain a licensed character
- [ ] Decide whether ridge-character disambiguation of star families is reliable enough to ship, or should collapse to `star_family: unknown`
- [ ] Gel color mapping table — hex → named gel family, needs a real color chart as source
