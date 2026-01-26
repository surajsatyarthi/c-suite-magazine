# Master Issues Log (Alpha Source of Truth)

**Date**: 2026-01-26
**Policy**: Ralph Protocol v2.5 Enforcement. Every ID below MUST have a corresponding PRD or Assessment Report.

## 🔴 ACTIVE & OPEN ISSUES

| Issue # | Priority | Title                              | Status       | Gate | Next Action                                   |
| :------ | :------- | :--------------------------------- | :----------- | :--- | :-------------------------------------------- |
| **#25** | **P0**   | **Governance: Missing Global PRD** | 🔴 **OPEN**  | 1    | Create master architecture & standards doc.   |
| **#22** | **P1**   | **Legacy Image Gaps**              | 🔴 **OPEN**  | 1    | Backfill 100% of article hero/meta images.    |
| **#45** | **P1**   | **The Integrity Layer**            | 🔵 **DOING** | 8    | Finalize `assumption-scanner.ts` enforcement. |
| **#18** | **P1**   | **Sanity Preview Sync**            | 🔵 **DOING** | 9    | Test production preview after env var deploy. |
| **#21** | **P1**   | **Dynamic Metadata Debt**          | ⏳ **WATCH** | 10   | Final search engine result verification.      |
| **#20** | **P2**   | **Footer/Nav SEO**                 | 🔴 **OPEN**  | 1    | Rebuild 3-column footer and fix CXO links.    |

---

## ✅ RESOLVED / WATCHTOWER

| Issue # | Title                            | Resolution Summary                                   | Final Gate |
| :------ | :------------------------------- | :--------------------------------------------------- | :--------- |
| **#43** | **Ghost Links / URL Resolution** | Unified routing in `lib/urls.ts`; 0 production 404s. | 10         |
| **#47** | **The Shattered Web**            | Resolved via the systemic fix in #43.                | 10         |
| **#35** | **Prod Link Rot**                | Manual fix of 14 broken URLs in Archive filters.     | 10         |
| **#10** | **Missing Metadata: Views**      | Hybrid InteractionCounter implemented in JSON-LD.    | 10         |
| **#26** | **CPU/Fan Noise**                | Optimized tsconfig indexing; site build is silent.   | 10         |
| **#32** | **The Spider: Crawler**          | Automated nightly crawler and email relay is live.   | 10         |

---

### **ID Registry (For Historical Audit)**

- **#01-#17**: Core platform stabilization (RESOLVED).
- **#19**: View Count Anomaly (RESOLVED).
- **#34**: Ralph Protocol Upgrade (RESOLVED).
