# Ralph Protocol: Phase 1 Assessment Report (Issue #47)

**Task**: Resolve Mass Broken Link Rot ("The Shattered Web")
**Issue ID**: #47
**Priority**: P0
**Git HEAD**: `6dfaf4d`
**Status**: 🔴 BLOCKING REVIEW REQUIRED

---

## 1. Problem Deconstruction (Atomic Elements)

The Spider report identifies **210 broken links** (72% of crawled surface). Investigation reveals a multi-vector systemic failure:

### A. The "Article" Ghost (Routing Debt)

- **Finding**: `next.config.ts` refers to `/article/[slug]` in 3+ redirects.
- **Fact**: `app/article` directory does NOT exist.
- **Impact**: Any link or redirect targeting `/article/` is a guaranteed 404.

### B. Type-Route Collision (CSA vs Post)

- **Finding**: Site uses two rigid routes: `/csa/[slug]` for `csa` types and `/category/[cat]/[slug]` for `post` types.
- **Fact**: Many components (Archive, Juggernauts) do not discriminate types and link all content via `/category/`, which returns 404 for `csa` articles.

### C. Orphaned Writer Profiles

- **Finding**: `https://csuitemagazine.global/writer/benjamin-borketey` 404s.
- **Fact**: The writer record for "Benjamin Borketey" is missing or has a mismatched slug in Sanity, yet articles still reference it.

### D. Perspective Mismatch (The Ghost Content)

- **Finding**: Homepage links target articles that the article page 404s.
- **Fact**: `lib/sanity.server.ts` uses `perspective: 'published'` WITHOUT a token. If the dataset is private or articles are in a draft-published limbo, they disappear from the server while remaining in the unauthenticated `lib/sanity.ts` client.

---

## 2. Proposed Solution Pathway

I recommend a systemic realignment across three layers:

### Layer 1: Routing Realignment

- Implement a **301 Redirect Pattern** in `next.config.ts` that maps any `/article/:slug` to the correct category-based URL or CSA URL.
- Create a catch-all `/article/[slug]` route that dynamically identifies the document type (`post` or `csa`) and performs a server-side redirect to the correct functional route.

### Layer 2: Component Logic Fixes

- Update `ArchiveFilters.tsx` and `LatestInsights.tsx` to use a helper function that checks `_type` before generating the URL.

### Layer 3: Data Integrity Audit

- Run a Sanity migration to backfill missing writer profiles and fix orphaned references.

---

## 3. Verification Plan

### Automated Tests

- **The Spider (Full Site)**: Must return `<10` broken links (ignoring external social media).
- **The Eagle (Visual)**: Verify article page rendering for both `post` and `csa` types.

### Manual Verification

- Clicking "Benjamin Borketey" must load a profile or a graceful fallback.
- Clicking any article in the Archive must land on a 200 OK page.

---

I request permission to proceed to **Phase 2 (Execution)**.

**Signed,**
Antigravity (Strategic AI Executive Consultant)
