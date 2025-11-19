# Operations Runbook – C‑Suite Magazine

## Script Exit Codes and Error Logging

- Exit codes:
  - `0` indicates success with no failures.
  - `1` indicates one or more failures were encountered.
- Error lines are prefixed with `ERROR` for easy parsing in logs and CI.
- Examples:
  - Validate exports: `node scripts/validate-exported-posts.js ceo-magazine/exports`
    - On failure: lines like `ERROR file.json: missing title, slug` and exit `1`.
  - Backfill categories: `node scripts/backfill-categories-in-exports.js ceo-magazine/exports`
    - On error: lines like `ERROR file.json: <message>` and exit `1`.

## Link Prefetch Policy

- Disable `prefetch` on large grids and result lists to reduce bandwidth and CPU:
  - Category grids: `prefetch={false}` on article links.
  - Writer grids: `prefetch={false}` on article links.
  - Large listings: set `prefetch={false}` on list item links.
- Keep `prefetch` enabled for low-count navigation (header, footer, key routes) where link count is small.
- Rationale: Avoid pre-loading hundreds of pages in bulk lists; preserve snappy navigation while optimizing resource usage.

This runbook documents the standard operating procedures for DNS, deployments, environment variables, content import, SEO, and verification. It is designed so you can resume confidently and avoid repeated mistakes.

## Domain & DNS
- Registrar: GoDaddy (previously `ns09/ns10.domaincontrol.com`).
- Nameservers (now authoritative): `ns1.vercel-dns.com`, `ns2.vercel-dns.com`.
- Vercel DNS records (preloaded):
  - Web: `A @ → 76.76.21.21`, `CNAME www → cname.vercel-dns.com`.
  - Email (GoDaddy Workspace): MX `smtp.secureserver.net (prio 0)`, MX `mailstore1.secureserver.net (prio 10)`, SPF `v=spf1 include:secureserver.net -all`, DKIM CNAMEs `secureserver1._domainkey`/`secureserver2._domainkey`, DMARC TXT `_dmarc`, SRV `_autodiscover._tcp`.
- Verify nameserver status:
  - `npx vercel domains inspect csuitemagazine.global`
  - Apex should serve latest prod; `www` redirects to apex.

## Deployments
- Preferred (no waiting): connect GitHub repo to Vercel project `ceo-magazine` and set Production branch to `main`.
  - Every push → cloud build → auto expose to `csuitemagazine.global`.
- CLI (hardened) when needed:
  - Prebuild: `npx vercel build --prod`
  - Deploy: `npx vercel deploy --prebuilt --prod --yes --archive=tgz`
  - If rate‑limited, use dashboard redeploy or `npx vercel --prod --archive=tgz` (cloud build).
- Gated script: `scripts/deploy-gated.sh` builds preview, smoke‑checks, builds prod, and promotes.

