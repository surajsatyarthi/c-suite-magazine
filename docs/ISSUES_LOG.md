# Master Issues Log (Alpha Source of Truth)

**Date**: 2026-01-26
**Policy**: Ralph System v3.1 Enforcement. Every ID below MUST have a corresponding PRD or Assessment Report.

## 🔴 ACTIVE & OPEN ISSUES

| Issue # | Priority | Title                              | Status      | Gate | Next Action                                 |
| :------ | :------- | :--------------------------------- | :---------- | :--- | :------------------------------------------ |
| **#25** | **P0**   | **Governance: Missing Global PRD** | 🔴 **OPEN** | 1    | Create master architecture & standards doc. |
| **#48** | **P0**   | **Daily Sanity Backup Failure**    | 🔴 **OPEN** | 1    | Fix recurring workflow failure.             |

| **#45** | **P1** | **The Integrity Layer** | 🔴 **OPEN** | 1 | Create `assumption-scanner.ts` and enforce in CI. |
| **#35** | **P1** | **Prod Link Rot (Audit Fail)** | 🔴 **OPEN** | 1 | Prove existence of fix script or re-implement. |
| **#18** | **P1** | **Sanity Preview Sync** | ⏸️ **HOLD** | 9 | Test production preview after env var deploy. |
| **#21** | **P1** | **Dynamic Metadata Debt** | ⏳ **WATCH** | 10 | Final search engine result verification. |
| **#20** | **P2** | **Footer/Nav SEO** | 🔴 **OPEN** | 1 | Rebuild 3-column footer and fix CXO links. |

### 📊 RICE Prioritization Scoreboard (Live)

| Issue   | Title                    | Reach | Impact        | Confidence | Effort | **RICE** | **Est. Time** |
| :------ | :----------------------- | :---- | :------------ | :--------- | :----- | :------- | :------------ |
| **#48** | **Sanity Backup Fail**   | 100%  | 5 (Critical)  | 100%       | 1.0    | **500**  | **45 min**    |
| **#32** | **Spider / Report Fail** | 100%  | 5 (Critical)  | 90%        | 1.5    | **300**  | **30 min**    |
| **#35** | **Prod Link Rot**        | 100%  | 4 (High)      | 80%        | 2.0    | **160**  | **60 min**    |
| **#49** | **SEO Underperformance** | 100%  | 5 (Critical)  | 70%        | 3.0    | **116**  | **90 min**    |
| **#50** | **Missing SEO Reports**  | 50%   | 3 (Med)       | 90%        | 1.0    | **135**  | **30 min**    |
| **#45** | **Integrity Layer**      | 100%  | 4 (High)      | 90%        | 4.0    | **90**   | **120 min**   |
| **#25** | **Governance PRD**       | 100%  | 3 (Strategic) | 100%       | 2.0    | **150**  | **60 min**    |
| **#20** | **Footer SEO**           | 100%  | 2 (Low)       | 80%        | 3.0    | **53**   | **90 min**    |

---

## ✅ RESOLVED / WATCHTOWER

| Issue # | Title                            | Resolution Summary                                   | Final Gate |
| :------ | :------------------------------- | :--------------------------------------------------- | :--------- |
| **#43** | **Ghost Links / URL Resolution** | Unified routing in `lib/urls.ts`; 0 production 404s. | 10         |
| **#47** | **The Shattered Web**            | Resolved via the systemic fix in #43.                | 10         |

| **#10** | **Missing Metadata: Views** | Hybrid InteractionCounter implemented in JSON-LD. | 10 |
| **#26** | **CPU/Fan Noise** | Optimized tsconfig indexing; site build is silent. | 10 |
| **#32** | **The Spider: Crawler** | Automated nightly crawler and email relay is live. | 10 |
| **#22** | **Legacy Image Gaps** | Backfilled 100% of spotlight images via script. | 10 |

---

### **ID Registry (For Historical Audit)**

- **#01-#17**: Core platform stabilization (RESOLVED).
- **#19**: View Count Anomaly (RESOLVED).
- **#34**: Ralph System Upgrade (RESOLVED).
