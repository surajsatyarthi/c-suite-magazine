# Ralph Protocol: Phase 1 Assessment (Issue: System Heating)

**Date**: 2026-01-26
**Priority**: P1 (Developer Productivity)
**Status**: 🔴 Identified

---

## 1. Executive Summary

User reports significant laptop heating immediately upon opening Antigravity. Initial system audit confirms high CPU usage (10%+) by `Antigravity Helper` and `Electron` processes. Preliminary findings suggest either a runaway indexing task or the inclusion of large directories in the active workspace scan.

## 2. Findings & Root Cause Analysis

### Deficiency A: Resource-Intensive Indexing

**Observation**:

- `node_modules` is 2.5G.
- `.next` is 560M.
- `tsconfig.json` excludes `node_modules` but includes `.next/types`.
- `.geminiignore` is present and excludes most large folders.

**Potential Root Cause**:
The `incremental: true` setting in `tsconfig.json` and the inclusion of `.next/types` might be forcing the language server to re-scan build artifacts frequently. Additionally, `Antigravity` might be attempting to index files that are technically ignored but still being watched.

### Deficiency B: Accumulated Background CPU

**Observation**:

- `SkyLight` and `logd` are also consuming significant CPU, suggesting high system activity possibly triggered by heavy I/O from indexing.

## 3. Remediation Strategy

1.  **Refine .geminiignore**: Ensure all build artifacts and non-essential paths are strictly ignored.
2.  **Optimize tsconfig.json**: Explicitly exclude `.next` and `dist` from the compiler's view to reduce language server overhead.
3.  **Process Reset**: Terminate current runaway helpers and clear `tsbuildinfo` to force a clean, optimized re-index.

## 4. Risks & Mitigations

- **Risk**: Over-exclusion might lead to missing type definitions.
- **Mitigation**: Verify `npx tsc --noEmit` passes after each change.
