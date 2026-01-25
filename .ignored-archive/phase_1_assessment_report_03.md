# Phase 1 Assessment Report: Issue #3 - Missing Spotlight Overlays

## 1. Issue Description

**Problem**: Spotlight images on the homepage (CXO Interviews) are missing their text overlays ("Exclusive Interview", "Executive Insights", etc.). They appear as raw portraits.
**Reported By**: User (Priority: P0 - Critical Brand Defect).
**Initial Diagnosis**: User suspected data migration issue.

## 2. Research & Analysis

**Investigation Steps**:

1.  Analyzed `components/SpotlightsWidget.tsx`:
    - **Finding**: The component queries `mainImage` directly. It **ignores** the `spotlightImage` field entirely in its GROQ query.
    - **Code Evidence**:
      ```typescript
      const query = `*[_type == "post" ... ] | ... { title, mainImage, ... }`;
      ```
2.  Analyzed Sanity Schema (`sanity/schemaTypes/postType.ts`):
    - **Finding**: The `spotlightImage` field IS defined in the schema (lines 85-96).
3.  Diagnosed Data State (`scripts/diagnose_widget_data.js`):
    - **Finding**: 8 out of the top 10 recent CXO articles **ALREADY HAVE** the `spotlightImage` populated in Sanity.
    - Examples Present: Rich Stinson, Sukhinder Singh, Pankaj Bansal.
    - Examples Missing: John Farahi, Bob Bagby (no source assets found for these either).

## 3. Root Cause

The primary root cause is **CODE**, not data.
While some data gaps exist (2/10), the vast majority of articles have the correct data (the overlay image), but the **frontend code explicitly requests and renders the raw `mainImage`**.

## 4. Proposed Solution

### A. Frontend Fix (Primary)

Modify `components/SpotlightsWidget.tsx` to:

1.  Update GROQ query to fetch `spotlightImage`.
2.  Update render logic to use `coalesce(spotlightImage, mainImage)`.

### B. Data Synchronization (Secondary)

Run `scripts/upload-spotlight-images.js` to ensure any loose files in `public/Featured section` are synced to Sanity.

- _Note_: John Farahi and Bob Bagby are missing source files, so they will fallback to `mainImage` (raw), which is acceptable behavior for now.

## 5. Verification Plan

1.  **Automated**: Run `check-spotlight-data.js` to confirm data presence.
2.  **Visual**: The `SpotlightsWidget` should now render the overlay version for the 8/10 articles.
3.  **Regression**: Update `tests/e2e/visual-regression.spec.ts` if needed (though dynamic content makes this hard, we can check for the presence of the specific image URL pattern if possible).

## 6. Risk Assessment

- **Low Risk**: This is a purely additive change to the query. Fallback to `mainImage` preserves current behavior if `spotlightImage` is missing.
