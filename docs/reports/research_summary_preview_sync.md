# Ralph Protocol: Research Summary (Sanity Preview Sync)

**Date**: 2026-01-26
**Subject**: Sanity Visual Editing & Live Preview Synchronization

## 1. Research Findings

### A. Stega Encoding Requirements

- **Metadata Requirement**: Sanity Visual Editing relies on "Stega Encoding" (invisible metadata embedded in strings) to map UI elements back to Sanity Studio fields.
- **Client Configuration**: The client must explicitly enable stega. Without `stega: { enabled: true }`, the Presentation Tool cannot "see" the fields, leading to sync silence.
- **Studio URL**: The `studioUrl` must be defined in the client config so the frontend knows where the editor lives.

### B. Perspective Management

- **`previewDrafts`**: The client MUST use `perspective: 'previewDrafts'` to see unpublished changes.
- **Token Sensitivity**: Stega and `previewDrafts` both require an authenticated client (Viewer/Read token). If the token is missing or invalid, the client fallbacks to public data, breaking the live sync.

### C. Live Query Integration

- While `draftMode()` enables the session, real-time "hot" updates in the App Router often require `VisualEditing` component to be active and the data to be fetched with a stega-enabled client.

## 2. Gap Analysis (Current Codebase)

- ❌ `lib/sanity.ts`: Missing `stega` configuration.
- ❌ `lib/sanity.server.ts`: Missing `stega` configuration in `getServerClient`.
- ⚠️ `app/api/draft/route.ts`: Uses `SANITY_API_TOKEN` which might be a write token. Recommend standardizing on `SANITY_API_READ_TOKEN` for previews.

## 3. Recommended Remediation

1.  Enable `stega` in `lib/sanity.ts` with a dynamic check.
2.  Enable `stega` in `lib/sanity.server.ts` when a token is present.
3.  Standardize token environment variable names to avoid confusion.
