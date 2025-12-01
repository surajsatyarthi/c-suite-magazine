# Article Import Rules

This document codifies all rules and procedures for importing articles into the site. It consolidates behavior from code, scripts, and agreed policies so imports are consistent and auditable.

## Accepted Formats
- Markdown + front matter (YAML)
- JSON Lines (one JSON object per line)
- CSV (one row per article)
- Word `.docx` (converted to Markdown with sanitizer)
- RTF (converted via import scripts)

## Required Fields
- `title` (string)
- `slug` (lowercase, dash‑separated, ≤60 chars preferred)
- `excerpt` (short summary)
- `writerSlug` (writer/interviewee slug)
- `categories` (array of category slugs; 1–3)
- `publishedAt` (ISO 8601, e.g., `2025-11-15T09:00:00Z`)
- `body` or `bodyMd` (Portable Text blocks or Markdown body)

## Recommended Fields
- `mainImageUrl` and `mainImageAlt` (hero image; alt is mandatory if present)
- `ogImageUrl` (1200×630, <500 KB preferred)
- `seo.metaTitle`, `seo.metaDescription`
- `canonical` (category‑prefixed if available)
- `tags` (array of strings)

## Slug Rules
- Lowercase; dash‑separated; alphanumerics only
- Strip/replace accents; remove special characters
- Limit to ~60 characters; trim trailing dashes
- Must not start with `#`

## Category Rules
- Use existing category slugs from `CATEGORIES_REFERENCE.md`
- Interview features: may include `cxo-interview`; prefer adding a real industry category alongside
- If a category is missing, system will attempt to create it (scripts) but it’s better to predefine
- Cleanup scripts can reassign or remove special categories when needed

## Writers Only (Site Policy)
- The site has only writers. Do not show or refer to “author” or “editor” in the UI.
- Writer-of-record is stored in the `editor` field in Sanity (until backend rename to `writer`). Treat `editor` as the writer everywhere. API payloads must use `writerSlug`.
- Set writer via: `scripts/assign-writer.js --slug <post-slug> --writer <writer-slug> [--name "Writer Name"]` or batch with `scripts/assign-writers-batch.js`.
- Client can never be the writer: the writer slug must not equal the interview subject.
- If no writer is provided: assign from the approved writers list (`tmp-writers.csv`).

## Views Policy
- Do NOT auto‑update or seed views during import (marketing controls views)
- The site reads views from `config/views.json` first (slug → numeric views), then falls back to `post.views` if present
- Trending lists order by views but values are marketing‑set; code does not mutate them

## Image Rules
- Hero (main): ~1600×900, JPG/PNG; meaningful `alt`
- OG: 1200×630, JPG/PNG; keep under ~500 KB
- Filenames: lowercase, dashes, no spaces
- Importers upload assets to Sanity when provided; else keep URLs stable
- Each article must include a hero image (main) — no articles without an image

### DOCX Source & Local Hero Policy (CXO Full Articles)
- DOCX articles are placed at: `/Users/surajsatyarthi/Desktop/Magazine/word-articles` and imported via `pnpm run import:docx`.
- Hero images for full CXO articles are curated local assets at: `/Users/surajsatyarthi/Desktop/Magazine/ceo-magazine/public/Featured hero`.
- Matching logic: the site prefers a curated local hero when a file exists whose base name matches either the article slug or the writer name (normalized to lowercase, dots removed, underscores/hyphens → spaces, collapsed spaces). Exact matches are preferred; partial includes are a fallback.
- File format: provide `.webp` assets for each curated hero. PNG/JPG may be present alongside, but `.webp` is preferred and should exist for every hero.
- Display rule: when a curated hero exists, the article page uses it (portrait ratio ~2/3). If no curated image is found, the page falls back to the Sanity `mainImage`.
- DOCX imports do not set `mainImage`. Rely on curated local hero for full articles, or set `mainImage` separately using `scripts/set-post-image.js`.

Checklist (Full Article Imports)
- Place `.docx` in `word-articles` (name using intended slug for clarity).
- Ensure writer exists (or pass `--author "Writer Name"` to importer).
- Ensure a curated hero `.webp` exists in `public/Featured hero` named after the writer or the article slug.
- Verify route: `/category/<category>/<slug>` and metadata generated.

## Formatting & Encoding
- UTF‑8, no BOM; avoid smart quotes and non‑breaking spaces
- Allowed Markdown: headings, paragraphs, lists, links, quotes, basic images
- Avoid embedded HTML, tables, and pasted styling
- Sanitizers remove RTF control words, merge soft‑wraps, normalize punctuation
- Titles: meaningful, single line (no line breaks); avoid shouting/casing anomalies
- Body text must not contain raw code/artifacts: no inline font names, no raw HTML tags (e.g., `<h1>`), no literal RTF control words, and no pasted image link syntax inside the text body
- Use proper formatting: paragraphs, bold, underline (as applicable), bullet points; images are attached via fields, not inline links in body

## Canonical & SEO
- Canonical URL: `https://csuitemagazine.global/category/<cat>/<slug>` if category available; else `https://csuitemagazine.global/article/<slug>`
- Next.js `generateMetadata` sets OG/Twitter tags using `lib/seo.ts`
- JSON‑LD: `Article` schema + `BreadcrumbList` injected on article pages

## Import Channels
- API (requires server write token configured):
  - `POST /api/writers` ({ name, slug })
  - `POST /api/articles` (payload with fields above; supports `writerSlug` and `categorySlugs`)
  - Note: `/api/authors` is deprecated and will sunset; use `/api/writers`. `authorSlug` is deprecated; use `writerSlug`.
- Direct Sanity (write token):
  - `scripts/import-single-rtf-direct.js "<file>.rtf" --category <slug>`
  - `scripts/import-post-from-exports.js <slug>` (from `exports/posts/<slug>.json`)
- Conversion helpers:
  - `scripts/convert-single-rtf-to-json.js "<file>.rtf"` → `exports/posts/<slug>.json`
  - `scripts/import-rtf-articles.js` / `scripts/import-rtf-batch.js` for RTF sets

## Environment Requirements
- Set in Vercel → Project `ceo-magazine` → Environment Variables (Production):
  - `SANITY_WRITE_TOKEN` (preferred) or `SANITY_API_TOKEN` (write‑scoped)
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`

## Pre‑Import Checklist
- Verify slugs, categories, and `publishedAt` format
- Ensure hero and OG images exist and have proper `alt`
- Confirm interviewee and intended writer mapping (no "author" terminology)
- Remove/clean Word/RTF styling artifacts (use sanitizer/conversion scripts)

## Post‑Import Verification
- Article page renders (title, excerpt, body, images)
- Metadata: canonical, OG/Twitter, JSON‑LD present
- Breadcrumb: Home → Category → Article works
- Category/Trending lists display views from `config/views.json` (or Sanity fallback)
- Optional: run `scripts/lint-content.js` and `scripts/list-broken-images.js`

## Notes & References
- Views policy: documented in `OPERATIONS_RUNBOOK.md`
- Content import guide examples: `PROJECT_DOCUMENTATION.md`
- Writer assignment: `scripts/assign-writer.js`
- Interview detection and display logic: `app/article/[slug]/page.tsx` and `app/category/[slug]/[article]/page.tsx`

---
This document is source‑controlled. Update it whenever import behavior or policies change.
