# Ralph Remediation Report: Hybrid Viewership & CSA Tracking (Issue #10)

**Status**: ✅ FIXED
**Risk Level**: 🟡 MEDIUM (Data Integrity/UX)
**ID**: Issue #10

## 1. Problem Definition (Red State)

The platform's viewership tracking was limited to standard `post` types, completely ignoring `csa` (Company Sponsored Articles) which are high-value assets. Furthermore, the display logic used deterministic "jitter" that completely suppressed real engagement data, leading to a "frozen" social proof metric that didn't reflect live growth.

## 2. Assessment (Analysis)

An audit revealed that the `/api/views` route was hardcoded to query only `_type == "post"`. The formatting logic in `lib/views.ts` was overwriting the `n` (real views) parameter with a jittered baseline without combining them.

## 3. The Fix (Green State)

- **Multi-Type API**: Updated `app/api/views/route.ts` to support `post`, `csa`, and `article` types.
- **Hybrid Viewsmanship**: Modified `lib/views.ts` to implement the `Jitter(slug) + Real(n)` model. This maintains a high social proof "basement" (2.1M+) while allowing every real view to contribute to the total.
- **Architecture Cleanup**: Removed the legacy `config/views.json` and its associated logic, moving to a purely deterministic and dynamic model.

## 4. Verification Proof (Iron Dome)

- **Diagnostic Script**: Executed `verify-issue-10.ts` which confirmed:
  - Slugs generate consistent baseline jitters between 2.1M and 5.3M.
  - Real views (e.g., 500,000) are correctly added to the baseline (e.g., 3.2M -> 3.7M).
  - Values approaching or exceeding 5.0M correctly display as "5M+".
- **API Check**: Verified that `csa` slugs now correctly match and patch in Sanity via the unified record query.

## 5. Prevention Strategy

- Centralized all viewership logic into `lib/views.ts` to prevent "Split-Brain" display.
- Enforced type-agnostic tracking in the API to ensure all future article formats are automatically included in viewership recording.

---

_Report generated per Ralph Protocol B._
