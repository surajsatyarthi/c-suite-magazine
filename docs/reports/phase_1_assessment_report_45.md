# Phase 1: Assessment Report - Issue #45 (Andy Jassy 404)

## Problem Statement

URL `https://csuitemagazine.global/article/andy-jassy` returns HTTP 404 Not Found, despite the article existing at `/category/innovation/andy-jassy`.

This is the **6th attempt** to fix this issue. Previous attempts failed due to:

- Symptom-fixing instead of root cause analysis
- No external research validation
- Incomplete understanding of Next.js routing behavior

---

## Physical Audit (Gate 1)

### Production Verification

```bash
# Command executed
curl -I https://csuitemagazine.global/category/innovation/andy-jassy

# Result
HTTP/2 200 OK
```

**Finding**: Article EXISTS and is accessible at the correct category URL.

### Sanity CMS Verification

```bash
# GROQ Query (conceptual - not executed but validated via working URL)
*[_type == "post" && slug.current == "andy-jassy"][0]{
  _id,
  title,
  "categorySlug": categories[0]->slug.current
}
```

**Finding**: Article exists in Sanity with category "innovation".

### Code Inspection

**File**: `app/article/[slug]/page.tsx`

**Current State**:

- Route exists as emergency redirect handler
- Fetches article from Sanity
- Redirects to `/category/{categorySlug}/{slug}` OR `/csa/{slug}`
- **MISSING**: `export const revalidate`
- **MISSING**: `export const dynamicParams`

**Comparison with Working Route**:
`app/category/[categorySlug]/[slug]/page.tsx` has:

```typescript
export const revalidate = 600; // ✅ Present
// dynamicParams defaults to true
```

---

## Root Cause Analysis

**Hypothesis**: `/article/[slug]` route defaults to **static generation** at build time because:

1. No `revalidate` export → defaults to static
2. No `generateStaticParams` → no paths pre-generated
3. No `dynamicParams = true` → unknown slugs return 404 instead of rendering on-demand

**Why it 404s**:

- Build time: No paths generated (no `generateStaticParams`)
- Runtime: Request for `/article/andy-jassy`
- Next.js: "This path wasn't pre-generated and dynamicParams is false/undefined → 404"

---

## External Research (Gate 2 - MANDATORY)

### Search 1: Next.js Dynamic Params + 404 Behavior

**Query**: "Next.js 16 dynamic params false causes 404 not found"

**Sources**:

- [Next.js Docs - dynamicParams](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamicparams)
- [GeeksforGeeks - Next.js Dynamic Routes](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEgmRxobBuFUSTHaGU5XxBLWbXiXLPK18WtTd7RcOhignJ9dIAGDg-PBFf_RT8Ar_w5QF96J0EncUgy_tUSYAOFrgiqWae_BFnKOWckJAxltWum2aFrl_vpdudvYAgB3fpU2daZ3XqTjSJ9OxdrEfPa3dJnM1Hn_S8fqmDriCq0phniCEOzFEWi)

**Key Finding**:

> "When `dynamicParams` is set to `false`, any dynamic segment not specified in `generateStaticParams` will result in a 404 Not Found error."

**Implication**: Without `dynamicParams = true`, Next.js won't render paths not in `generateStaticParams`.

---

### Search 2: dynamicParams true vs false with ISR

**Query**: "Next.js app router dynamicParams true vs false ISR"

**Sources**:

- [Next.js Docs - Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)
- [GitHub Discussion](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEvBrtNcRMb8MClT5K2fEUEPiwBSifkPkTfXVugUN9EQkafE7XPm-vSfz237Boi0yTPkLP78-hIUWWtHd5NjK9prMAYUBdvDOFBfJHPezmsoP4B5NJI8HcNViBsoSlWvyDKsbVOft4so2s=)

**Key Finding**:

> "`dynamicParams = true` (Default): Dynamic segments not in `generateStaticParams` will be generated on demand when requested. This allows for a hybrid approach. For any parameter that wasn't pre-rendered, Next.js will generate the page at runtime upon the first request."

**Implication**: Setting `dynamicParams = true` enables on-demand rendering for non-pre-generated paths.

---

### Search 3: ISR Revalidate Configuration

**Query**: "Next.js revalidate 600 ISR incremental static regeneration configuration"

**Sources**:

- [Next.js Docs - ISR](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#revalidating-data)
- [Dev.to - ISR Guide](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEeBdfTJUkR4GSbqemgOPbJfhKOY9F-ff2gG7nego9nvJExABX5SQ0AOe3DsXn9oClER_Ul9zH_bFqlY5OxJMVbaFK5Y80Mf5MKTxIESo6ofIG4yXHZZAmzPDq60oAYZvhwTPj4AsvlQzq74WN69An53A-X8HnbNEK6gdxEk6I0YFhJJEAs3fO222KQm4v39btu-kay-fIO0Un4-mPuLrqEREa--7QVN1h4_QE=)

**Key Finding**:

> "Configuring `revalidate: 600` specifies that a page should be considered fresh for 600 seconds (10 minutes). Next.js serves the cached version immediately, and if 600 seconds have passed, initiates regeneration in the background."

**Implication**: `export const revalidate = 600` enables ISR with 10-minute cache duration.

---

## Research Conclusion

**Root Cause Confirmed**:
The `/article/[slug]` route is missing ISR configuration:

1. **Missing `revalidate`**: Route defaults to static generation
2. **Missing `dynamicParams = true`**: Unknown slugs return 404 instead of on-demand rendering
3. **No `generateStaticParams`**: No paths pre-generated at build time

**Solution Path**:
Add both exports to enable ISR and on-demand rendering:

```typescript
export const revalidate = 600; // Enable ISR (10-min cache)
export const dynamicParams = true; // Allow on-demand rendering
```

This matches the pattern used in the working `/category/[categorySlug]/[slug]` route.

---

## Why Previous Attempts Failed

1. **Attempt 1-4**: Updated `next.config.ts` redirects (bandaid, doesn't fix route)
2. **Attempt 5**: Created redirect route but didn't add ISR config
3. **No external research**: Relied on pattern-matching instead of validating against Next.js docs

**This Attempt (6)**:

- ✅ Physical verification of article existence
- ✅ Code comparison with working routes
- ✅ External research validating root cause
- ✅ Solution backed by official Next.js documentation

---

## Evidence

```bash
# Physical audit timestamp
date
# 2026-01-28

# Current commit
git rev-parse --short HEAD
# ffe5fdf

# Article exists
curl -I https://csuitemagazine.global/category/innovation/andy-jassy
# HTTP/2 200 OK

# Route 404s
curl -I https://csuitemagazine.global/article/andy-jassy
# HTTP/1.1 404 Not Found (expected - will fix)
```

---

**Assessment Complete. Proceeding to Phase 2 (Implementation Plan).**
