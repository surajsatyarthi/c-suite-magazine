# Issue #18: Sanity Preview Sync - Failure Analysis

**Date**: 2026-01-26
**Status**: BLOCKED - Failed after 6 attempts (96% session tokens used)
**Agent**: Claude Code (Sonnet 4.5)

## Problem Statement

External Sanity Studio at https://ceo-magazine.sanity.studio/ shows homepage instead of specific article when clicking "Preview" button for CSA/Post documents.

## Root Cause (Confirmed)

The `resolve.locations` function in `sanity.config.ts` is **NOT being executed** by the presentation tool. No debug logs appear in browser console, indicating the function is never called.

**Expected behavior**: When clicking Preview, the function should resolve document slug → article URL
**Actual behavior**: Defaults to base URL (https://csuitemagazine.global/)

## What Was Attempted (All Failed)

### Attempt 1: Environment Variables
- Added `NEXT_PUBLIC_FRONTEND_URL=https://csuitemagazine.global` to .env.local and Vercel
- Added `SANITY_API_READ_TOKEN` to Vercel
- **Result**: Vercel build failed (TypeScript cache error)

### Attempt 2: Fix draftMode() at Build Time
- Changed `generateStaticParams()` in category pages to use `getServerClient()` instead of `getFetchClient()`
- **Result**: Build passed locally, Vercel still failing

### Attempt 3: Embedded Studio
- Created `app/studio/[[...tool]]/page.tsx` with embedded studio
- Removed redirect from `next.config.ts`
- **Result**: Reverted - caused build failures

### Attempt 4: Deploy External Studio
- Ran `pnpm run sanity:deploy`
- Added debug logging to `sanity.config.ts` resolve.locations
- **Result**: Studio deployed but **debug logs never appeared** - function not executing

### Attempt 5: Clear Cache & Redeploy
- Deleted `dist/` folder
- Rebuilt and redeployed studio with fresh manifest
- **Result**: Same issue - resolve.locations still not executing

### Attempt 6: Verification
- Confirmed new manifest timestamp (11:36:18 vs 11:18:06)
- Hard refreshed studio (Cmd+Shift+R)
- **Result**: Homepage still showing, no debug logs

## Current State

### Working
✅ Vercel deployment successful (commit a85e0b3)
✅ Production site live at https://csuitemagazine.global
✅ Environment variables set in Vercel:
  - NEXT_PUBLIC_FRONTEND_URL (59m ago)
  - SANITY_API_READ_TOKEN (59m ago)
✅ Local build passes (`pnpm build` - 85 pages in 30s)
✅ draftMode() fix applied to category pages

### Broken
❌ Sanity Preview shows homepage instead of article
❌ `resolve.locations` function in sanity.config.ts NOT executing
❌ No debug logs appearing in console (lines 78, 85, 88, 109, 113, 120 should log)
❌ Studio deployment not picking up config changes

## Critical Discovery

**The deployed studio config is NOT using the local `sanity.config.ts` file.**

Evidence:
1. Debug logs added to resolve.locations (lines 78-128) never appear in console
2. Multiple deployments with `pnpm run sanity:deploy` don't change behavior
3. Studio always defaults to base URL without attempting slug resolution

## Files Modified (Commit a85e0b3)

### Environment
- `.env.local` - Added NEXT_PUBLIC_FRONTEND_URL and SANITY_API_READ_TOKEN
- Vercel env vars - Same variables added to production

### Code Changes
- `app/category/[categorySlug]/page.tsx:20-24` - Fixed draftMode() in generateStaticParams()
- `app/category/[categorySlug]/[slug]/page.tsx` - Same fix
- `app/csa/[slug]/page.tsx` - Same fix
- `app/tag/[tagSlug]/page.tsx` - Same fix
- `app/tag/page.tsx` - Same fix
- `sanity.config.ts:75-128` - Added debug logging to resolve.locations (NOT WORKING)
- `components/VisualEditing.tsx` - Created for preview mode

### Documentation
- Multiple reports and progress docs created (artifacts/)
- This failure analysis document

## Browser Console Errors (Relevant)

```
Framing 'https://csuitemagazine.global/' violates the following report-only Content Security Policy directive: "frame-ancestors 'self'"
```

This is **report-only** (not blocking) but confirms the iframe is loading the base URL.

**Critical**: NO `[Presentation Tool]` debug logs appear anywhere, proving resolve.locations is not executing.

## Next Steps to Fix

### Option A: Debug Why resolve.locations Isn't Called
1. Check Sanity documentation for presentationTool resolve.locations API changes
2. Verify the function signature matches current Sanity version
3. Test with minimal config (remove all conditionals, just return static location)
4. Check if presentation tool plugin is properly initialized

### Option B: Alternative Approach - Use productionUrl Only
The `productionUrl` function (lines 36-62) IS working for the "Open Preview" link.
Investigate if presentation tool can use productionUrl instead of resolve.locations.

### Option C: Embedded Studio
Previous attempt failed due to build errors. Investigate:
1. Why embedded studio caused build failures
2. If embedded studio bypasses the resolve.locations issue
3. Proper implementation without breaking production build

## Recommended Immediate Action

**Test locally first:**
```bash
# 1. Start local Sanity Studio
pnpm exec sanity dev

# 2. Open http://localhost:3333
# 3. Test if resolve.locations works in local studio
# 4. Check if debug logs appear locally
```

If local studio shows debug logs → deployment issue
If local studio doesn't show logs → config/API issue

## References

- Commit with changes: a85e0b3
- Last successful deployment: ceo-magazine-ju8so7zhp (2m ago)
- External studio: https://ceo-magazine.sanity.studio/
- Sanity config: sanity.config.ts:75-128

## Agent Performance Issues

**Mistakes made:**
1. Did not test locally before deploying (wasted 4 deployment cycles)
2. Did not immediately recognize resolve.locations wasn't executing (debug logs should have been first check)
3. Too many speculative attempts without diagnosing root cause
4. Used 96% of user's session tokens without resolution

**Should have done:**
1. Read Sanity presentationTool documentation FIRST
2. Test locally with `sanity dev` before any remote deployments
3. Add debug logs in FIRST attempt, not fourth
4. Stop and ask for help after 2 failed attempts instead of continuing

## For Next Session

**Start here:**
1. Read this failure analysis completely
2. Start local Sanity dev server: `pnpm exec sanity dev`
3. Test if resolve.locations executes locally
4. Check browser console for `[Presentation Tool]` logs
5. If local works → deployment config issue
6. If local fails → API/config issue with presentationTool setup

**Do NOT:**
- Deploy to production without local testing
- Make multiple attempts without understanding root cause
- Use more than 20% tokens before stopping to reassess
