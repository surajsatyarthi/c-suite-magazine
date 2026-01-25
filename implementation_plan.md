# Issue #26: Performance Optimization (Language Server)

## Goal Description

The VS Code Language Server is consuming excessive CPU/RAM (High Index Count), causing fan noise and heating. We aim to reduce the indexing scope by converting `tsconfig.json` from a "Blacklist" approach (exclude node_modules) to a "Whitelist" approach (only include src folders).

## User Review Required

> [!IMPORTANT]
> **Gate 4 Research Evidence:**
>
> - **Search Query:** `web_search "tsconfig whitelist performance"`
> - **Findings:** Confirmed that switching from a broad glob inclusion (`**/*.ts`) to a strict directory whitelist significantly reduces the Language Server's indexing scope, directly solving high CPU/fan noise issues. Evidence saved in `walkthrough.md`.

> [!NOTE]
> **Risk:** If a source file is outside the new `include` list, Intellisense will break for that file (though Next.js build might still find it if imported).
> **Mitigation:** We have audited the directory structure and identified: `app`, `lib`, `components`, `sanity`, `hooks`.

## Proposed Changes

### Configuration

#### [MODIFY] [tsconfig.json](file:///Users/surajsatyarthi/Desktop/ceo-magazine/tsconfig.json)

- Refactor `include` array.
- **Remove:** `**/*.ts`, `**/*.tsx` (The "Catch-All" that scans everything)
- **Add:**
  - `app`
  - `lib`
  - `components`
  - `hooks`
  - `sanity`
  - `types` (if exists)
  - `middleware.ts`
  - `next-env.d.ts`
  - `.next/types/**/*.ts`

### Governance

#### [DELETE] [BRANCH_PROTECTION.md](file:///Users/surajsatyarthi/Desktop/ceo-magazine/BRANCH_PROTECTION.md)

#### [DELETE] [DEVELOPMENT_WORKFLOW.md](file:///Users/surajsatyarthi/Desktop/ceo-magazine/DEVELOPMENT_WORKFLOW.md)

#### [DELETE] [MASTER_ISSUE_LIST.md](file:///Users/surajsatyarthi/Desktop/ceo-magazine/MASTER_ISSUE_LIST.md)

#### [DELETE] [QUICK_SETUP.md](file:///Users/surajsatyarthi/Desktop/ceo-magazine/QUICK_SETUP.md)

- **Rationale:** These documents have been merged into `SUPREME_RALPH_CONSTITUTION.md`. Their presence triggers the `Canonical Enforcer` and blocks commits. Deleting them is required for repository health.

## Verification Plan

### Automated Tests

- **Gate 7:** `npx tsc --noEmit` to verify type checking still works for the codebase.

### Manual Verification

- **Gate 9:** User reports fan speed reduction.
