# Ralph Protocol: Research Summary (Issue #6)

**Task**: Security Audit - SQL & GROQ Injection
**Issue ID**: #6
**Priority**: P0 (Security/Critical)
**Status**: RESEARCH (Gate 1.5)

## 1. Ground Truth Findings (Verified via User Research)

The research highlights that GROQ injection is mitigated by parameterization, but we must be cautious of "structural concatenation" and data over-fetching.

### A. The "Golden Pattern" for Safe Fetching:

```typescript
const query = groq`*[_type == "post" && slug.current == $slug][0]`;
const data = await client.fetch(query, { slug: params.slug });
```

- **Safety**: The `$slug` placeholder is bound as a JSON literal.
- **Law of Scrutiny**: We MUST avoid building the query string via concatenation _even if_ the resulting string is passed to `groq`. The `groq` tag is for syntax highlighting/linting and does not automatically sanitize concatenated strings.

### B. Defense in Depth (Beyond Parameterization):

1. **Input Validation**: Slugs should be validated against a strict regex (e.g., `^[a-z0-9-]+$`) BEFORE reaching the fetch layer.
2. **Narrow Projections**: Avoid fetching the entire document. Specify only required fields to prevent data leaks via injection payloads that might manipulate filters.
3. **Read-Only Context**: Ensure public-facing clients use tokens with the least privilege (read-only).

### C. Vulnerability Payloads (Testing Suite):

- `"] || true` (Filter escape)
- `"] { _id, title }` (Projection injection)
- ` && _type == "sensitiveData"` (Filter bypass)

## 2. Component Audit Results

| File Path                              | Vulnerability          | Line(s) |
| :------------------------------------- | :--------------------- | :------ |
| `app/category/[categorySlug]/page.tsx` | URL Param Injection    | 21, 31  |
| `scripts/upload-spotlight-images.js`   | Search Term Injection  | 55      |
| `scripts/fix-article-category.ts`      | Variable Interpolation | 28, 36  |
| `scripts/check-cxo-category.ts`        | Variable Interpolation | 15      |

## 3. Implementation Strategy (Gate 2)

1. **Production Fixes**: Refactor `app/category/[categorySlug]/page.tsx` to use parameterized queries and add basic slug validation.
2. **Utility Fixes**: Refactor migration scripts to use parameters.
3. **Scanner Upgrade**: Update `ralph-verify-sql-safety.ts` to detect unsafe `${` usage in any file calling `.fetch()`.

## 4. Permission Request

I request permission to proceed to **Phase 2 (Execution)**.

### Verification Proof (Research Tools)

```bash:disable-run
$ pnpm list next-sanity
next-sanity 11.6.5
$ git rev-parse --short HEAD
3fad0dc
```

### Contextual Anchor

- **Git HEAD**: 3fad0dc
- **Timestamp**: 2026-01-23T13:51:59Z
