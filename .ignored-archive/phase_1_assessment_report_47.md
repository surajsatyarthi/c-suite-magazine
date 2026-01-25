# Phase 1 Assessment Report - Issue #47: Missing Metadata Card

## 1. Problem Statement

Despite the implementation of a "C-Suite Editorial Team" fallback in Issue #44, the author details ("By ...") are reportedly missing from most articles. Visual proof from the user's screenshot confirms that while the metadata band exists, the author section is a blank space followed by a separator.

## 2. Audit Findings

- **Code Status**: Both `app/csa/[slug]/page.tsx` and `app/category/[categorySlug]/[slug]/page.tsx` contain the `post.writer ? (...) : (...)` ternary logic.
- **Visual Discrepancy**: The screenshot of `Sukhinder Singh Cassidy` shows the metadata row starting with a `|` separator but having no content to its left.
- **Root Cause Hypothesis**:
  - **Hypothesis A**: The `else` block for the writer is being rendered but styles (e.g., text color, visibility) are making it invisible.
  - **Hypothesis B**: The logic is failing due to `post.writer` being an empty object `{}` instead of `null`, bypassing the falsy check but failing to render properties.
  - **Hypothesis C**: The "Sukhinder Singh Cassidy" article specifically uses a different layout variant (Opinion/Interview) that wasn't updated.

## 3. Investigation Plan

- **Live DOM Verification**: Use the browser tool to inspect the metadata band on the `Sukhinder Singh Cassidy` article.
- **Data Audit**: Check the structure of `post.writer` when it's supposedly missing in Sanity.
- **Conditional Hardening**: Move the author details into a dedicated component to ensure consistent fallback across all article types.

## 4. Acceptance Criteria

- [ ] "By C-Suite Editorial Team" (or specific author) is visible on ALL articles.
- [ ] The metadata band is vertically centered and does not show leading separators when the first item is missing.
- [ ] No more "double pipes" or abandoned separators in the UI.
