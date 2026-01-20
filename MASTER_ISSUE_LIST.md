# 🎯 C-Suite Magazine - Master Issue List

**Last Updated:** 2026-01-20 07:45 IST  
**Status:** ACTIVE - 18 Core Issues Identified. 7 Resolved. 11 Pending.

---

## 🚨 **TIER 0: CRITICAL & REVENUE-BLOCKING** (Fix Immediately)

### Issue #1: CSA Clients Not Getting Paid Spotlight Visibility

- **Status:** ✅ RESOLVED (2026-01-19)
- **Priority:** P0 - HIGHEST (Revenue Loss)
- **Revenue Impact:** **CRITICAL** - Impacted 3 high-paying clients (Southwire, Sawit, IndianOil).
- **Remediation:** Consolidated dual configurations; fixed URL slugs.

### Issue #2: Spotlight Configuration Mismatch

- **Status:** ✅ RESOLVED (2026-01-19)
- **Priority:** P0 - HIGHEST
- **Revenue Impact:** **HIGH** - Wrong article count & dual config sources.
- **Remediation:** Removed `spotlight.json` dependency; migrate to Sanity.

### Issue #3: Spotlight Images Missing Text Overlays

- **Status:** ✅ RESOLVED (2026-01-19)
- **Priority:** P0 - HIGHEST (Branding/UX)
- **Revenue Impact:** **HIGH** - Homepage looks "unfinished" to clients paying $9K+.
- **Remediation:** Performed 100% sync of 'Featured section' overlaid images to Sanity (19/19 images linked with multi-type support for `post` and `csa`).

### Issue #4: CI/CD Pipeline Failures (Build & E2E Verification)

- **Status:** ✅ RESOLVED (2026-01-20)
- **Priority:** P0 - HIGHEST (System Integrity)
- **Impact:** GitHub Actions were consistently failing due to misconfigured tests and missing data integrity.
- **Remediation:**
  - **Data Repair**: Fixed 14 Sanity documents missing `_key` properties in categories.
  - **Authentication**: Patched `lib/sanity.ts` to use authenticated fetches for private datasets, resolving site-wide 404s.
  - **Draft Verification**: Enabled `SANITY_VIEW_DRAFTS` for Playwright to verify draft content (like Indian Oil) without publishing it.
  - **Tests**: Migrated integrity tests to Vitest. All 19 E2E tests now pass on the `staging` branch (verified manually before merge).

### Issue #5: Security: XSS Vulnerability in `app/page.tsx`

- **Status:** 🔴 OPEN
- **Priority:** P0 - HIGHEST (Security)
- **Impact:** Raw HTML injection risk. Potential for malicious script execution via CMS content.
- **Source:** `security_audit_results.md`

### Issue #6: Security: SQL Injection Risk in Migration Scripts

- **Status:** ✅ RESOLVED (False Positive - 2026-01-20)
- **Priority:** P0 - HIGHEST (Security)
- **Impact:** NONE - Project uses Sanity CMS with GROQ (not SQL). All queries use parameterized pattern `client.fetch(query, params)`.
- **Remediation:** No action required. Security audit incorrectly identified SQL risks.

---

## 🔴 **TIER 1: HIGH PRIORITY / SYSTEMIC** (Fix This Week)

### Issue #7: Unreliable Deployment Tracking (The "False Ready" Problem)

- **Status:** ✅ RESOLVED (2026-01-20)
- **Priority:** P1 - Very High
- **Description:** Previous workflow allowed deployments (`vercel --prod`) to bypass CI/CD, leading to reports of "Success" while E2E tests were failing.
- **Remediation:** Standardized the workflow to use a **Staging Branch**. No code reaches `main` (and thus production) until it passes local E2E verification and automated CI gates. Established `staging` → `main` merge protocol.

### Issue #8: Tag Data Quality (Stopwords & Normalization)

- **Status:** ✅ RESOLVED (2026-01-20)
- **Priority:** P1 - Very High
- **Description:** Tags like "his", "her", or "ai" vs "AI" pollute the industry taxonomy.
- **Remediation & Impact**:
  - **Consolidated Taxonomy**: Reduced from 131 → **28** unique high-quality tags (-78% reduction).
  - **Enforced Governance**: Added `tagValidation.ts` for schema blocking (stopwords, duplicates, casing).
  - **Guided UI**: Implemented `TagAutocompleteInput.tsx` for intelligent tag suggestions.
  - **Monitoring**: Scheduled `monthly-tag-monitoring.ts` (Current Health Score: **100/100**).
  - **Automation**: Executed `consolidate-tags.ts` to clear historical noise (49 documents updated).

### Issue #9: Tag Landing Pages Missing (SEO Blocker)

- **Status:** 🔴 OPEN
- **Priority:** P1 - Very High
- **Description:** Tags are visible but not clickable. `/tag/[slug]` pages do not exist. Significant SEO loss.

### Issue #10: Missing Metadata: Article Views

- **Status:** 🔴 OPEN
- **Priority:** P1 - Very High
- **Description:** Placeholder search/view counts reduce social proof for premium clients.

### Issue #11: Infrastructure: Hardcoded Secrets & Spreading

- **Status:** 🔴 OPEN
- **Priority:** P1 - Very High
- **Impact:** Risk of API Key leaks. No automated "Trufflehog" scanner in CI yet.

### Issue #12: Data Integrity: Server-to-Client Leak Risk

- **Status:** 🔴 OPEN
- **Priority:** P1 - Very High
- **Description:** Missing `server-only` guards. Potential for sensitive DB objects leaking to the browser.

---

## 🟡 **TIER 2: MEDIUM PRIORITY** (Next 2 Weeks)

### Issue #13: Missing Metadata: Reading Time

- **Status:** 🔴 OPEN
- **Priority:** P2 - High
- **Impact:** Standard magazine feature missing; reduces user engagement time.

### Issue #14: Writer Details Missing from Article Pages

- **Status:** 🔴 OPEN
- **Priority:** P2 - High
- **Impact:** Missing author/contributor attribution. Reduces professional feel.

### Issue #15: Category Misclassification (The "Sponsored" Debt)

- **Status:** 🔴 OPEN
- **Priority:** P2 - High
- **Description:** Using "Company Sponsored" as a category instead of a boolean flag. Mixes topic with payment tier.

### Issue #16: Performance: The "Limit Law" (Unbounded Queries)

- **Status:** 🔴 OPEN
- **Priority:** P2 - High
- **Description:** Missing `LIMIT` clauses on DB queries. Risk of memory exhaustion as content grows.

### Issue #17: Reliability: Backup Verification Failure

- **Status:** 🔴 OPEN
- **Priority:** P2 - High
- **Description:** System report shows scheduled backups are failing secretly.

### Issue #18: UX: Cumulative Layout Shift (CLS)

- **Status:** 🔴 OPEN
- **Priority:** P2 - High
- **Description:** UI transitions are "popping" without proper placeholder sizes. Negative Core Web Vitals impact.

---

## 📋 **Legend**

- **P0**: Fix Immediately (Revenue/Security)
- **P1**: Fix within 7 days (SEO/Integrity)
- **P2**: Fix within 14 days (UX/Performance)
