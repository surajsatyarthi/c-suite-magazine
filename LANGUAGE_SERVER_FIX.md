# Language Server Memory Bloat - RCA & Fix

## Root Cause Analysis

### The Problem
The TypeScript language server was consuming 3+ GB of memory due to a **tsconfig.json misconfiguration** that created an include/exclude conflict.

### What Was Happening
1. **tsconfig.json included**: `.next/types/**/*.ts` and `.next/dev/types/**/*.ts`
2. **tsconfig.json excluded**: `.next`
3. This created a conflict where the language server loaded 4,135 auto-generated Next.js type files (924MB)
4. Every dev server restart regenerated these files, causing re-indexing
5. Result: Memory bloat + CPU heat + slow IDE performance

### Contributing Factors
- `.next` directory: 4,135 files, 924MB
- `dist` directory: 125 files, 105MB (Sanity build output)
- `node_modules`: 2.3GB
- Total indexed files before fix: ~105,695 files

## The Fix Applied

### 1. Fixed tsconfig.json (Line 31-44)
**Removed** the problematic includes:
```diff
  "include": [
    "next-env.d.ts",
    "app",
    "lib",
    "components",
    "hooks",
    "sanity",
    "tests",
    "middleware.ts",
    "sanity.config.ts",
    "sanity.cli.ts"
-   ".next/types/**/*.ts",
-   ".next/dev/types/**/*.ts"
  ]
```

**Why this works**:
- Next.js automatically generates types via the `next-env.d.ts` file
- The language server doesn't need to index the actual `.next/types` files
- The `exclude` array already properly blocks `.next`

### 2. Added /dist to .gitignore
The `dist` folder (Sanity Studio build output) should not be tracked in git.

## Verification Steps

1. **Reload VS Code window**: Cmd+Shift+P → "Developer: Reload Window"
2. **Monitor memory**: Activity Monitor → search "tsserver" or "node"
3. **Expected result**: Memory should stay under 500MB during normal operation
4. **Test**: Open multiple TypeScript files - memory should remain stable

## Cleanup Commands (Optional)

If you want to clean up tracked dist files from git:
```bash
git rm -r --cached dist
git commit -m "chore: remove dist build artifacts from git tracking"
```

## Prevention

The fix is permanent because:
- `.vscode/settings.json` already had correct exclusions (lines 35-44)
- `tsconfig.json` now aligns with VSCode settings
- `.gitignore` now properly excludes build artifacts
- No more conflicting include/exclude patterns

## Expected Performance After Fix

| Metric | Before | After |
|--------|--------|-------|
| Language Server Memory | 3+ GB | <500 MB |
| Files Indexed | ~105,695 | ~200-300 |
| CPU Usage | High (thermal throttling) | Normal |
| IDE Responsiveness | Sluggish | Instant |

## If Issues Persist

1. Clean build artifacts: `rm -rf .next dist node_modules/.cache`
2. Restart TypeScript server: Cmd+Shift+P → "TypeScript: Restart TS Server"
3. Check for other large directories being indexed
4. Consider adding more excludes to tsconfig if custom scripts generate large files
