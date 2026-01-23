# PRD: Sanity Preview Sync (#18)

## 1. Objective

Connect Sanity Studio "Open Preview" and Presentation Tool to dynamic Vercel deployments. Ensure editors can preview content on branch previews as well as production without manual URL configuration.

## 2. User Stories

### 2.1 Editor Dynamic Preview

**As an editor**, I want the "Open Preview" button and Presentation Tool in Sanity Studio to automatically link to the current environment's URL (Production, Preview, or Localhost), so I don't have to worry about which environment I'm in.

### 2.2 Accurate Routing

**As an editor**, I want the preview links to correctly resolve to the appropriate page structure:

- Posts: `/category/[category]/[slug]`
- CSAs: `/csa/[slug]`

## 3. Acceptance Criteria (AC)

- [ ] **AC 1: Dynamic Origin Recovery** - `sanity.config.ts` must detect its own origin via `window.location.origin` or a robust fallback to `VERCEL_URL` / `NEXT_PUBLIC_VERCEL_URL`.
- [ ] **AC 2: Presentation Tool Configuration** - Update `presentationTool` to use the dynamic origin for `previewUrl`.
- [ ] **AC 3: Production URL Sync** - Update `document.productionUrl` in `defineConfig` to match the dynamic environment origin.
- [ ] **AC 4: Path Resolution Integrity** - Maintain existing GROQ-based category fetching logic for posts to ensure URLs are accurate.
- [ ] **AC 5: Verification Proof** - Demonstrate that "Open Preview" generated URLs match the current hostname.

## 4. Technical Strategy

1. Modify `sanity.config.ts` to implement a `getBaseUrl()` helper.
2. Update `presentationTool` and `productionUrl` to use `getBaseUrl()`.
3. Test locally by simulating different origins if possible, or verify logic correctness via static analysis.

## 5. Security Considerations

- The `api/draft` route already uses `@sanity/preview-url-secret` for validation, which is the gold standard for Sanity + Next.js security.
