# Master Issues Log

**Date**: 2026-01-23
**Source**: User-Provided Comprehensive List (Merged)

| Issue   | Title                              | Priority | Status      | Est. | Resolution / Short Summary                                                                                 |
| :------ | :--------------------------------- | :------- | :---------- | :--- | :--------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----- | -------------------------------- | ------- |
| **#1**  | CSA Spotlight Visibility (Revenue) | P0       | ✅ RESOLVED | --   | Unified logic to use Sanity as Ground Truth.                                                               |
| **#2**  | Spotlight Config Mismatch          | P0       | ✅ RESOLVED | --   | Removed spotlight.json; migrated to Sanity single-source.                                                  |
| **#3**  | **Missing Spotlight Overlays**     | P0       | ✅ FIXED    | 2h   | Performed 100% sync of overlaid images to Sanity (19/19 mapped).                                           | [Deployment Report 03](file:///Users/surajsatyarthi/Desktop/ceo-magazine/docs/reports/deployment_report_03.md) |
| **#4**  | CI/CD Pipeline Failures            | P0       | ✅ RESOLVED | --   | Content-Agnostic discovery & dynamic skipping.                                                             |
| **#5**  | Security: XSS Vulnerability        | P0       | ✅ RESOLVED | --   | Implemented safeJsonLd and isomorphic-dompurify.                                                           |
| **#6**  | **Security: SQL Injection Audit**  | P0       | ✅ FIXED    | --   | Confirmed False Positive (GROQ used, not SQL).                                                             |
| **#7**  | Unreliable Deployment Tracking     | P1       | ✅ RESOLVED | --   | Enforced Staging -> Main branch protection workflow.                                                       |
| **#8**  | Tag Data Quality (Stopwords)       | P1       | ✅ RESOLVED | --   | Reduced tags 131->28; enforced schema validation.                                                          |
| **#9**  | **Tag Landing Pages Missing**      | P1       | ✅ FIXED    | --   | Implemented /tag/[slug] pages for SEO growth.                                                              |
| **#10** | **Missing Metadata: Views**        | P1       | ✅ RESOLVED | --   | Hybird views + Persona Hardening (Client vs Writer).                                                       |
| **#11** | Hardcoded Secrets Audit            | P1       | ✅ RESOLVED | --   | Removed project IDs from code; enforced env vars.                                                          |
| **#12** | Server-to-Client Leak              | P1       | ✅ RESOLVED | --   | Split lib/sanity.ts & added guards.                                                                        |
| **#13** | E2E Tooling Gaps (CI Sync)         | P1       | ✅ RESOLVED | --   | Sync'd env vars & verified MacOS/Linux runners.                                                            |
| **#14** | Sanity Validation                  | P1       | ✅ RESOLVED | --   | Enforced Schema constraints (required images/excerpts).                                                    |
| **#15** | "Sponsored" Category Debt          | P2       | ✅ RESOLVED | --   | Removed category; enforced strict /csa routing.                                                            |
| **#16** | Playwright Coverage                | P1       | ✅ RESOLVED | --   | Implemented dynamic ad verification with Sanity drafts.                                                    |
| **#17** | CI/CD Rulesets                     | P2       | ✅ RESOLVED | --   | Defined "Locked Vault" policy & job standardization.                                                       |
| **#18** | **Sanity Preview**                 | P2       | ⏸️ ON HOLD  | 6h   | Dynamic environment-agnostic preview sync.                                                                 |
| **#19** | View Count Anomaly (5M+)           | P0       | ✅ RESOLVED | --   | Clamped rand to 4.8M; Manual 5M+ override only.                                                            |
| **#20** | **Footer/Nav SEO**                 | P1       | ✅ RESOLVED | 6h   | 4-col layout (Insights                                                                                     | Topics                                                                                                         | Legal | Logo), headers 16px, links 13px. | footer. |
| **#52** | **SEO Sentinel Activation**        | P2       | ✅ FIXED    | 2h   | Code deployed (Commit `14d6ed7`). Authentication Wired & Secret Verified via `gh` CLI. Workflow Triggered. |                                                                                                                | Legal | Logo), headers 16px, links 13px. | footer. |
| **#21** | **Dynamic Metadata Debt**          | P1       | ✅ RESOLVED | 4h   | Moved hardcoded metadata to Sanity `siteSettings` singleton (Commit `9c36905`).                            |
| **#22** | **Legacy Image Gaps**              | P1       | ✅ RESOLVED | --   | Backfilled 100% assets (Verified via Forensic Audit `f973e01c`).                                           |
| **#23** | QA Tooling Implementation          | P1       | ✅ RESOLVED | --   | Deployed Iron Dome (8 Core Tools) & Security CI.                                                           |
| **#24** | Category Scroll Freeze             | P1       | ✅ RESOLVED | --   | Removed conflicting JS auto-scroll loop.                                                                   |
| **#53** | **Automated Systems Logging**      | P1       | ✅ RESOLVED | 4h   | Implemented `systemLog` Sanity schema & logger utility (Commit `57e7e80`).                                 |
| **#25** | **Governance: Missing PRD**        | P2       | 🔴 OPEN     | 4h   | No central PRD defining features/roadmap.                                                                  |
| **#28** | Missing Tag Index Page             | P1       | ✅ RESOLVED | --   | Implemented /tag index; Polished UI (contrast/typography).                                                 |
| **#29** | Missing Legal Entity Copyright     | P2       | ✅ RESOLVED | --   | Updated to "INVICTUS INTERNATIONAL... 2026 © ™".                                                           |
| **#30** | Legacy Versioning Cleanup          | P4       | ✅ RESOLVED | --   | Removed package.json import from Footer.tsx.                                                               |
| **#31** | Automated Sitemap Gen              | P1       | ✅ RESOLVED | --   | Unified Query post + csa + tag; Tested.                                                                    |
| **#32** | The Spider: Crawler                | P0       | ✅ RESOLVED | --   | Automated Crawler + Daily Email Report.                                                                    |
| **#33** | **The Eagle: Visual Regression**   | P2       | ✅ FIXED    | --   | Expanded coverage to Executive Salary pages. [Report 33]                                                   |
| **#34** | Ralph Protocol Upgrade v2.1        | P0       | ✅ RESOLVED | --   | Enforced "Proof Law" & Added Phase 7.                                                                      |
| **#35** | Prod Link Rot (14 URLs)            | P0       | ✅ RESOLVED | --   | Fixed malformed URL code in ArchiveFilters.tsx.                                                            |
| **#36** | DevOps: Dedupe CI                  | P3       | ✅ RESOLVED | --   | Removed redundant e2e.yml workflow.                                                                        |
| **#37** | Sec: Iron Dome (Dep Audit)         | P1       | ✅ RESOLVED | --   | Resolved lodash CVE via pnpm.overrides.                                                                    |
| **#38** | Sanity: Schema Integrity           | P2       | ✅ RESOLVED | --   | Fixed env var leaks in CI runner; verified audit.                                                          |
| **#39** | Data: Ghost Cat Deletion           | P2       | ✅ RESOLVED | --   | Verified empty categories (Events/Business) gone.                                                          |
| **#40** | **Data: Batch Tagging "CEO"**      | P2       | ✅ RESOLVED | --   | Tagged 35 CXO Interview articles with "CEO".                                                               |
| **#41** | **Data: Tag Metadata Cleanup**     | P2       | ✅ RESOLVED | --   | Cleaned up empty/stopword tags; 0 orphans.                                                                 |
| **#42** | **Data: Discard Stale Drafts**     | P2       | ✅ RESOLVED | --   | Deleted redundant Andy Jassy draft; clean.                                                                 |
| **#43** | **Crawler: Missing Daily Report**  | P0       | ✅ RESOLVED | --   | Switched workflow to pnpm; verified Mac/CI consistency.                                                    |
| **#44** | **UI Header Polish (Aesthetics)**  | P1       | ✅ RESOLVED | --   | Space wastage reduced; implemented Classic Editorial Card.                                                 |
| **#45** | **Broken Link: Andy Jassy**        | P0       | ✅ RESOLVED | 1h   | Fixed 404 via ISR/DynamicParams (Commit verified).                                                         |
| **#46** | **Persistent Email Failure**       | P0       | ✅ RESOLVED | 2h   | Fixed CI missing dependencies (`tsx`); verified deliverability.                                            |
| **#47** | **UI Bug: Missing Author Header**  | P1       | ✅ RESOLVED | 1h   | Fixed header fallback logic & "By" prefix.                                                                 |
| **#48** | **Governance: Secret Management**  | P0       | ✅ RESOLVED | --   | Implemented Vault Protocol & persistent secrets indexing.                                                  |
| **#51** | **The Integrity Layer**            | P1       | ✅ RESOLVED | 4h   | Enforced `assumption-scanner` in pre-commit hook (Commit `25217fa`).                                       |
| **#54** | **Sec: Next.js DoS Vulnerability** | P0       | ✅ RESOLVED | 1h   | Patched GHSA-h25m-26qc-wcjf (High). Upgraded next@16.1.6 (Commit `7c24dd9`).                               |
| **#25** | **Governance: Missing PRD**        | P2       | ✅ RESOLVED | 2h   | Updated PRODUCT_REQUIREMENTS_DOCUMENT.md to v1.5.0 (Commit `54e9f0c`).                                     |

## Active Roadmap (Next Steps)

**🎉 ALL CRITICAL ISSUES RESOLVED**

1. **#18 Sanity Preview** (P2 - ON HOLD) - Preview sync debugging (deferred, complex).
