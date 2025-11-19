# Developer Onboarding

## Quick Start
- Requirements: Node `22.x`, `pnpm` installed, Sanity project credentials.
- Install: `pnpm install`
- Dev server: `pnpm dev`
- Build: `pnpm build`; start: `pnpm start`
- Gated deploy to production: `pnpm run deploy:prod`

## Environment
- Create `.env.local` with:
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `NEXT_PUBLIC_SANITY_DATASET`
  - `NEXT_PUBLIC_SANITY_API_VERSION`
- Sanity Studio deploy: `pnpm sanity:deploy` (Studio URL output during deploy)

## Architecture
- Next.js App Router with ISR and server components.
- Sanity CMS for content, `urlFor()` builder for images.
- Image optimization: WebP/AVIF via Next image config `next.config.ts:60`.
- Key modules:
  - Homepage metadata and ISR: `ceo-magazine/app/page.tsx:1`, `22`.
  - Article page logic (hero + related): `ceo-magazine/app/category/[slug]/[article]/page.tsx:97-119`, `150-154`, `188-200`, `362-394`.
  - SEO helpers (canonical, OG/Twitter, JSON‑LD): `ceo-magazine/lib/seo.ts:1`, `111`, `155`.
  - Image wrapper: `ceo-magazine/components/OptimizedImage.tsx:1`.
  - Footer version read: `ceo-magazine/components/Footer.tsx:46` and site version `ceo-magazine/package.json:3`.
  - Robots/Sitemap: `ceo-magazine/app/robots.txt/route.ts:1`, `ceo-magazine/app/sitemap.xml/route.ts:1`.

## Invariants and Guardrails
- Hero source:
  - Full article pages must render hero from `public/Featured hero` or Sanity `mainImage` only; never from `Featured section`.
  - Aspect ratio is computed from local metadata and memoized for stable rendering.
  - References: `ceo-magazine/app/category/[slug]/[article]/page.tsx:188-200`, `362-394`.
- Related Articles:
  - Exclude current article by `_id` and `slug`.
  - Require `defined(mainImage.asset)`.
  - Prefer primary category for relevance.
  - References: `ceo-magazine/app/category/[slug]/[article]/page.tsx:97-119`, `150-154`.
- Terminology Policy:
  - Use “Writer” everywhere (schema, UI, queries). See `ceo-magazine/STANDARDS.md`.
- Verification Protocol:
  - Read back every edited file and validate live rendering or smoke checks before reporting completion. See `ceo-magazine/STANDARDS.md:157`.

## Deployment Flow
- Use `scripts/deploy-gated.sh` to:
  - Build preview → run smoke checks → promote to production.
- Smoke checks include hero and related validations on multiple CXO slugs.
- References: `ceo-magazine/scripts/smoke-check.js:57-74`, `75-112`.
- Footer version bumps by updating `package.json` to surface in UI (`components/Footer.tsx:46`).
- Sanity Studio deploy: `pnpm sanity:deploy`.

## Smoke Checks
- Validations performed:
  - Article hero served from `Featured hero` and not `object-contain`.
  - Related Articles section shows images, excludes current article, and avoids `Featured section` assets on articles.
- Configures `ALLOW_401=1` for protected previews.
- References: `ceo-magazine/scripts/smoke-check.js:57-74`, `75-112`.

## Common Commands
- `pnpm dev` — start dev server.
- `pnpm build` — build production artifacts.
- `pnpm start` — run production server locally.
- `pnpm run deploy:prod` — gated deploy with smoke checks.
- `pnpm sanity:deploy` — deploy Sanity Studio.

## Troubleshooting
- If preview is protected (401), smoke checks log and proceed when allowed.
- If install fails during deploy due to lockfile mismatch, run `pnpm install` locally to update the lockfile, then redeploy.
- If images look incorrect, verify hero invariants and aspect metadata memoization on the article page.

## Security & Compliance
- Robots and sitemap target `csuitemagazine.global` and include categories/articles.
- Headers and CSP guidance in `ceo-magazine/OPERATIONS_RUNBOOK.md:107`.
- Privacy: content page at `ceo-magazine/app/privacy/page.tsx` with effective date text.

