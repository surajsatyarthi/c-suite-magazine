# Phase 1 Assessment Report: Issue #21 (Dynamic Metadata Debt)

**Date**: 2026-01-28
**Author**: Antigravity Agent
**Status**: 🟡 IN PROGRESS

## 1. Problem Definition

The site configuration (Title, Description, Keywords, OG Image) is currently **hardcoded** in `app/layout.tsx`.

- **Impact**: Editors cannot change SEO defaults without a code deployment.
- **Goal**: Move these values to a "Site Settings" singleton in Sanity.

## 2. Technical Assessment

### A. Current State

`app/layout.tsx`:

```typescript
export const metadata: Metadata = generateMetadata({
  title: "C-Suite Magazine...",
  description: "A premium magazine...",
  keywords: ['CEO', 'CXO', ...],
  ...
});
```

### B. Proposed Schema (`siteSettingsType.ts`)

We need a new singleton schema:

- `title` (string)
- `description` (text)
- `keywords` (array of strings)
- `ogImage` (image)

### C. Structure Update (`sanity/structure.ts`)

Add a new item "⚙️ Site Settings" pointing to document ID `siteSettings`.

## 3. Implementation Plan (Gate 2)

1.  **Schema**: Create `sanity/schemaTypes/siteSettingsType.ts`.
2.  **Registration**: Add to `sanity/schemaTypes/index.ts`.
3.  **Structure**: Add singleton to `sanity/structure.ts`.
4.  **Fetch Logic**: Create `getSiteSettings()` in `lib/sanity.ts`.
5.  **Integration**: Update `app/layout.tsx` to use fetched data.

## 4. Verification Plan (Gate 3)

1.  **Sanity Check**: Verify "Site Settings" appears in Studio.
2.  **Data Entry**: Enter dummy data (e.g., "Updated Title").
3.  **Frontend Check**: Verify `document.title` reflects the Sanity data locally.

signed,
_Antigravity Agent_
