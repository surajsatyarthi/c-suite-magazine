# PRD: Footer SEO & CXO Interview Anchor (#20)

## Objective

To stabilize the repository's navigation layer for maximum SEO authority, specifically highlighting the "CXO Interviews" category as the site's primary revenue and content driver.

## Context

- **CXO Interviews** is the "Bread Winner" category.
- **CSA (Company Sponsored Articles)** are a subset of CXO Interviews.
- **Current State**: `/category/cxo-interview` is accidentally blocked in the code (returning 404).
- **Constraints**:
  - DO NOT modify the Strategic Partner Bar (yellow LinkedIn bar).
  - DO NOT modify the Header/Global Nav further.
  - Finalize navigation and "Lock the Gate".

## User Stories

- As a **Reader**, I want to easily find the latest CXO Interviews from any page.
- As a **Client**, I want my sponsored content to be logically grouped under the high-authority "CXO Interviews" umbrella.
- As **Google**, I want a clear hierarchical map of the most important content on the site via the footer.

## Technical Strategy

1.  **Restore Route**: Remove `cxo-interview` from the `REMOVED_SLUGS` set in `app/category/[categorySlug]/page.tsx`.
2.  **Footer Redesign**:
    - Implement a 3-column layout in `Footer.tsx`.
    - **Col 1 (Featured)**: CXO Interviews (Top), Executive Salaries, Magazine Archive.
    - **Col 2 (Topics)**: Leadership, Strategy, Science & Tech, All Tags.
    - **Col 3 (Brand)**: Logo & "Your Legacy Goes Global" tagline.
3.  **Link Cleanup**: Ensure all links use canonical paths.

## Acceptance Criteria

- [ ] `/category/cxo-interview` returns a 200 OK and displays articles.
- [ ] Footer displays "CXO Interviews" as the primary link in the first column.
- [ ] The "Strategic Partner Bar" remains unchanged.
- [ ] No more 404s in Footer links.
