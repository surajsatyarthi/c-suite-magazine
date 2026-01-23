# Ralph Protocol: Research Summary (Issue #9)

**Task**: Tag Landing Pages Optimization
**Issue ID**: #9
**Status**: RESEARCH (Gate 1.5)

## 1. Ground Truth Findings (Benchmark Results)

| Operation          | Time      | Analysis                                                                                                          |
| :----------------- | :-------- | :---------------------------------------------------------------------------------------------------------------- |
| `getAllUniqueTags` | **593ms** | **FAIL** (>200ms). Fetches 445 raw items to resolve 29 unique tags. Used on _every_ page load for reverse lookup. |
| `getTagPosts`      | **413ms** | **WARN**. Acceptable for dynamic data but bordering on slow.                                                      |

### The "Reverse Lookup" Bottleneck

The current architecture stores tags as an **array of strings** on the Post document.

- **Problem**: URLs use slugs (`/tag/ai-technology`), but the DB stores strings (`AI Technology`).
- **Impact**: To resolve `ai-technology` -> `AI Technology`, the app fetches **ALL** tags from **ALL** posts, deduplicates them, slugifies each, and finds a match.
- **Scale Risk**: O(N) where N is total posts. Will degrade linearly.

## 2. Proposed Solutions

### Option A: The "Tag Document" Migration (Ideal but Expensive)

Migrate `tags: string[]` to `tags: reference->tag`.

- **Pros**: Direct lookup by slug (`*[_type == "tag" && slug.current == $slug][0]`). Near-instant.
- **Cons**: High effort. Requires data migration of 400+ posts.

### Option B: The "Cached Lookup" (Recommended for P2)

Optimize the existing logic without schema change.

1. **Memoization**: Wrap `getAllUniqueTags` in React `cache()` or Next.js `unstable_cache`.
2. **Query Optimization**: Reduce payload. The current query `tags[]` is decent but returns duplicates.
3. **ISR**: The page is already using ISR (`revalidate = 3600`), which mitigates the runtime cost to once per hour.

## 3. Implementation Strategy (Gate 2)

We will proceed with **Option B (Optimization)** as this is a P2 Feature, not a P0 Architecture rewrite.

1. **Refactor**: Move `getAllUniqueTags` to `lib/sanity.queries.ts` and wrap with `cache()`.
2. **Optimize**: Ensure the query uses the new "Air-Gap" compliant `getServerClient`.
3. **Verify**: Re-run benchmark with caching enabled (simulated).

## 4. Permission Request

I request permission to proceed to **Phase 2 (Execution)** to implement the Caching & Refactoring plan.

### Verification Proof

```bash:disable-run
$ npx tsx scripts/benchmark-tags.ts
... 593.38ms
$ git rev-parse --short HEAD
75fc898
```
