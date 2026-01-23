# Master Issues Log

**Date**: 2026-01-23
**Source**: User-Provided Comprehensive List (Merged)

| Issue   | Title                              | Priority | Status       | Resolution / Short Summary                                         |
| :------ | :--------------------------------- | :------- | :----------- | :----------------------------------------------------------------- |
| **#1**  | CSA Spotlight Visibility (Revenue) | P0       | ✅ RESOLVED  | Unified logic to use Sanity as Ground Truth.                       |
| **#2**  | Spotlight Config Mismatch          | P0       | ✅ RESOLVED  | Removed spotlight.json; migrated to Sanity single-source.          |
| **#3**  | **Missing Spotlight Overlays**     | P0       | 🔴 RE-OPENED | Performed 100% sync of overlaid images to Sanity.                  |
| **#4**  | CI/CD Pipeline Failures            | P0       | ✅ RESOLVED  | Content-Agnostic discovery & dynamic skipping.                     |
| **#5**  | Security: XSS Vulnerability        | P0       | ✅ RESOLVED  | Implemented safeJsonLd and isomorphic-dompurify.                   |
| **#6**  | **Security: SQL Injection Audit**  | P0       | ✅ FIXED     | Confirmed False Positive (GROQ used, not SQL). (Recently Deployed) |
| **#7**  | Unreliable Deployment Tracking     | P1       | ✅ RESOLVED  | Enforced Staging -> Main branch protection workflow.               |
| **#8**  | Tag Data Quality (Stopwords)       | P1       | ✅ RESOLVED  | Reduced tags 131->28; enforced schema validation.                  |
| **#9**  | **Tag Landing Pages Missing**      | P1       | ✅ FIXED     | Implemented /tag/[slug] pages for SEO growth. (Recently Deployed)  |
| **#10** | **Missing Metadata: Views**        | P1       | 🔴 RE-OPENED | Implemented Hybrid Model (Jitter + Real).                          |
| **#11** | Hardcoded Secrets Audit            | P1       | ✅ RESOLVED  | Removed project IDs from code; enforced env vars.                  |
| **#12** | Server-to-Client Leak              | P1       | ✅ RESOLVED  | Split lib/sanity.ts & added guards.                                |
| **#13** | E2E Tooling Gaps (CI Sync)         | P1       | ✅ RESOLVED  | Sync'd env vars & verified MacOS/Linux runners.                    |
| **#14** | Sanity Validation                  | P1       | ✅ RESOLVED  | Enforced Schema constraints (required images/excerpts).            |
| **#15** | "Sponsored" Category Debt          | P2       | ✅ RESOLVED  | Removed category; enforced strict /csa routing.                    |
| **#16** | Playwright Coverage                | P1       | ✅ RESOLVED  | Implemented dynamic ad verification with Sanity drafts.            |
| **#17** | CI/CD Rulesets                     | P2       | ✅ RESOLVED  | Defined "Locked Vault" policy & job standardization.               |
| **#18** | **Sanity Preview**                 | P2       | 🔴 RE-OPENED | Dynamic environment-agnostic preview sync.                         |
| **#19** | View Count Anomaly (5M+)           | P0       | ✅ RESOLVED  | Clamped rand to 4.8M; Manual 5M+ override only.                    |
| **#20** | **Footer/Nav SEO**                 | P3       | 🔴 RE-OPENED | Anchored CXO Interviews; rebuilt 3-column footer.                  |
| **#21** | **Dynamic Metadata Debt**          | P1       | 🔴 RE-OPENED | Persisted to Sanity fields.                                        |
| **#22** | **Legacy Image Gaps**              | P1       | 🔴 RE-OPENED | Backfilled 100% assets.                                            |
| **#23** | QA Tooling Implementation          | P1       | ✅ RESOLVED  | Deployed Iron Dome (8 Core Tools) & Security CI.                   |
| **#24** | Category Scroll Freeze             | P1       | ✅ RESOLVED  | Removed conflicting JS auto-scroll loop.                           |
| **#25** | **Governance: Missing PRD**        | P2       | 🔴 OPEN      | No central PRD defining features/roadmap.                          |
| **#28** | Missing Tag Index Page             | P1       | ✅ RESOLVED  | Implemented /tag static index.                                     |
| **#29** | Missing Legal Entity Copyright     | P2       | ✅ RESOLVED  | Footer updated to "INVICTUS INTERNATIONAL..."                      |
| **#30** | Legacy Versioning Cleanup          | P4       | ✅ RESOLVED  | Removed package.json import from Footer.tsx.                       |
| **#31** | Automated Sitemap Gen              | P1       | ✅ RESOLVED  | Unified Query post + csa + tag; Tested.                            |
| **#32** | The Spider: Crawler                | P0       | ✅ RESOLVED  | Automated Crawler + Daily Email Report.                            |
| **#33** | **The Eagle: Visual Regression**   | P2       | 🔴 OPEN      | Automated visual regression testing.                               |
| **#34** | Ralph Protocol Upgrade v2.1        | P0       | ✅ RESOLVED  | Enforced "Proof Law" & Added Phase 7.                              |
| **#35** | Prod Link Rot (14 URLs)            | P0       | ✅ RESOLVED  | Fixed malformed URL code in ArchiveFilters.tsx.                    |
| **#36** | DevOps: Dedupe CI                  | P3       | ✅ RESOLVED  | Removed redundant e2e.yml workflow.                                |
| **#37** | Sec: Iron Dome (Dep Audit)         | P1       | ✅ RESOLVED  | Resolved lodash CVE via pnpm.overrides.                            |
| **#38** | Sanity: Schema Integrity           | P2       | ✅ RESOLVED  | Fixed env var leaks in CI runner; verified audit.                  |
| **#39** | Data: Ghost Cat Deletion           | P2       | ✅ RESOLVED  | Verified empty categories (Events/Business) gone.                  |
| **#40** | **Data: Batch Tagging "CEO"**      | P2       | ✅ RESOLVED  | Tagged 35 CXO Interview articles with "CEO".                       |
| **#41** | **Data: Tag Metadata Cleanup**     | P2       | ✅ RESOLVED  | Cleaned up empty/stopword tags; 0 orphans.                         |
| **#42** | **Data: Discard Stale Drafts**     | P2       | ✅ RESOLVED  | Deleted redundant Andy Jassy draft; clean.                         |

## Active Roadmap (Next Steps)

1. **#33 The Eagle: Visual Regression** (Open) - Expand coverage to Salary/CXO pages.
2. **#25 Governance: Missing PRD** (Open) - Formalize feature roadmap.
3. **#18 Sanity Preview** (Re-Opened) - Fix preview sync issues.
4. **#20 Footer/Nav SEO** (Re-Opened) - Improve footer structure.
