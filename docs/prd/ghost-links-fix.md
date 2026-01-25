# Implementation Plan: Fix Ghost Links & Routing Duplication

## 1. Objective

Eliminate 404 "Ghost Links" for high-revenue articles (CSAs) by enforcing the use of the central `getArticleUrl` resolver across all components.

## 2. Root Cause Analysis (RCA)

- **Problem**: Components like `CategoryClient`, `ReadMoreArticles`, and `RelatedArticles` (sidebar) hardcode the `/category/[cat]/[slug]` URL pattern.
- **Impact**: Multi-category articles (e.g., Rich Stinson) generate multiple invalid routes. Since these articles are type `csa`, they only exist at `/csa/[slug]`, leading to 404s on the ghost routes.
- **Evidence**: The Spider Report found 7 broken links across 3 category prefixes (`/leadership/`, `/cxo-interview/`, `/ceo/`).

## 3. Proposed Changes

### 3.1. General

- Enforce `getArticleUrl` as the "Law of the Land" for all internal links.

### 3.2. Component Refactors

- **[MODIFY] [CategoryClient.tsx](file:///Users/surajsatyarthi/Desktop/ceo-magazine/app/category/%5BcategorySlug%5D/CategoryClient.tsx)**: Enforce `getArticleUrl`.
- **[MODIFY] [ReadMoreArticles.tsx](file:///Users/surajsatyarthi/Desktop/ceo-magazine/components/ReadMoreArticles.tsx)**: Enforce `getArticleUrl`.
- **[MODIFY] [GuestAuthors.tsx](file:///Users/surajsatyarthi/Desktop/ceo-magazine/components/GuestAuthors.tsx)**: **CRITICAL**: Change `/author/` to `getWriterUrl()`.
- **[MODIFY] [Search.tsx](file:///Users/surajsatyarthi/Desktop/ceo-magazine/components/Search.tsx)**: Enforce `getArticleUrl` for search results.
- **[MODIFY] [app/category/[categorySlug]/[slug]/page.tsx](file:///Users/surajsatyarthi/Desktop/ceo-magazine/app/category/%5BcategorySlug%5D/%5Bslug%5D/page.tsx)**: Enforce `getArticleUrl` in Related Articles.
- **[MODIFY] [app/csa/[slug]/page.tsx](file:///Users/surajsatyarthi/Desktop/ceo-magazine/app/csa/%5Bslug%5D/page.tsx)**: Enforce `getArticleUrl` and fix hardcoded category links.
- **[MODIFY] [app/writer/[slug]/page.tsx](file:///Users/surajsatyarthi/Desktop/ceo-magazine/app/writer/%5Bslug%5D/page.tsx)**: Enforce `getArticleUrl` for author's articles.
- **[MODIFY] [lib/urls.ts](file:///Users/surajsatyarthi/Desktop/ceo-magazine/lib/urls.ts)**: Add `getCategoryUrl` and `getTagUrl`.

## 4. Verification Plan

- **Automated**: Run `npx tsx scripts/the-spider.ts` and verify 0 broken links for the identified articles.
- **Manual**: Click through the "Leadership" and "CXO Interview" category pages and verify that Rich/Stella/Sukhinder articles link directly to `/csa/`.
- **Integrity**: Standard `validate-phase-report.sh` structural audit.
