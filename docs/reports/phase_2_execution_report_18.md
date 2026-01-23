# Ralph Protocol: Phase 2 Execution (Issue #18)

**Task**: Sanity Preview Sync (Issue #18)
**Phase**: Gate 2 (Execution)

## 1. Work Completed

I have updated `sanity.config.ts` to implement dynamic origin detection for both the **Presentation Tool** and **Document Production URLs**.

### Changes:

- **Environment Detection**: Added logic to check `window.location.origin` (client-side) and `process.env.NEXT_PUBLIC_VERCEL_URL` (SSR/build) to determine the current base URL.
- **Dynamic Origin Support**:
  - Replaced the hardcoded `https://csuitemagazine.global` in `presentationTool.previewUrl.origin`.
  - Replaced hardcoded origins in `document.productionUrl` resolver.
- **Fallback Safety**: Maintained `https://csuitemagazine.global` as the final fallback for production reliability.

## 2. Verification Steps Taken

1.  **Static Analysis**: Verified that the GROQ query logic for category fetching remains intact.
2.  **Logic Audit**: Confirmed that `typeof window !== 'undefined'` correctly guards client-side only code.
3.  **Local Simulation**: Checked that the logic correctly prioritizes the current browser origin when running in the Studio.

## 3. Permission Request

I request permission to proceed to **Phase 3 (Verification)** to perform final checks and close the issue.
