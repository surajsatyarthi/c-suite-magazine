# Phase 1: Physical Audit - Issue #57

## Problem Statement

A senior FAANG engineer code review identified critical accessibility violations, code organization chaos, duplicate components, and API error handling safety risks. We need to validate these findings physically before planning fixes.

## Physical Verification

### 1. Accessibility Violation

- **Code Check**: `styles/accessibility.css`
- **Finding**: Confirmed. Lines 4-16 explicitly set `outline: none !important` for all focus states.
- **Evidence**:
  ```css
  /* styles/accessibility.css:4-16 */
  *:focus, *:focus-visible /* ... */ {
    outline: none !important;
  }
  ```
- **Impact**: Critical WCAG violation. Keyboard users cannot navigate the site.

### 2. Code Organization (Scripts Chaos)

- **Command**: `ls -F scripts/ | wc -l`
- **Result**: `286` items.
- **Finding**: Confirmed. Directory contains hundreds of likely temporary or one-off scripts (e.g., `audit_issue_22.ts`, `migration_final_final.ts`).

### 3. Duplicate Components

- **Code Check**:
  - `components/PortableBody.tsx` (564 lines)
  - `components/PortableBodyV2.tsx` (564 lines)
- **Finding**: Confirmed. Files appear to be near-identical copies.
- **Impact**: Maintenance nightmare. Fixes in one won't propagate to the other.

### 4. API Error Handling

- **Code Check**: `app/api/articles/route.ts`
- **Finding**: Confirmed. `upsertArticle` calls `resolveWriterRef` and `resolveCategoryRefs` but does not check if they return valid references before using them.
- **Evidence**:
  ```typescript
  // app/api/articles/route.ts:60
  async function upsertArticle(payload: ArticlePayload) {
    const writerRef = await resolveWriterRef(payload);
    // No check if writerRef is undefined before proceeding
  }
  ```
- **Nuance**: The code technically handles `undefined` by just omitting the field (`...(writerRef ? ...)`). However, the reviewer's point is valid: if I send a writer slug that doesn't exist, I probably want an ERROR, not a silent success where the article is created without a writer.

## External Research (Gate 2)

### Search 1: WCAG custom focus indicators

- **Query**: "WCAG accessible focus indicators custom design examples"
- **Finding**: Removing `outline` without replacement is a hard failure (WCAG 2.4.13). Best practice is not to stick to `browser default` (which designers hate) but to use `box-shadow` or `outline-offset` to create a visible, high-contrast ring that matches the brand.
- **Strategy**:
  - Use `outline: 2px solid #COLOR` with `outline-offset: 2px`.
  - Use `:focus-visible` to only show this for keyboard users (mouse users won't see it).

### Search 2: Next.js Error Boundaries

- **Query**: "Next.js 15 error boundary implementation best practices"
- **Finding**:
  - `global-error.tsx` (root) catches layout errors.
  - `error.tsx` (segment) catches page components errors.
  - Must be `"use client"`.
  - Should log to monitoring (e.g., console for now).
- **Strategy**: Implement a root `global-error.tsx` to prevent white screens of death.

## Root Cause Hypothesis

- **Accessibility**: Excessive aesthetic control ("disable focus visuals per UI request" comment) overrode accessibility standards.
- **Scripts**: Lack of "cleanup" culture; accumulation of rigid, one-off automation scripts.
- **Duplicates**: Forking code (`V2`) to test changes without deleting/merging the original.
- **API**: Optimistic coding style (assuming inputs are valid) vs. defensive coding (failing fast).

## Next Steps (Gate 3)

- Create `docs/reports/phase_2_execution_report_57.md`.
- Plan specifically for:
  - Accessibility fix (brand-aligned focus ring).
  - Deleting 200+ scripts (start with backup files).
  - Merging `PortableBody`.
  - API validation.
