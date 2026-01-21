# Ralph Protocol: Phase 1 Assessment (Issue #13)

**Task**: Fix E2E Tooling Gaps (Issue #13)
**Phase**: Gate 1 (Assessment)

## 1. Findings (The "Why")

Local replication confirmed that **all E2E jobs are failing** due to high-level logic conflicts:

1.  **Routing Conflict**: The tests expect `/category/cxo-interview` to load, but the app code (`app/category/[categorySlug]/page.tsx`) explicitly marks `cxo-interview` as a `REMOVED_SLUG`, triggering a 404.
2.  **Stale Assertions**: `category-page.spec.ts` expects exactly 21 articles. Any change in the CMS (adding/removing articles) breaks this test.
3.  **Dependency Debt**: Two test suites (`indian-oil-ad-verification` and `partner-quotes`) require content that is currently unpublished.

## 2. Proposed Remediation (The "How")

- **Fix 404s**: Update `smoke.spec.ts` to verify the `leadership` category (which is valid and stable) instead of the removed `cxo-interview`.
- **Harden Tests**: Change "Exact Count" assertions to "Greater Than Zero" checks to make tests data-agnostic.
- **Isolate Debt**: Use `test.skip()` on Indian Oil tests until Issue #20 is authorized for launch. This clears the CI without deleting the work.

## 3. Permission Request

I request permission to proceed to **Phase 2 (Execution)** and apply these fixes.
