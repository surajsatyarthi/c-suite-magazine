# Phase 1 Assessment Report: Issue #35 (Prod Link Rot)

**Date**: 2026-01-22
**Priority**: P0 (Critical Web Integrity)
**Status**: 🔴 Identified

---

## 1. Executive Summary

"The Spider" (v2.0) detected **14 Broken Links** on the production environment.
Analysis confirms these are caused by two distinct issues:

1.  **Code Defect (13 Links)**: Malformed URL construction in `ArchiveFilters.tsx` introducing illegal spaces (e.g., `/ category /`).
2.  **Data/Config Defect (1 Link)**: The `/category/cxo-interview` page returns 404, despite being a valid routing target for articles.

## 2. Findings & Root Cause Analysis

### Deficiency A: Malformed Link Construction (13 URLs)

**Defect**:
URLs are being generated with spaces, causing 404s when accessed by strict clients (like the Spider).
Examples:

- `https://csuitemagazine.global/ category / opinion/...`
- `https://csuitemagazine.global/ archive ? category = ...`

**Root Cause**:
In `components/ArchiveFilters.tsx`, whitespace was erroneously added to template literals.

**Location**:

- Line 42: ``router.push(`/ archive ? category = ${encodeURIComponent(newCategory)} `)``
- Line 153: ``<Link href={... return `/ category / ${cat}/${slug}` ...} ...>``

**Resolution**:
Refactor code to remove spaces.

### Deficiency B: Missing Category Page (1 URL)

**Defect**:
`https://csuitemagazine.global/category/cxo-interview` fails with 404.

**Observations**:

- Articles within this category work fine (e.g., `/category/cxo-interview/brianne-howey` -> 200).
- The `app/category/[categorySlug]/page.tsx` has logic to redirect 'interview' -> 'cxo-interview'.
- However, `cxo-interview` likely does not exist as a `category` document in Sanity, so it might not be generated in `staticParams`.

**Root Cause**:
Likely a "Ghost Category". Articles use it as a slug, but the category document itself is missing or unpublished in Sanity. The fallback render logic in `page.tsx` _should_ handle this, but might be failing during strict static generation or ISR.

**Resolution**:

1.  Verify strict routing logic.
2.  Ensure `cxo-interview` exists in Sanity or allow dynamic fallback to work correctly.

## 3. Remediation Plan

1.  **Code Fix**: Patch `components/ArchiveFilters.tsx` (Remove spaces).
2.  **Data Fix**: Create/Verify `cxo-interview` category in Sanity OR ensure `page.tsx` handles the missing doc gracefully.
3.  **Cleanup**: Delete `e2e.yml` as requested (Issue #36).

## 4. Verification

- **Automated**: Run `scripts/the-spider.ts` locally after fixes. Expect 0 broken links.
- **Manual**: Verify `/category/cxo-interview` renders a valid page (even if fallback).
