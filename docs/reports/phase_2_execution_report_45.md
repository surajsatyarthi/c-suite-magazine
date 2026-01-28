# Phase 2: Implementation Plan - Issue #45 (Andy Jassy 404)

## Problem Summary

`/article/andy-jassy` returns 404 despite article existing at `/category/innovation/andy-jassy`.

## Root Cause (from Phase 1 Research)

`/article/[slug]` route missing ISR configuration:

- No `export const revalidate` → defaults to static generation
- No `export const dynamicParams` → 404 for non-pre-generated paths

## Proposed Solution

### File: `app/article/[slug]/page.tsx`

**Changes Required**:
Add two exports after the client configuration (line ~11):

```typescript
export const revalidate = 600; // Enable ISR (10-min cache)
export const dynamicParams = true; // Allow on-demand rendering
```

**Why This Works**:

1. `revalidate = 600`: Enables Incremental Static Regeneration with 10-minute cache
2. `dynamicParams = true`: Allows Next.js to render paths not in `generateStaticParams` on-demand
3. Matches the working pattern in `/category/[categorySlug]/[slug]/page.tsx`

**Location in File**:
After client creation (line 10), before the component function (line 12)

## Alternatives Considered

### Option A: Update next.config.ts redirect (REJECTED)

- **Pro**: Quick bandaid
- **Con**: Doesn't fix root cause, will break again
- **Why rejected**: This failed 5 times already

### Option B: Add generateStaticParams (REJECTED)

- **Pro**: Pre-generates paths
- **Con**: Requires knowing all slugs at build time, defeats purpose of redirect route
- **Why rejected**: This is an emergency redirect route, should handle ANY slug

### Option C (CHOSEN): Add ISR config

- **Pro**: Permanent fix to root cause
- **Pro**: Enables on-demand rendering
- **Pro**: Matches working route pattern
- **Con**: None identified

## Testing Plan

### Gate 5: Local Testing

```bash
pnpm build
pnpm start
curl -I http://localhost:3000/article/andy-jassy
# Expected: HTTP/1.1 307 Temporary Redirect
# Location: /category/innovation/andy-jassy
```

### Gate 7: E2E Testing

```bash
pnpm test:e2e
# Verify no regressions
```

### Gate 8: Staging Deployment

```bash
git push origin <branch>
# Verify preview deployment
curl -I https://<preview>.vercel.app/article/andy-jassy
# Expected: 200 OK after redirect
```

### Gate 9: Production Deployment

```bash
git push origin main
curl -I https://csuitemagazine.global/article/andy-jassy
# Expected: 200 OK after redirect
```

### Gate 10: 24-Hour Monitoring

Monitor for 24 hours:

- Hour 0, 6, 12, 24: `curl -I https://csuitemagazine.global/article/andy-jassy`
- Check Vercel logs for errors
- Verify no 404s in analytics

## Rollback Plan

If issues arise:

1. Revert commit
2. Deploy rollback
3. Article still accessible at `/category/innovation/andy-jassy`

## Success Criteria

- ✅ `/article/andy-jassy` redirects to `/category/innovation/andy-jassy`
- ✅ Returns HTTP 200 OK (after redirect)
- ✅ No 404 errors in logs for 24 hours
- ✅ No performance degradation

---

<!-- USER APPROVED -->

Approved by user on 2026-01-28 at 16:25 IST.
