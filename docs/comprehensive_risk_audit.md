# Comprehensive Coding Risk Audit

**Status**: Active Audit
**Goal**: Track every conceivable coding risk and our mitigation status.

## 1. Security Risks (The "Iron Dome")

### A. Injection Attacks

- [x] **XSS (Cross-Site Scripting) - JSON-LD**: Fixed via `safeJsonLd` & `lib/security.ts`.
- [ ] **XSS - React `dangerouslySetInnerHTML`**: Partially Mitigated (Linter flags it, but manual review required for other instances).
- [x] **RCE (Remote Code Execution)**: **SOLVED**. Scripts refactored to use `spawn`.
- [ ] **SQL Injection**: **Vulnerable**. Raw queries in `scripts/` might perform string concatenation.
- [ ] **Log Injection**: **Unknown**. Logs are not sanitized before writing to streams.

### B. Secrets & Access Control

- [ ] **Hardcoded Secrets**: **Partial**. ESLint checks basic patterns. **MISSING**: Dedicated scanner (e.g., `trufflehog`, `gitleaks`) for high-entropy strings.
- [ ] **IDOR (Insecure Direct Object Reference)**: **Unknown**. No audit of API routes for `userId` checks.
- [ ] **Broken Authentication**: **Unknown**. No robust audit of session handling.
- [ ] **Middleware Bypass**: **Vulnerable**. Relying on headers that can be spoofed (CVE-2025-29927).
- [ ] **Missing CSRF Protection**: Mitigated by Next.js defaults, but needs verification on API routes.
- [ ] **Content Security Policy (CSP)**: **MISSING**. No strict CSP headers configured to block unauthorized scripts/styles.

## 2. "Vibe Coding" (AI-Specific) Risks

### A. Supply Chain & Hallucinations

- [x] **"Slopsquatting" (Package Hallucination)**: Audited manually. **Recommendation**: accurate-npm-install or similar validator.
- [ ] **Typosquatting**: **CRITICAL**. No lockfile analysis. **MISSING**: `lockfile-lint`.
- [ ] **Vulnerable Dependencies**: **Manual**. `npm audit` computed once. **MISSING**: `audit-ci` in pre-commit.
- [ ] **Abandoned Dependencies**: **Unknown**. No automated check for unmaintained packages.

### B. Logic & Reliability

- [ ] **Hallucinated Syntax**: Partially Mitigated by TypeScript compiler.
- [ ] **"Mirage" Validation**: **Vulnerable**. AI writes validation in UI (Zod) but skips it in API (Server Actions).
- [ ] **Context Window Amnesia**: **Unknown**. Risks of dropping logic during refactors. **MISSING**: "Golden Set" regression tests.

## 3. Next.js / Architecture Risks

### A. Data Leaks

- [ ] **Server-to-Client Leak**: **CRITICAL**. No `server-only` package enforced. Database objects could leak to browser bundles.
- [ ] **Environment Variable Leak**: Mitigated by Next.js `NEXT_PUBLIC_` prefix, but needs audit.

### B. Performance

- [ ] **Unbounded Queries**: **Vulnerable**. No `LIMIT` clauses enforced in Drizzle/SQL queries. (The "Limit Law").
- [ ] **N+1 Query Problems**: **Unknown**. No performance monitoring (e.g., OpenTelemetry) to catch query loops.
- [ ] **Layout Thrashing**: **Unknown**. No CLS (Cumulative Layout Shift) monitoring.

## 4. Operational & Process Risks

### A. Quality Assurance

- [x] **Pre-Commit Enforcement**: Mitigated. `husky` blocks commits with lint errors.
- [ ] **Smoke Testing**: **Weak**. `scripts/smoke-check.js` is basic; no critical path verification.
- [ ] **Dead Code Accumulation**: **Unknown**. No automated pruning of unused files/exports.

### B. Data Integrity

- [ ] **Schema Drift**: **Unknown**. Mismatch between Sanity Schema and Database Tables.
- [ ] **Backup Verification**: **Broken**. Backup script reported as failing.

---

## Urgency Scorecard

1.  **RCE (Exec)**: ✅ **DONE** (Refactored to `spawn`).
2.  **Server Leaks**: 🚨 Needs `server-only` (Phase 4).
3.  **Slopsquatting**: 🚨 Needs Dependency Audit (Phase 4).
