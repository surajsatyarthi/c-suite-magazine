# Ralph Protocol: Phase 2 Execution (Issue #31)

**Task**: Fix Automated Sitemap Generation
**Phase**: Gate 2 (Execution) -> Verification
**Priority**: P1 (Revenue/SEO)

## 1. Execution Summary

We rewrote `app/sitemap.xml/route.ts` to be fully inclusive.

- **Old Logic**: Only fetched `post`. Ignored `csa` and `tag`.
- **New Logic**:
  1.  **Unified**: `_type == "post" || _type == "csa"` (Paid Clients now indexed).
  2.  **Expanded**: `_type == "tag"` (SEO Tag pages indexed).
  3.  **Static**: Added `/tag` index.

## 2. Verification Proof (The Proof Law)

We ran a dedicated `vitest` unit test to simulate the API response.

**Command**: `npx vitest run tests/unit/sitemap.test.ts`
**Output**:

```bash
  ✓ tests/unit/sitemap.test.ts (1 test) 43ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
```

**What did checks prove?**

- ✅ `<loc>.../csa/paid-article</loc>` exists.
- ✅ `<priority>1</priority>` for CSA.
- ✅ `<loc>.../tag/innovation</loc>` exists.

## 3. Permission Request

I request permission to proceed to **Phase 3 (Verification)** to close the issue.
