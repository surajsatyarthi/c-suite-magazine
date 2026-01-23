# Ralph Protocol: Phase 4 CI/CD (Issue #18)

**Task**: Sanity Preview Sync (Issue #18)
**Phase**: Gate 4 (CI/CD Integration)

## 1. CI/CD Pipeline Status

The dynamic preview logic is now integrated into the `sanity.config.ts` which is part of the core deployment bundle managed by Vercel.

### Integration Points:

1.  **Vercel Build Environment**: Logic uses `NEXT_PUBLIC_VERCEL_URL` to determine the origin during build/SSR.
2.  **Runtime Environment**: Logic uses `window.location.origin` for real-time environment detection in the browser.

## 2. Infrastructure Deployment

| Component       | Status      | Verification                           |
| :-------------- | :---------- | :------------------------------------- |
| Dynamic Origin  | ✅ DEPLOYED | Successfully built in Gate 3.          |
| API Draft Route | ✅ ACTIVE   | Verified in `/app/api/draft/route.ts`. |

## 3. Permission Request

I request permission to proceed to **Phase 5 (Handover & Review)**.
