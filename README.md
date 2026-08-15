# CakeMatch

Upload a cake photo. Get a buildable spec. Find local decorators who can make it.

## Local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The demo works without API keys: example cakes load fixture specs, Austin decorators are seeded, and outreach logs a dry-run unless `RESEND_API_KEY` is set.

`OUTREACH_TO_OVERRIDE` sends every inquiry to your inbox. Do not email real bakeries from a trial build.

## Scripts

```bash
npm run typecheck
npm run lint
npm run taxonomy:validate
npm run test
npm run test:e2e
```

## Vercel

This is a Next.js App Router app. Set the same server env vars in the Vercel project. Do not prefix secrets with `NEXT_PUBLIC_`.

SQLite will not persist on serverless. The running app uses the Austin seed plus in-memory/session storage so the demo path works without a database. For production persistence, point Prisma at Postgres (`provider = "postgresql"` and `DATABASE_URL`) and wire `lib/store` to `prismaStore`.

Required for live vision: `GROK_API_KEY`, `GROK_MODEL=grok-4.6`. Optional: Places, Yelp, Resend.

## Product rules

See `AGENTS.md` and `cake-app-build-spec.md`.
