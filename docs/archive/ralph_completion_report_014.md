# Ralph Remediation Report: Issue #21 (Dynamic Metadata Debt)

## Problem Statement

`readTime` and `heroTagline` were being calculated at runtime for every article, increasing server-side execution time and complicating client-side bundle logic.

## Assessment & Findings

- Article metadata was inconsistent across the database.
- Runtime calculations contributed to "Dynamic Debt" (Issue #21).

## Remediation Actions

1. **Schema Update**: Added `heroTagline` field to `postType.ts` and `csaType.ts`. Verified existing `readTime` field.
2. **Master Migration**: Executed `scripts/backfill-data-integrity.ts` to process all 205 articles.
3. **Data Persistence**: Successfully populated `readTime` (calculated via `calculateReadingTime`) and `heroTagline` (generated via `getHeroTagline`) into Sanity.

## Verification Result

- ✅ **Sanity Coverage**: 100% of articles (205/205) now have persisted metadata.
- ✅ **Performance**: Rendering now retrieves static fields instead of triggering runtime logic.

## Prevention Strategy

Sanity Studio now includes designated fields for this metadata, making them part of the standard editorial workflow rather than runtime calculations.
