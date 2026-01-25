# Phase 1: Assessment Report (Issue #43 EXT - Ghost Links)

## 1. Objective

Identify the root cause of multiple 404 routes for high-revenue articles (Rich, Stella, Sukhinder) and correct the protocol breach occurred during the initial fix attempt.

## 2. Root Cause Analysis (RCA)

- **Technical Failure**: Components (`CategoryClient`, `ReadMoreArticles`, `SpotlightsWidget`) are manually constructing URLs using `/category/${cat}/${slug}`.
- **Data Conflict**: Articles of type `csa` (Company Sponsored) are intended to reside at `/csa/${slug}` as per the Central Ralph Resolver (`lib/urls.ts`).
- **Protocol Failure**: ENTERED EXECUTION mode without a finalized Phase 1 Report. Resulted in a botched edit at `CategoryClient.tsx:144` causing lint errors and invalid code structure.

## 3. Evidence (Ground Truth)

```bash
date
# Sat Jan 24 22:15:45 IST 2026
git rev-parse --short HEAD
# 2883f3e
grep -n "href={`/category/" app/category/[categorySlug]/CategoryClient.tsx
# 146:                                    href={`/category/${category.slug.current}/${post.slug.current}`}
```

## 4. Constraint Checklist

- [ ] Mini-PRD created at `docs/prd/ghost-links-fix.md` ✅ (Already exists)
- [ ] Phase 1 Report created (This document)
- [ ] Assumption Scanner run before commit
- [ ] Zero "any" types or unhandled failures

## 5. Proposed Remediation

1.  **Clean State**: Revert/Fix the botched `CategoryClient.tsx` change.
2.  **Centralization**: Enforce `getArticleUrl` in:
    - `app/category/[categorySlug]/CategoryClient.tsx`
    - `components/ReadMoreArticles.tsx`
    - `app/category/[categorySlug]/[slug]/page.tsx` (Related Articles section)
3.  **Verification**: Final Spider scan must show 0 404s for these articles.
