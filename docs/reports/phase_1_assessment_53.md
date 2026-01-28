# Phase 1 Assessment Report: Issue #53 (Automated Systems Logging)

**Date**: 2026-01-28
**Author**: Antigravity Agent
**Status**: 🟡 IN PROGRESS

## 1. Problem Definition

The project runs multiple automated systems (Spider, SEO Sentinel, Sanity Backup, Security Scan). Currently, their success/failure status is buried in GitHub Actions logs or email inboxes.

- **Need**: A centralized, persistent, machine-readable log of "System Health".
- **Goal**: Enable a future "Status Dashboard" by maintaining a `logs/system_monitor.json` registry.

## 2. Technical Requirements

### Log Schema

We need a standardized JSON structure:

```typescript
interface SystemLogEntry {
  id: string; // UUID
  system: string; // e.g., 'the-spider', 'seo-sentinel'
  timestamp: string; // ISO 8601
  status: "SUCCESS" | "FAILURE" | "WARNING";
  duration_ms: number;
  details: string; // Summary (e.g., "1500 links check, 3 broken")
  trigger: "cron" | "manual";
}
```

### Storage Strategy (Revised for Long-Term Persistence)

- **Primary Storage**: **Sanity CMS**.
- **Schema**: `systemLog` document type.
- **Why**: User explicitly requested "proper long term" storage. Sanity provides persistence, a built-in dashboard (Studio), and query capability via GROQ over API.

### Implementation Steps

1.  **Schema Definition**: Create `schemas/systemLog.ts`.
2.  **API Utility**: Create `scripts/utils/sanity-logger.ts` to write to Sanity Client.
3.  **Integration**:
    - `the-spider.ts` -> Calls Sanity Logger.
    - `weekly-report-email.js` -> Calls Sanity Logger.

## 4. Verification Plan (Gate 3)

- Run `the-spider --limit 1` (Dry Run).
- Query Sanity: `*[_type == "systemLog"] | order(_createdAt desc)[0]`
- Verify a new document exists with status "SUCCESS" or "FAILURE".

signed,
_Antigravity Agent_
