# Ralph Protocol: Phase 1 Assessment (Issue #31)

**Task**: Fix Automated Sitemap Generation
**Issue ID**: #31
**Priority**: P1 (SEO Critical)

## 1. Problem Statement

The current `sitemap.xml` is **blind** to key revenue and SEO pages.

## 2. Evidence (The Proof Law)

We grepped `app/sitemap.xml/route.ts` for "csa" and "tag".
**Result: EXIT CODE 1 (Not Found)**.

```bash
> grep "_type == \"csa\"" app/sitemap.xml/route.ts
exit code: 1 (NO MATCH)

> grep "tag" app/sitemap.xml/route.ts
exit code: 1 (NO MATCH)
```

**Conclusion**: `csa` (Paid Articles) and `tag` (SEO Pages) are biologically incapable of appearing in the sitemap.

## 3. Threat Model

| Threat             | Mitigation                  |
| :----------------- | :-------------------------- |
| **Revenue Loss**   | Explicitly add `csa` query. |
| **SEO Blindspots** | Explicitly add `tag` query. |

## 4. Execution Plan

1.  **Unity**: Modify `route.ts` to query `*[_type in ["post", "csa"] ...]`.
2.  **Expansion**: Add `*[_type == "tag" ...]`.
3.  **Optimization**: Select only `{ slug, _updatedAt }`.

## 5. Permission Request

I request permission to proceed to **Phase 2 (Execution)**.
