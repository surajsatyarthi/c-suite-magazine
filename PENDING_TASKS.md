# Pending Tasks — Master List

**Last updated:** 2026-04-08  
**Format:** Fixed — do not change column names or task ID scheme

---

## Task ID Scheme

Tasks are numbered **T-101, T-102, …** in permanent sequence.  
Numbers are never reused. Completed tasks keep their ID in the Completed table.  
New tasks are inserted in RICE-score order but keep the next available sequential ID.

---

## RICE Score Formula

**RICE = (Reach × Impact × Confidence) / Effort**

| Factor | Definition | Scale |
|--------|------------|-------|
| **Reach** | Users / page-views affected per month | Whole number estimate |
| **Impact** | How much it moves the needle per user | 3 = massive · 2 = high · 1 = medium · 0.5 = low · 0.25 = minimal |
| **Confidence** | How sure are we of the estimates | 0.9 = high · 0.8 = medium · 0.7 = some · 0.5 = low |
| **Effort** | Person-days to complete | Whole number |

Higher RICE = do first. Security tasks are **mandatory** regardless of score.

---

## Task Table

| ID | Task | Reach | Impact | Conf | Effort | **RICE** | Time | Status | Source |
|----|------|------:|-------:|-----:|-------:|---------:|------|--------|--------|
| **T-137** | ⚠️ MANDATORY SECURITY — Protect `/admin/*` routes — zero auth, anyone can access | 10 | 3 | 0.9 | 0.25 d | **108** | 2 h | 🔴 Open | Audit 2026-04-08 |
| **T-145** | ⚠️ MANDATORY SECURITY — Audit and scope Sanity write token permissions | 10 | 3 | 0.9 | 0.063 d | **429** | 30 m | 🔴 Open | Audit 2026-04-08 |
| **T-102** | ⚠️ MANDATORY SECURITY — `z.any()` in admin API route allows arbitrary payloads | 10 | 3 | 0.9 | 0.5 d | **54** | 30 min | ✅ N/A — referenced file never existed | `.agent/legacy_reports/LEGACY_AUDIT_BACKLOG.md` |
| **T-121** | Add slug indexes on `post`, `csa`, `category`, `writer` in Sanity Manage — biggest perf gain per effort on site | 5,000 | 1 | 0.9 | 0.031 d | **145,161** | 15 m | 🔴 Open | Audit 2026-04-08 |
| **T-122** | Push category filtering to GROQ on homepage — remove client-side filter that over-fetches all posts | 5,000 | 1 | 0.9 | 0.125 d | **36,000** | 1 h | 🔴 Open | Audit 2026-04-08 |
| **T-123** | Remove unused `systemLogType` Sanity schema — defined but never queried or populated | 5,000 | 0.25 | 0.9 | 0.031 d | **36,290** | 15 m | ✅ Done 2026-04-08 | Audit 2026-04-08 |
| **T-124** | Delete `lib/jules-client.ts` — 140 LOC, no imports anywhere in codebase | 5,000 | 0.25 | 0.9 | 0.031 d | **36,290** | 15 m | ✅ Done 2026-04-08 | Audit 2026-04-08 |
| **T-125** | `Promise.all()` on homepage parallel fetches — spotlight + executives fetched sequentially | 5,000 | 0.5 | 0.9 | 0.063 d | **35,714** | 30 m | ✅ Done 2026-04-08 | Audit 2026-04-08 |
| **T-126** | Add `.required()` validation to `writerType` `name` and `slug` fields in Sanity schema | 5,000 | 0.5 | 0.8 | 0.063 d | **31,746** | 30 m | ✅ Done 2026-04-08 | Audit 2026-04-08 |
| **T-117** | 🚨 NEXT SESSION — Sentry error monitoring — catch silent server errors & broken cached pages before readers do | 5,000 | 2 | 0.9 | 0.5 d | **18,000** | 2 h | 🔴 Open | Session 2026-04-07 |
| **T-127** | Merge `OptimizedImage` + `CXOOptimizedImage` — 80% identical, only differ on `quality` prop | 5,000 | 0.5 | 0.9 | 0.125 d | **18,000** | 1 h | ✅ Done 2026-04-08 | Audit 2026-04-08 |
| **T-128** | Add explicit `dynamicParams` config to all dynamic routes — currently implicit/inconsistent | 5,000 | 0.25 | 0.9 | 0.063 d | **17,857** | 30 m | ✅ Done 2026-04-08 | Audit 2026-04-08 |
| **T-129** | Delete `lib/articleImageService.ts` — 385 LOC, never imported anywhere | 5,000 | 0.25 | 0.9 | 0.063 d | **17,857** | 30 m | ✅ Done 2026-04-08 | Audit 2026-04-08 |
| **T-130** | Remove `lib/views.ts` + `IncrementViews` component — view tracking disabled per marketing policy | 5,000 | 0.25 | 0.9 | 0.063 d | **17,857** | 30 m | ✅ Done 2026-04-08 | Audit 2026-04-08 |
| **T-131** | Fix Navigation category fetch — refetches on every route change, no expiry on sessionStorage cache | 5,000 | 0.5 | 0.8 | 0.125 d | **16,000** | 1 h | 🔴 Open | Audit 2026-04-08 |
| **T-132** | Cache search API results — `revalidate: 0` hits Sanity live on every identical search query | 1,000 | 0.5 | 0.9 | 0.031 d | **14,516** | 15 m | ✅ Done 2026-04-08 | Audit 2026-04-08 |
| **T-101** | OG / social share preview shows favicon instead of article hero image | 5,000 | 2 | 0.9 | 1 d | **9,000** | 1 h | 🔴 Open | New |
| **T-135** | Consolidate 4 Sanity clients (`sanity.ts`, `sanity.server.ts`, `sanity.admin.ts`, `sanityWrite.ts`) into one file | 5,000 | 0.5 | 0.8 | 0.25 d | **8,000** | 2 h | 🔴 Open | Audit 2026-04-08 |
| **T-133** | Convert `Navigation` from `'use client'` to server component — only reads data, adds unnecessary JS bundle | 5,000 | 2 | 0.7 | 1 d | **7,000** | 8 h | 🔴 Open | Audit 2026-04-08 |
| **T-134** | Fix `IncrementViews` race condition — view count lost if user navigates away before fetch completes | 5,000 | 0.25 | 0.7 | 0.125 d | **7,000** | 1 h | ✅ N/A — IncrementViews deleted (T-130) | Audit 2026-04-08 |
| **T-136** | Add 300ms debounce to Search component — fires `/api/search` on every keystroke | 1,000 | 1 | 0.8 | 0.125 d | **6,400** | 1 h | 🔴 Open | Audit 2026-04-08 |
| **T-105** | Issue #22 — Backfill `spotlightImage` for 186 articles missing it | 5,000 | 1 | 0.8 | 1 d | **4,000** | 1 h | 🟡 Awaiting approval | `issues/issue-22-rfc.md` |
| **T-138** | Tighten CSP headers — `unsafe-eval` and `unsafe-inline` currently allowed for scripts | 5,000 | 0.5 | 0.7 | 0.375 d | **4,667** | 3 h | 🔴 Open | Audit 2026-04-08 |
| **T-139** | Replace manual carousel in `AdInterstitialV2` with Swiper — reinvents carousel state management | 5,000 | 0.5 | 0.7 | 0.5 d | **3,500** | 4 h | 🔴 Open | Audit 2026-04-08 |
| **T-140** | Remove `spotlightImage` field from `postType` — duplicates `mainImage`, CSS crop is sufficient | 5,000 | 0.25 | 0.7 | 0.25 d | **3,500** | 2 h | 🔴 Open | Audit 2026-04-08 |
| **T-141** | Move photo credit to Sanity image object — currently prop-drilled through components | 5,000 | 0.25 | 0.7 | 0.25 d | **3,500** | 2 h | 🔴 Open | Audit 2026-04-08 |
| **T-142** | Add `LIMIT 10` to compensation CTE in SQL — fetches all fiscal years per executive | 500 | 1 | 0.8 | 0.125 d | **3,200** | 1 h | 🔴 Open | Audit 2026-04-08 |
| **T-143** | Extract shared fields from `postType`/`csaType` into base type — nearly identical schemas duplicated | 5,000 | 0.5 | 0.6 | 0.75 d | **2,000** | 6 h | 🔴 Open | Audit 2026-04-08 |
| **T-144** | Rate-limit search API — no throttle on `/api/search`, can be abused | 500 | 0.5 | 0.8 | 0.125 d | **1,600** | 1 h | 🔴 Open | Audit 2026-04-08 |
| **T-106** | Issue #10 — Gate 10 Watchtower (24 h monitoring, views metadata) | 1,000 | 0.5 | 0.8 | 0.5 d | **800** | 15 min | 🕐 Time-gated | `issues/issue-10-progress-table.md` |
| **T-107** | Issue #26 — Gate 10 Watchtower (24 h monitoring, tsconfig perf) | 1,000 | 0.5 | 0.8 | 0.5 d | **800** | 15 min | 🕐 Time-gated | `issues/issue-26-progress-table.md` |
| **T-118** | Executive hub page — add pagination or hard row cap (currently fetches up to 10,000 rows unchecked) | 1,000 | 0.5 | 0.8 | 0.5 d | **800** | 2 h | 🔴 Open | Session 2026-04-07 |
| **T-103** | Permanent documentation system — every issue, feature, PRD, and decision traceable for 10 years | 5,000 | 2 | 0.7 | 10 d | **700** | 2 w | 🔴 Open | New |
| **T-104** | Fix 14 broken links found by The Spider (Issue #35) | 200 | 2 | 0.9 | 2 d | **180** | 2 h | 🔴 Open | `ISSUE_32_LOG.md` |
| **T-119** | Neon HTTP client has no transaction support — document limitation and define pattern before first use | 100 | 1 | 0.7 | 1 d | **70** | 1 h | 🔴 Open | Session 2026-04-07 |
| **T-150** | Rename `lib/articleHelpers.ts` to clarify domain responsibility | 10 | 0.25 | 0.9 | 0.031 d | **72** | 15 m | 🔴 Open | Audit 2026-04-08 |
| **T-149** | Rename `lib/security-pure.ts` → `sanitize.ts`, remove `security.ts` re-export wrapper | 10 | 0.25 | 0.9 | 0.063 d | **36** | 30 m | 🔴 Open | Audit 2026-04-08 |
| **T-111** | Alpha Protocol — Formalise TDD evidence (save failure log before commit) | 20 | 1 | 0.6 | 1 d | **12** | 1 h | 🔴 Open | `.agent/suggested_improvements.md` |
| **T-112** | Delete deprecated protocol documents (see SUPREME_RALPH_CONSTITUTION) | 10 | 0.5 | 0.9 | 0.5 d | **9** | 15 min | 🔴 Open | `SUPREME_RALPH_CONSTITUTION.md` |
| **T-113** | Issue #32 — Close Spider: proceed to Phase 3 verification | 10 | 0.5 | 0.9 | 0.5 d | **9** | 15 min | 🟡 Awaiting permission | `ISSUE_32_LOG.md` |
| **T-146** | Archive one-off scripts into `/scripts/archive/` with date prefix — 290 undocumented scripts at root | 10 | 1 | 0.9 | 0.375 d | **24** | 3 h | 🔴 Open | Audit 2026-04-08 |
| **T-108** | Alpha Protocol — Create `scripts/validate-env.ts` pre-flight check | 10 | 1 | 0.7 | 1 d | **7** | 1 h | 🔴 Open | `.agent/suggested_improvements.md` |
| **T-109** | Alpha Protocol — Stop-the-line: abort test runner after 2 failures | 20 | 1 | 0.6 | 2 d | **6** | 2 h | 🔴 Open | `.agent/suggested_improvements.md` |
| **T-110** | Alpha Protocol — Add `npm run gate:check` CI/CD script | 20 | 1 | 0.6 | 2 d | **6** | 2 h | 🔴 Open | `.agent/suggested_improvements.md` |
| **T-147** | Add `/scripts/README.md` documenting all active scripts and their purpose | 10 | 0.5 | 0.9 | 0.25 d | **18** | 2 h | 🔴 Open | Audit 2026-04-08 |
| **T-148** | Extract shared Sanity client setup into `/scripts/lib/sanity-utils.ts` — duplicated across ~20 scripts | 10 | 0.5 | 0.8 | 0.25 d | **16** | 2 h | 🔴 Open | Audit 2026-04-08 |
| **T-115** | Add TSDoc to 4 admin route files | 10 | 0.25 | 0.9 | 1 d | **2** | 45 min | 🔴 Open | `.agent/legacy_reports/LEGACY_AUDIT_BACKLOG.md` |
| **T-114** | Alpha Protocol — Add `npm run gate:debug` auto-generator | 20 | 0.5 | 0.5 | 3 d | **2** | 3 h | 🔴 Open | `.agent/suggested_improvements.md` |
| **T-120** | Migrate 8 data-import scripts from `@vercel/postgres` to `@neondatabase/serverless` | 5 | 0.25 | 0.9 | 1 d | **1** | 1 h | 🔴 Open | Session 2026-04-07 |

---

## Task Details

### T-121 — Add Sanity Slug Indexes

**Why:** Every slug-based page lookup (`*[_type == "post" && slug.current == $slug]`) does a full collection scan. With hundreds of articles this is the single cheapest performance improvement available.  
**Fix:** Go to Sanity Manage → API → Indexes → Add index on `slug.current` for `post`, `csa`, `category`, `writer` document types.  
**Time:** 15 minutes in the Sanity web dashboard — no code change.

---

### T-125 — Promise.all on Homepage

**File:** [app/page.tsx](app/page.tsx)  
**Problem:** `spotlightItems` and `topExecutives` are awaited sequentially. If each takes 200ms, the page waits 400ms. Parallelising saves ~200ms on every homepage render.  
**Fix:**
```ts
const [spotlightItems, topExecutives] = await Promise.all([
  getSpotlightItems(),
  getAllExecutivesWithCompensation(3)
])
```

---

### T-127 — Merge OptimizedImage Components

**Files:** [components/OptimizedImage.tsx](components/OptimizedImage.tsx) and [components/CXOOptimizedImage.tsx](components/CXOOptimizedImage.tsx)  
**Problem:** ~80% identical code including shimmer logic and placeholder handling. Only difference is default `quality` value (85 vs 95).  
**Fix:** Add `quality` prop with default to `OptimizedImage`, update all `CXOOptimizedImage` call sites to use `<OptimizedImage quality={95} ...>`, delete `CXOOptimizedImage.tsx`.

---

### T-133 — Convert Navigation to Server Component

**File:** [components/Navigation.tsx](components/Navigation.tsx)  
**Problem:** Marked `'use client'` but its primary job is rendering a nav with categories fetched from API. Every page load bundles the full Navigation JS. Moving the data-fetch to server reduces JS on all pages.  
**Complexity:** High — Navigation has mobile menu toggle, country selector, scroll-based style changes, active route highlighting. Only the interactive parts need to remain client components; the shell and data fetch can be server-side.  
**Approach:** Server shell with client islands for mobile toggle + country selector.

---

### T-137 — Protect Admin Routes ⚠️ Mandatory Security

**Files:** `app/admin/page.tsx`, `app/admin/images/page.tsx`, `app/admin/flag-duplicates/page.tsx`  
**Problem:** Zero authentication. Any visitor who guesses `/admin` has full access.  
**Fix:** Add `middleware.ts` rule to check for `Authorization: Bearer <ADMIN_TOKEN>` header on all `/admin/*` routes. Store token in Vercel env as `ADMIN_SECRET`. Redirect unauthenticated requests to `/`.

---

### T-143 — Extract postType/csaType Shared Base

**Problem:** `postType.ts` and `csaType.ts` are nearly identical. Every schema change must be applied twice. Risk of drift.  
**Fix:** Extract common fields (`title`, `slug`, `mainImage`, `excerpt`, `publishedAt`, `writer`, `categories`, `tags`, `readTime`, `isHidden`, `seo`) into `baseArticleType.ts`. Both `postType` and `csaType` spread from it and add their unique fields.  
**Risk:** Medium — requires testing all Sanity Studio edit forms still work correctly after refactor.

---

### T-101 — OG Social Share Image

**Problem:** When an article URL is shared (WhatsApp, Twitter, LinkedIn, Slack), the preview shows the site favicon instead of the article hero image.  
**Root cause:** `generateMetadata` in `app/csa/[slug]/page.tsx` (lines 1251–1255) passes `mainImage.asset.url` to `generateSEOMetadata`, but the GROQ query fetches `mainImage { asset { _ref } }` — a Sanity reference, not a resolved URL. When `.asset.url` is undefined the `og:image` falls back and scrapers show the favicon.  
**Fix:** In `getPost()` GROQ query, change `mainImage { asset }` → `mainImage { asset->{ url, metadata } }`.  
**Affected pages:** All CSA, interview, and juggernaut article pages.

---

### T-102 — Security Fix ⚠️ Mandatory

**File:** `src/app/api/admin/matches/route.ts`  
**Fix:** Replace `z.any()` with `z.unknown()` or a strict schema such as `z.record(z.string())`.  
**Note:** Low RICE score because admin-only reach, but security issues are non-negotiable — fix before next deploy.

---

### T-103 — Permanent Documentation System

**Problem:** C-Suite Magazine is a 10+ year production site. Decisions, features, and issues are currently scattered across `.agent/`, `issues/`, root markdown files, git commits, and chat logs. A developer or QA joining in 2028 cannot trace why a feature was built, what a commit fixed, or what the original PRD said.

**Goal:** Any developer or QA — now or in 10 years — should be able to:
1. Find the PRD or brief for any feature
2. Trace any commit back to a task ID (T-101 etc.)
3. Read the rationale for any architectural or product decision
4. See the full history of any article, ad, or CMS change
5. Onboard without asking anyone

**What needs to be built:**

| Layer | What | Where |
|-------|------|-------|
| Task registry | This file (`PENDING_TASKS.md`) + task IDs on all commits | Project root |
| Feature docs | One markdown per major feature: what it does, why it exists, how it works | `docs/features/` |
| Architecture Decision Records (ADRs) | Short docs for non-obvious technical choices | `docs/decisions/` |
| PRD archive | Product requirement docs for all past and future features | `docs/prd/` |
| Issue log | Past issues with root cause, fix, and lesson learned | `docs/issues/` |
| Runbook | Deploy, rollback, Sanity content update, broken build fix | `docs/runbook.md` |
| Onboarding guide | Step-by-step for a new developer to be productive in 1 day | `docs/onboarding.md` |
| Commit convention | Every commit must reference a task ID: `feat(T-101): fix og:image` | `CONTRIBUTING.md` |

**Acceptance criteria:**
- [ ] `docs/` folder structure created with a README index
- [ ] Commit convention documented and enforced via pre-commit hook
- [ ] Top 5 features have a feature doc
- [ ] At least 3 key architectural decisions have ADRs
- [ ] Runbook covers: deploy, rollback, Sanity update, broken build fix
- [ ] Onboarding guide tested end-to-end

**Effort estimate:** ~2 working weeks (structure + templates: 2 days · feature docs + ADRs: 1 week · runbook + onboarding: 3 days)

---

### T-117 — Sentry Error Monitoring 🚨 Next Session

**Why this exists:** All `revalidate` values were bumped to 1 week on 2026-04-07. This is the right call given the deploy-on-publish workflow, but it introduces one uncontrollable risk: if Sanity has a brief outage at the exact moment a page regenerates, the broken/empty state gets cached and served to readers for up to a week with nobody knowing. Currently there is zero server-side error visibility in production.

**Current state:** `NEXT_PUBLIC_SENTRY_DSN=` exists as a commented-out placeholder in `.env.example` — Sentry was planned but never wired up.

**What to build:**
1. Install `@sentry/nextjs`
2. Run `npx @sentry/wizard@latest -i nextjs` to generate `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
3. Add `NEXT_PUBLIC_SENTRY_DSN` to `.env.local` and Vercel environment variables
4. Wrap key data-fetch functions (`getAllExecutivesWithCompensation`, Sanity fetches) with Sentry breadcrumbs so broken renders are traceable
5. Set up a Sentry alert to email/Slack when a server error occurs in production
6. Move Guardian slow-query `console.warn` to Sentry performance transaction in production

**Acceptance criteria:**
- [ ] Sentry DSN configured in Vercel env vars
- [ ] Server-side errors surface in Sentry dashboard within 60 seconds
- [ ] At least one alert rule: email on any unhandled server error
- [ ] Guardian performance warnings visible in Sentry in production
- [ ] Tested by intentionally throwing an error in a server component

---

### T-116 — Contact Form Spam Protection ✅ Completed 2026-04-07

**Trigger:** SEO cold-spam received via the contact form from "Georgia Smith / Get on Globe" — classic template offering Google 1st-page rankings. Once a working form endpoint is discovered by scrapers, volume escalates rapidly.

**Problem:** `app/actions/contact.ts` had zero spam protection. The form accepted every submission and forwarded it to `csuitebrandagency@gmail.com` with no filtering, rate limiting, or bot detection.

**Root cause:** Form was built for MVP launch and never hardened. No CAPTCHA, no honeypot, no timing check, no keyword filter, no rate limiting.

**Solution — 4-layer defence, no external services, zero friction for real leads:**

| Layer | Mechanism | Where |
|-------|-----------|-------|
| 1. Honeypot | Hidden `website` field placed off-screen via CSS (not `display:none` — bots detect that). Real users never see or fill it. Bots auto-fill it. Server silently accepts the request so bots don't retry with a different approach. | `app/contact/page.tsx` + `app/actions/contact.ts` |
| 2. Timing check | `_loadedAt` hidden input set to `Date.now()` on client mount via `useEffect`. Server rejects submissions arriving in under 3 seconds (bot behaviour). Silent accept so bots don't adapt. | Same |
| 3. Rate limiting | In-memory `Map` keyed by IP (`x-forwarded-for` / `x-real-ip`). Max 3 submissions per IP per hour. Returns a visible error (not silent) so legitimate users who hit the limit get clear feedback. | `app/actions/contact.ts` |
| 4. Keyword filter | 18 phrases extracted from the spam template and known SEO cold-outreach scripts (e.g. `"1st page"`, `"rank your website"`, `"wa.me"`, `"toll free"`). Checked against `subject + message + company`. Silent accept. | `app/actions/contact.ts` |

**Files changed:**
- [app/actions/contact.ts](app/actions/contact.ts) — all server-side checks
- [app/contact/page.tsx](app/contact/page.tsx) — honeypot field + `_loadedAt` hidden input

---

### T-104 — Broken Links

Run `npx tsx scripts/the-spider.ts` to get the current live list (14 confirmed at last run), then fix or add Next.js redirects in `next.config.js` for each 404.

---

### T-108 — Env Validation Pre-flight *(scope updated 2026-04-07)*

Create `scripts/validate-env.ts` that checks all required environment variables at startup and fails fast with a clear message.

**Must include** (updated after Neon migration):
- `POSTGRES_URL_NON_POOLING` — required by `lib/db.ts`; missing = silent runtime crash at module load
- `POSTGRES_URL` — still used by data-import scripts
- `EMAIL_USER`, `EMAIL_PASS` — contact form
- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` — CMS
- Any other vars currently using `!` non-null assertions in the codebase

**Why the urgency on `POSTGRES_URL_NON_POOLING`:** `lib/db.ts` throws `Error('[db] POSTGRES_URL_NON_POOLING is not set')` if missing — but only at the moment the module is first imported (first DB query). This means a missing env var on a new deployment won't surface until a visitor hits a page that queries the database. Validate at startup instead.

---

### T-118 — Executive Hub Page Row Cap

**File:** [app/executive-salaries/page.tsx](app/executive-salaries/page.tsx)

**Problem:** Calls `getAllExecutivesWithCompensation()` with the default limit of 10,000. As more executives are added to the database this query grows silently with no ceiling. With 1-week ISR cache this runs once a week — acceptable today, but a time bomb as the dataset grows.

**Fix options (pick one):**
1. Add server-side pagination — pass `page` and `pageSize` params, render one page at a time
2. Hard cap at a reasonable number (e.g. 500) and add a "load more" button
3. Add a database index on `total_compensation DESC` so the query stays fast even at scale

**Recommended:** Option 1 (pagination) — gives readers a better experience and keeps query cost flat regardless of dataset size.

---

### T-119 — Neon HTTP Client: No Transaction Support

**Context:** `@neondatabase/serverless` uses HTTP mode (`neon()`). HTTP mode does not support database transactions. If you need to write to two tables atomically (e.g. insert an executive AND their compensation record and roll back both if either fails), the current client cannot do this.

**Today's risk:** Zero — no transactions are used anywhere in the codebase.

**Future risk:** Any feature that writes to multiple tables (e.g. a CMS-triggered executive import, or updating both `executives` and `compensation` in one operation) will silently lose data integrity if one write succeeds and the other fails.

**Fix when needed:** Switch `getAllExecutivesWithCompensation` and any write functions to use `@neondatabase/serverless` Pool mode instead of `neon()`:
```ts
import { Pool } from '@neondatabase/serverless'
const pool = new Pool({ connectionString: process.env.POSTGRES_URL_NON_POOLING })
// pool supports transactions via pool.connect() → client.query('BEGIN') etc.
```

**Action:** Before building any feature that writes to multiple tables, review this task first.

---

### T-120 — Migrate Data-Import Scripts to `@neondatabase/serverless`

**Why:** `@vercel/postgres` is officially deprecated (confirmed by deprecation warning during `pnpm install` on 2026-04-07). The package is kept in `package.json` solely because 8 scripts still import from it.

**Scripts to update:**
- `scripts/data-import/add-9-executives.ts`
- `scripts/data-import/add-tim-cook-profile-image.ts`
- `scripts/data-import/add-tim-cook-5years.ts`
- `scripts/data-import/add-5year-compensation-all-9-executives.ts`
- `scripts/data-import/import-executives.ts`
- `scripts/migrations/run-migration.ts`
- `scripts/add-elon-musk.ts`
- `scripts/check-executives.ts`

**These are one-off historical data-import scripts** — they populated the database and are unlikely to be run again. Low urgency. Once migrated, `@vercel/postgres` can be removed from `package.json` entirely.

**Note:** Migration scripts need TCP/pool support for transactions — use `Pool` from `@neondatabase/serverless`, not `neon()`.

---

## Completed

| ID | Task | Completed |
|----|------|-----------|
| — | Issue #21 Phase 1 — Dynamic Metadata Debt | 2026-01-25 |
| — | Issue #21 Phase 2 — Data Fortification (206 articles backfilled) | 2026-01-25 |
| — | Mahesh Kumar / Tiger Analytics — AEO v3 body patch to Sanity | 2026-04-02 |
| — | Remove Antigravity static route override for mahesh-kumar-tiger-analytics | 2026-04-02 |
| — | Gold branding on table header, Key Takeaways h2, FAQ h2 | 2026-04-02 |
| **T-116** | Contact form spam protection — honeypot, timing check, keyword filter, rate limit | 2026-04-07 |
| — | Vercel CPU + Neon compute overrun — all `revalidate` values bumped to 604800, deploy-on-publish SOP established | 2026-04-07 |
| — | Neon DB client migration — `@vercel/postgres` → `@neondatabase/serverless`, direct URL, homepage query 10k → 3 rows | 2026-04-07 |
| — | Popup ads migrated to Sanity — IBM watsonx + Luxwing uploaded, `PopupAdsProvider` + `ScrollTriggerAdProvider` created, dead code removed | 2026-04-07 |