## Environment Variables
- Client‑side:
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`.
- Server‑only:
  - `SANITY_API_TOKEN` (Viewer/read scope; dataset: `production`).
- Add in Vercel Project Settings → Environment Variables (Production).

## Sanity Data Fetching
- Server API `/api/categories`: tokened client with edge caching; falls back gracefully.
- Pages prefer the tokened server client (`lib/sanityWrite.ts`) with ISR (`revalidate: 600`).
- Views: runtime endpoint `/api/views` increments a post’s `views` count when called.
  - Marketing can still provide seeded baseline counts via import.
  - Import scripts do not randomize views.

## Author → Writer Migration

Runtime and schema now use "writer" exclusively. To ensure your dataset matches, run the migration below. It is safe, preserves document IDs, and keeps existing post references intact.

Steps
- Ensure `.env.local` contains: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, and a write token (`SANITY_API_TOKEN` or `SANITY_WRITE_TOKEN`).
- Dry-run: `node scripts/migrate-authors-to-writers.js`
  - Prints current counts and planned number of documents to migrate.
- Apply: `node scripts/migrate-authors-to-writers.js --apply`
  - Converts `_type: "author"` documents to `_type: "writer"` via `createOrReplace`, preserving `_id`.
- Verify: `node scripts/verify-author-writer-state.js`
  - Confirms zero `author` docs remain and reports writer/post counts.

Notes
- Existing post `writer._ref` relationships remain valid because document IDs are unchanged.
- Sanity Studio lists `Writer` documents and the `Post` schema references `writer` only.
- Legacy `/api/authors` route is removed. For imports, use `/api/articles` with `writerSlug` or call import scripts directly.

## Export Normalization (Writer-Only)

Normalize exported post JSONs to include a top‑level `writerSlug` so imports resolve writers consistently.

- Run: `node scripts/normalize-exported-posts.js exports/posts`
- Optional cleanup: `node scripts/normalize-exported-posts.js exports/posts --remove-authorSlug`
- Resolution order: `writerSlug` → `writer.slug.current` → `authorSlug` → `author.slug.current` → slugified `writer.name`/`author.name`/`byline`.

### Category Backfill (Exports)
- Validate exports: `node scripts/validate-exported-posts.js exports/posts`
- If there are failures for missing `categories`, backfill a safe default:
  - `node scripts/backfill-categories-in-exports.js exports/posts --categories=leadership`
- Re‑validate and ensure `Failures: 0` before running imports.

## Content Import – Recommended Formats
- Markdown + front matter (per article) or JSON Lines / CSV.
- See `PROJECT_DOCUMENTATION.md` → “Content Import Guide” for templates.
- Minimum fields: `title`, `slug`, `excerpt`, `writerSlug`, `categories`, `publishedAt`, `mainImageUrl` + `alt`, `ogImageUrl`, `metaTitle`, `metaDescription`, `canonical`, `bodyMd`.

## SEO & Metadata
- Article/category pages export `generateMetadata` using `lib/seo.ts`.
- JSON‑LD injected:
  - `Article` (headline, writer, publisher, dates, wordCount, readTime).
  - `BreadcrumbList` (Home → Category → Article).
- Canonicals:
  - Article with category: `https://csuitemagazine.global/category/<cat>/<slug>`.
  - Else: `https://csuitemagazine.global/article/<slug>`.

## Security Headers & CSP
- Configured in `next.config.ts`:
  - HSTS, Referrer‑Policy, X‑Content‑Type‑Options, Permissions‑Policy, X‑Frame‑Options.
  - `Content-Security-Policy` and `Content-Security-Policy-Report-Only` for diagnostics.
- `img-src` allows `https:`/`data:`/`blob:`; `connect-src` permits Sanity/Vercel endpoints.

## Image Optimization
- `components/OptimizedImage.tsx` sets responsive `sizes`, blur placeholder, and respects `priority`.
- Next.js images config enables AVIF/WebP and caches for performance.

## Verification Checklist (MANDATORY)
1. DNS: `npx vercel domains inspect csuitemagazine.global` shows Vercel nameservers.
2. Apex/web:
   - `https://csuitemagazine.global/` loads.
   - `https://www.csuitemagazine.global/` redirects to apex.
3. API: `/api/categories` returns categories and `Cache-Control` headers.
4. Pages: open a category and an article; confirm metadata and JSON‑LD present.
   - Legacy path check: `/author/<slug>` 301‑redirects to `/writer/<slug>` and loads profile.
5. Headers: check response headers for CSP, HSTS, Referrer‑Policy, etc.
6. Lighthouse/Speed Insights snapshot (optional) for performance.

## Rollback & Troubleshooting
- Rollback via Vercel dashboard or `npx vercel rollback <deployment-id>`.
- If CLI rate‑limited: use dashboard redeploy or push a tiny Git commit.
- If Sanity reads fail: verify `SANITY_API_TOKEN` exists (Production) and dataset is correct.
- If email issues: re‑validate MX/SPF/DKIM/DMARC values in Vercel DNS.

---
This runbook is versioned in the repo. Update it whenever DNS, deploy, or content processes change.
