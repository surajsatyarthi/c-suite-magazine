# Ralph Protocol: Phase 1 Assessment (Issue #18)

**Task**: Sanity Preview Sync (Issue #18)
**Phase**: Gate 1 (Assessment)

## 1. Findings (The "Why")

Current Sanity configuration uses hardcoded production URLs for "Open Preview" and Presentation Tool origins.

1.  **Environment Lock**: The `sanity.config.ts` file hardcodes `https://csuitemagazine.global` as the production URL and preview origin.
2.  **Lack of Flexibility**: When working on Vercel preview deployments or local development (outside of `localhost:3000`), the "Open Preview" link breaks or redirects to production, making it impossible to verify draft content on branch-specific deployments.
3.  **Missing Dynamic Detection**: The studio is mounted within the Next.js app, so it has access to the current browser origin, but this isn't being utilized to drive the preview routing.

## 2. Proposed Remediation (The "How")

- **Dynamic Origin Detection**: Implement a robust helper in `sanity.config.ts` that detects the base URL from `window.location.origin` (client-side) or environment variables (server-side/build).
- **Synchronize Tooling**:
  - Update `presentationTool` to use the dynamic origin for `previewUrl`.
  - Update `document.productionUrl` to use the dynamic origin.
- **Maintain Reliability**: Ensure the fallback remains the production URL (`https://csuitemagazine.global`) to ensure a safe default.

## 3. Permission Request

I request permission to proceed to **Phase 2 (Execution)** and apply these changes.
