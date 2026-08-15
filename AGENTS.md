# AGENTS.md

Rules for any AI agent working in this repository. Read fully before your first edit. These are not suggestions.

The build specification lives in `cake-app-build-spec.md`. This file governs _how_ you build; that file governs _what_.

---

## 1. Before you write code

- Read the spec sections relevant to your task. Do not infer the domain model from adjacent code.
- If a requirement is ambiguous, implement the simplest correct version and mark it `// SPEC-GAP: <what is unclear>`. Never invent product behavior silently.
- If you are about to add a dependency, check whether the stack already covers it. The answer is usually yes.

## 2. Code rules

- TypeScript strict. No `any` outside third-party shims. No `@ts-ignore` without an adjacent comment explaining why.
- Every LLM response and every external API response is validated with Zod before use. Model output is untrusted input.
- No inline prompt strings. Prompts live in `/prompts/*.ts` as exported template functions.
- No hardcoded taxonomy. Border types, nozzle families, frosting types, and constraints come from `/data/taxonomy/*.json`. If you find yourself typing `'shell' | 'bead' | ...` in a component, stop — you are duplicating the source of truth.
- No hardcoded colors, spacing, or radii in components. Use the tokens in `/styles/tokens.css`. A raw hex in a `className` is a bug.
- Server-side secrets never reach the client. No API key in a `NEXT_PUBLIC_` variable, ever.
- Files over ~300 lines get split. Components over ~150 lines get split.
- Delete dead code rather than commenting it out.

## 3. Error handling

- Every external call is wrapped and returns a typed result, not a thrown string.
- Every failure path has a user-visible state that says what happened and what to do next.
- Degraded output beats an error screen. A low-confidence spec the user can edit is better than "Something went wrong."
- Never swallow an error silently. Log it server-side with context.

## 4. Design discipline — the deslop list

These are the specific tells that make software look machine-generated. Avoid every one.

**Visual**

- No purple-to-blue gradient. No gradient hero. No gradient text. No gradient buttons.
- No emoji as iconography. Not in headings, not in buttons, not in empty states, not in copy.
- No glassmorphism, no frosted-blur cards, no neumorphism.
- No drop shadow on everything. Shadows earn their place; this project uses exactly one, on the decomposition overlay. Everything else uses a hairline border.
- No uniform 12px radius on every surface. The radius pair is deliberate: `--radius-data` (2px) on spec surfaces, `--radius-image` (16px) on photography. Respect the distinction.
- No stock icon set sprinkled for decoration. An icon appears only when it replaces a word, never when it accompanies one.
- No centered-everything layout. Text blocks are left-aligned.
- No three-column feature grid with an icon, a bold heading, and two lines of gray text. If a section needs three columns, the columns carry real content.
- No `01 / 02 / 03` numbered markers unless the content is genuinely a sequence.

**Copy**

- No "revolutionize," "seamless," "effortless," "unleash," "empower," "elevate," "game-changing," "cutting-edge," "harness the power of."
- No "Powered by AI" badge. No sparkle icon to indicate AI. The reasoning trace already shows the work.
- No em-dash-heavy sentences, no adjective stacks, no rhetorical questions as headings.
- No "Oops!" No "Something went wrong." Errors say what happened and what to do.
- Sentence case in UI, always. Not Title Case On Buttons.
- Verbs over nouns: "Find decorators," not "Decorator Discovery."
- One voice throughout. The button that says "Send" produces a toast that says "Sent."

**Structure**

- Empty states invite an action, they do not apologize.
- Loading states show what is happening, not a generic spinner, where the operation takes more than a second.
- Do not pad a page to look substantial. A short page that says one thing is better than a long one that repeats it.

## 5. Simplify — the cut test

Before finishing any component, apply these:

- **Remove one thing.** Look at what you built and delete the least necessary element. If the design survives, it was right to cut.
- **Can this be text?** A chart, badge, or icon that conveys less than a sentence should be a sentence.
- **Does this state exist?** Do not build a variant no flow reaches.
- **Would a decorator recognize this word?** Use the domain's real vocabulary — _shell border_, _tier seam_, _crumb coat_. Invented product jargon is worse than plain language.

## 6. Accessibility floor

Not optional, and cheap if done as you go:

- Every interactive target ≥44×44px on touch.
- Visible focus rings. Never `outline: none` without a designed replacement.
- Never color alone to convey meaning. Capability dots carry `title` attributes and the group carries an `aria-label`.
- `prefers-reduced-motion` respected on the hero scroll and the trace animation.
- Real semantic elements. A `<div onClick>` is a bug; use `<button>`.
- All images have alt text. Decorative images get `alt=""`.
- Legible at 200% zoom.

Run `axe` DevTools on each page before calling it done.

## 7. Responsive

- Mobile-first. Write the small layout, then add breakpoints up.
- Test at 375px, 768px, and 1440px. Not "it looks fine on my screen."
- Respect safe-area insets on fixed bottom elements.
- Mobile is not a narrowed desktop — see spec §13.9 for where the layouts diverge structurally.

## 8. Performance

- `next/image` for all photography. Never a raw `<img>` for a Places photo.
- Self-host fonts, subset them, `font-display: swap`.
- Stream the agent trace. Never buffer and dump.
- Cache every external API response. Places and Yelp calls cost money and rate limit.
- No client-side bundle over 200KB gzipped without a reason.

## 9. Definition of done

A task is not done until:

- [ ] `tsc --noEmit` passes
- [ ] Lint passes with no disabled rules added
- [ ] The happy path works end to end
- [ ] The empty state exists and reads well
- [ ] The error state exists and says what to do
- [ ] Tested at 375px and 1440px
- [ ] Keyboard-navigable
- [ ] No hardcoded color, spacing, or taxonomy value
- [ ] Any ambiguity marked `// SPEC-GAP:`

## 10. Toolchain

```bash
npm run dev
npm run typecheck     # tsc --noEmit
npm run lint          # eslint + prettier check
npm run format
npm run taxonomy:validate
npm run test:e2e      # playwright, demo flow only
```

Install and configure, in this order:

- **TypeScript** strict, `noUncheckedIndexedAccess: true`
- **ESLint** with `eslint-config-next` and `@typescript-eslint` recommended-type-checked
- **Prettier** — or **Biome** if you prefer one tool for both; do not run both linters
- **Zod** for every boundary
- **Playwright** — one spec covering the demo flow in §16. This is the thing that tells you the demo still works after a refactor.

## 11. Commits

- One logical change per commit.
- Message says what changed and why, not "update files."
- If you change a Contract block in the spec, update the spec in the same commit.
