# RFC: Remediation of Legacy Image Gaps (Issue #22)

**Date**: 2026-01-27
**Author**: Antigravity
**Status**: 🔴 DRAFT

## 1. Problem Statement

**Issue**: 186 out of 205 articles (~90%) are missing an explicit `spotlightImage`.
**Impact**: The `MagazineGallery` currently relies on a code-level fallback: `const chosen = p.spotlightImage || p.mainImage`.
**Risk**:

- `mainImage` is typically landscape (16:9).
- The homepage requires a vertical (2:3) crop.
- Sanity's auto-crop often decapitates subjects when forcing 16:9 -> 2:3.
- **Key Limitation**: Without an explicit `spotlightImage` field populated, editors cannot adjust the homepage crop independently of the article hero.

## 2. Proposed Solution (The "Hard-Backfill")

We will write and execute a script (`scripts/restore-images.ts` or similar) to:

1.  Iterate through all 186 affected articles.
2.  Copy the `mainImage` asset, hotspot, and crop data into the `spotlightImage` field.
3.  Commit the change to Sanity.

## 3. Benefits

1.  **Editorial Control**: Editors can now open an article, adjust the `spotlightImage` crop (to focus on the face), and save it _without_ ruining the generic wide hero image.
2.  **Code Simplicity**: Future code can rely solely on `spotlightImage` for the homepage, removing the `|| mainImage` ambiguity.
3.  **Completion**: Resolves the "Backfill 100%" requirement of Issue #22.

## 4. Verification Plan (Phase 4)

1.  Run the audit script again -> Expect **0** missing spotlight images.
2.  Visual check of the Homepage -> Ensure images still load (it will look identical initially).
3.  (Optional Manual Step) Fix one bad crop in Studio to prove the capability unlocked.

## 5. Security & Safety

- **Non-Destructive**: We are writing to a null field. We are NOT overwriting existing `spotlightImage` data.
- **Reversibility**: We can write a script to unset `spotlightImage` if needed (unlikely).
- **Environment**: Script runs locally using `sanity/lib/client`.

## 6. Request for Approval

**Do you approve this plan to backfill 186 articles?**
If yes, I will proceed to Phase 2 (Implementation Plan) and Phase 3 (Execution).
