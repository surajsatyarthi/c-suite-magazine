# PRD: Issue #43 - Ghost Links Resolution

## 1. Context

High-revenue articles (Stella, Rich, Sukhinder) are experiencing 404 errors because frontend components are manually constructing URLs using a hardcoded `/category/` prefix, while these articles are of type `csa` (Company Sponsored) and must reside at `/csa/`.

## 2. Requirements

### 2.1. Centralized URL Resolution

- **Rule**: NO component or page may manually construct an article or category URL using string templates.
- **Resolver**: All links must utilize `getArticleUrl` or `getCategoryUrl` from `lib/urls.ts`.

### 2.2. lib/urls.ts Hardening

- Implement `getCategoryUrl(categorySlug: string)` to prevent manual `/category/${cat}` templates.
- Ensure `getArticleUrl` correctly handles `_type` checks to return either `/csa/` or `/category/` paths.

### 2.3. Targeted Components

The following files must be refactored:

- `app/category/[categorySlug]/CategoryClient.tsx`
- `app/category/[categorySlug]/[slug]/page.tsx`
- `app/csa/[slug]/page.tsx`
- `app/writer/[slug]/page.tsx`
- `components/ReadMoreArticles.tsx`
- `components/Search.tsx`

## 3. Success Metrics

- 0 404 errors for Stella, Rich, and Sukhinder articles.
- Crawler report (The Spider) confirms 0 internal broken links.
