# Project Documentation

This document provides an overview of the architecture, terminology, policies, and data flow for the CEO Magazine website. It serves as the canonical reference for developers and operators.

## Overview
- Next.js 14 (App Router) frontend with Tailwind CSS.
- Sanity CMS provides content (posts, writers, categories, ads).
- Vercel hosts the site; Sanity Studio is embedded at `/studio`.

## Architecture Map
- `app/` — Next.js routes and layouts
  - `page.tsx` — Homepage
  - `article/[slug]/page.tsx` — Article detail
  - `writer/[slug]/page.tsx` — Writer profile
  - `studio/` — Embedded Sanity Studio
- `components/` — UI building blocks (e.g., `Hero`, `OptimizedImage`)
- `lib/` — Utilities and integrations
  - `sanity.ts` — Sanity client (read)
  - `sanityWrite.ts` — Sanity client (write/admin)
  - `types.ts` — Shared types (Writer-only terminology)
  - `seo.ts`, `views.ts`, `localeGate.ts` — SEO, counters, localization
- `sanity/schemaTypes/` — CMS content types
- `scripts/` — Maintenance and import/export scripts

## Terminology & Policies
- Writer-only: use `Writer` for attribution everywhere (schemas, queries, UI, docs). Do not use `author`.
- Cookies: use `user-country` for geolocation. Client components and API must read/write only this key.
- Image & Hero Policy:
  - Avoid unintended cropping/upscaling; prefer explicit aspect wrappers.
  - Use `next/image` with `fill` only when container aspect matches the asset.
  - Align `sizes` to real layout; avoid `100vw` when container is narrower.

## Data Flow
1. Content is authored in Sanity (`Post`, `Writer`, `Category`, `Advertisement`).
2. Frontend fetches published content via `lib/sanity.ts` using GROQ queries.
3. Pages render with components that enforce image and terminology policies.

## Routing Conventions
- Attribution pages: `/writer/[slug]`.
- Deprecate and redirect any `/author/*` routes.
- Articles: `/article/[slug]`.

## Tag Normalization Policy
- Normalize tags to lowercase and trim whitespace on write and audit.
- Avoid punctuation-heavy tags; use simple words/phrases (e.g., `cxo interview`, `opinion`).
- De-duplicate case-insensitively (`AI` and `ai` → `ai`).
- Keep tags concise; recommended max length: 24 characters.
- Prefer a small, consistent set for badges and filtering. Current common tags: `opinion`, `cxo interview`, `innovation`, `ai`, `leadership`, `energy`, `bfsi`, `technology`, `startups`, `philanthropy`.
- Scripts: `scripts/tag-audit.js` and `scripts/tags-dashboard.js` report coverage and anomalies.

## Development
- Install dependencies: `npm install`
- Run dev server: `npm run dev` (port printed by the script, typically `3000`)
- Studio: `http://localhost:<port>/studio`

## Deployment Runbook
See `OPERATIONS_RUNBOOK.md` for step-by-step deployment and post-deploy checks.

## Related Documents
- `STANDARDS.md` — Coding and image policies; Writer-only guidance
- `OPERATIONAL_RULES.md` — Ops rules (cookies, routing)
- `README.md` — Quickstart, structure, and external docs
