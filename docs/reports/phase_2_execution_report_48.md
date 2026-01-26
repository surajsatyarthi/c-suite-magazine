# Ralph Protocol: Phase 2 Execution (Issue #48)

**Task**: Fix Sanity Backup Failure
**Phase**: Gate 2 (Execution) -> Verification

## 1. Execution Summary

We successfully modified the backup script to improve stability and remove external runtime dependencies.

- **File**: `scripts/backup-sanity.ts`
- **Change**: Replaced `npx -y @sanity/cli` with `pnpm exec sanity`.
- **Reason**: The `npx` command dynamically downloads the CLI, which is slow, prone to network timeouts, and breaks if the NPM registry is unreachable. Using the local project dependency is faster and deterministic.

## 2. Updated Logic

```typescript
// Old
spawnSafe("npx", ["-y", "@sanity/cli", ...args]);

// New
spawnSafe("pnpm", ["exec", "sanity", ...args]);
```

## 3. Impact Analysis

- **Reliability**: High. Uses the exact version of the CLI installed in `node_modules` and verified by `pnpm-lock.yaml`.
- **Performance**: Improved. Eliminates the download step.
- **Security**: Improved. No dynamic code execution from external sources during the backup run.

## 4. Next Steps

Proceed to Gate 3 (Verification) to test the fix.

## 5. Provenance Proof (v3.2 Compliance)

**Terminal Check:** `grep "pnpm" scripts/backup-sanity.ts`

```bash
    await spawnSafe('pnpm', ['exec', 'sanity', ...args]);
```
