# Ralph Protocol: Phase 1 Assessment (Issue #9)

**Task**: Tag Landing Pages Optimization
**Issue ID**: #9
**Priority**: P2 (Feature/Optimization)
**Status**: PLANNING (Gate 1)

## 1. Problem Statement

The current implementation of `app/tag/[tagSlug]/page.tsx` functions correctly but has a significant **efficiency gap**:

- **Inefficient Reverse Lookup**: To map a URL slug (e.g., `ai-technology`) back to the original database tag (e.g., `AI Technology`), the system executes `getAllUniqueTags()`, which fetches the `tags` array from **every post in the database**.
- **Scalability Risk**: As the content library grows, this query (`*[_type == "post"...].tags[]`) will become heavier, potentially causing timeouts or high memory usage during regeneration.

## 2. Threat Model (v2.5)

| Vector                 | Description                                          | Mitigation                                                                  |
| :--------------------- | :--------------------------------------------------- | :-------------------------------------------------------------------------- |
| **Data Leak**          | Unparameterized GROQ queries leaking hidden data.    | **Status: SECURED**. Queries already use `$originalTag` parameter.          |
| **DoS (Availability)** | Heavy GROQ query causing database/server timeout.    | **Risk: MEDIUM**. Proposed optimization to fetch only _needed_ data.        |
| **Logic Drift**        | `slugifyTag` mismatch between generation and lookup. | **Mitigation**: Centralize slug logic in `lib/tag-utils.ts` (Already done). |

## 3. Proposed Solution

### A. Optimization: Optimized GROQ Query

Instead of fetching ALL tags, we should try to filter by the slug if possible, or cache the mapping.
However, since Sanity tags are simple strings (not objects with slugs), we _must_ fetch them to slugify and match.
**Optimization**: We can limit the query to distinct values or use a faster projection?
Actually, the best fix for Sanity tag strings is to fetch them _once_ and cache, OR verify if we can query by `tags match parameter`.
_Note_: `tags` is an array of strings. We can't easily query "give me the tag that slugifies to X" without a backend plugin.
**Refined Approach**: Keep the logic but check if `getAllUniqueTags` can be optimized (e.g., using a specialized projection).

### B. Protocol Hardening

- **Air-Gap**: Ensure `getFetchClient()` uses `lib/sanity.server.ts` (Read-only).
- **Evidence**: Add Phase 3 verification with visual regression for Tag pages.

## 4. Acceptance Criteria (AC)

- [ ] Tag Page matches visual regression baseline (Header, Grid, Footer).
- [ ] `getAllUniqueTags` query execution time is within acceptable limits (<200ms).
- [ ] No `console.log` leaks in production.
- [ ] Air-Gap Law: Zero write token usage.

### Verification Proof (Phase 1 Baseline)

```bash:disable-run
$ git rev-parse --short HEAD
75fc898
```

## 5. Permission Request

I request permission to proceed to **Phase 1.5 (Research)** to benchmark the tag query performance and explore GROQ optimizations, then to **Phase 2 (Execution)**.

### Contextual Anchor

- **Git HEAD**: 75fc898
- **Timestamp**: 2026-01-23T14:26:00Z
