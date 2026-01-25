# Ralph Protocol: Phase 1 Assessment (Issue #6)

**Task**: Security Audit - SQL & GROQ Injection
**Issue ID**: #6
**Priority**: P0 (Security/Critical)
**Status**: PLANNING (Gate 1)

## 1. Problem Statement

The project utilizes two primary data layers:

1. **Vercel Postgres**: Used for executive compensation data (Programmatic SEO).
2. **Sanity (GROQ)**: Used for all magazine content, categories, and tags.

While the Postgres layer (Law 1 compliant) uses parameterized queries via the `sql` tagged template, the **GROQ layer has been found to use raw string interpolation**, creating a critical injection vector.

### Identified Vulnerabilities (Found in Phase 0 Research):

- **`app/category/[categorySlug]/page.tsx`**: Directly interpolates `slug` from URL into the query.
- **`scripts/upload-spotlight-images.js`**: Uses `match` with unparameterized search terms.
- **`scripts/fix-article-category.ts`**: Unparameterized query logic.

## 2. Threat Model

| Vector                       | Description                                                                                            | Impact                                                                                 |
| :--------------------------- | :----------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| **URL Parameter Injection**  | An attacker manipulates `categorySlug` to escape the `slug.current == "${slug}"` filter.               | Data Leak: Access to hidden (`isHidden: true`) articles, drafts, or internal metadata. |
| **Search Term Manipulation** | Malicious content in Sanity (if a writer is compromised) could break migration scripts during updates. | System Integrity: Potential for script crashes or unintended data field modification.  |
| **Cross-Script Poisoning**   | Inconsistent query patterns across scripts make it difficult to audit security via automated tools.    | Maintenance Debt: Security regressions during future maintenance.                      |

## 3. Proposed Solution

We will implement **Strict Parameterization** across all GROQ fetches:

- Use `{ varName: value }` as the second argument to `client.fetch()`.
- Reference `$varName` inside the GROQ query string.

### Component Breakdown:

- **Production Pages**: Hardening `app/category/[categorySlug]/page.tsx`.
- **Migration Utilities**: Hardening scripts identified in the audit.
- **Security Scanner**: Updating `ralph-verify-sql-safety.ts` to enforce GROQ parameterization as a pre-commit/CI gate.

## accept Acceptance Criteria (AC)

- [ ] `ralph-verify-sql-safety.ts` reports 0 violations for both SQL and GROQ.
- [ ] Manual test of `category/[slug]` with `' OR true || '` style payloads fails to return unintended articles.
- [ ] Category pages load normally with valid slugs.
- [ ] No regression in `revenue-integrity-check.ts`.

## 4. Permission Request

I request permission to proceed to **Phase 1.5 (Research)** to confirm the definitive Sanity security patterns and then to **Phase 2 (Execution)**.

### Verification Proof (Phase 1 Baseline)

```bash:disable-run
$ ls docs/reports/phase_1_assessment_report_06.md
docs/reports/phase_1_assessment_report_06.md
$ git rev-parse --short HEAD
3fad0dc
```

### Contextual Anchor

- **Git HEAD**: 3fad0dc
- **Timestamp**: 2026-01-23T13:51:59Z
