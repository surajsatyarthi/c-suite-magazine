# Phase 2: Implementation Plan - Issue #57

## Proposed Solution

### Root Cause

- **Accessibility**: Explicit `outline: none` CSS.
- **Chaos**: Accumulation of unmanaged scripts.
- **Resilience**: Missing input validation and global error handling.

### Fix Strategy

- **Accessibility**: Reinstate visible focus using `:focus-visible` to satisfy WCAG without impacting mouse users.
- **Cleanup**: Aggressive deletion of temp scripts; strict "keep list" for production scripts.
- **Safety**: Fail-safe API validation and a global error boundary.

### Changes Required

#### File: styles/accessibility.css

- **Remove**: `outline: none`
- **Add**:
  ```css
  *:focus-visible {
    outline: 2px solid #c8ab3d !important;
    outline-offset: 2px !important;
  }
  ```

#### File: components/PortableBody.tsx

- **Action**: Merge any unique logic from V2 (none found), then delete V2.

#### File: app/api/articles/route.ts

- **Add**: Null checks for `writerRef` and `categoryRefs`.
- **Return**: `400 Bad Request` if invalid.

#### File: app/global-error.tsx (NEW)

- **Add**: Standard Next.js Global Error UI.

## Alternatives Considered

- **Option A**: Delete `accessibility.css` entirely.
  - _Pro_: Simplest.
  - _Con_: Reverts to browser default (ugly blue ring), often rejected by designers.
- **Option B** (Chosen): Custom Gold Focus Ring.
  - _Pro_: Brand aligned + Accessible.

## Testing Plan

1. **Local**:
   - `pnpm build` (verify script deletion didn't break build).
   - Tab through UI.
   - Curl API with bad data.
2. **Staging**: Deploy and verify.

## User Approval

⏳ Awaiting user review...
