# Operational Rules

## Revenue Impact & Approval Policy
- The site is live; any production issue costs $5,000 per day.
- Treat every change, approval, and deploy as high‑risk. No shortcuts.
- Deploy only after passing typecheck (`npx tsc --noEmit`), production build, and preview smoke checks (`scripts/deploy-gated.sh`).
- Approvals require proof on actual production URLs, not local only.
- Violations require immediate rollback and remediation; document root cause.

## Deployment Policy
- "Live" means: deploy the latest production build and ensure `csuitemagazine.global` points to it.
- Do not ask for confirmation; proceed with production deployment and alias update.
- Use `vercel build --prod` followed by `vercel deploy --prebuilt --prod`.
- Before deploy, lock project link with team scope: `vercel link --project ceo-magazine --yes --scope suraj-satyarthis-projects`.
- After deploy, set alias: `vercel alias set <deployment-url> csuitemagazine.global --scope suraj-satyarthis-projects`.
  - Before building, verify environment configuration:
    - `npx vercel env ls`
    - `npx vercel env pull .env.local`

## Verification
- Open `https://csuitemagazine.global/` after deployment to confirm the site is live.
- Spot-check a few `/category/<category>/<article>` pages.
 - Confirm `Development Server` in docs uses port `3000` (local tests).

## Notes
- Project is linked to `suraj-satyarthis-projects/ceo-magazine`.
- Domain conflicts: operate within the existing Vercel project; do not add `csuitemagazine.global` to a different project.
 - For detailed, canonical steps, see `PROJECT_DOCUMENTATION.md` → Deployment Runbook.

## Cookies & Routing Conventions

- Country cookie key: `user-country` (client and API must use this key consistently).
- Precedence: `user-country` cookie → CDN geolocation headers (Vercel/Cloudflare) → default.
- Routing terminology:
  - Attribution routes/pages use `writer` only (e.g., `/writer/[slug]`).
  - Deprecate any `/author/*` routes; redirect if present.

## Content Hygiene & Interview Formatting
- Apply unified interview/Q&A detection on `category/[slug]/[article]` pages.
- Strip duplicate title paragraphs from the start of the body before rendering.
- Sanitize body blocks to drop HR markers, code fences, image paths, empty spans, and unknown types.
- Prefer `PortableBody` for array body content; only render string bodies with normalized whitespace.
- Keep `NEXT_PUBLIC_INTERVIEW_QA_FORMATTER` available; pass explicit `interviewMode` from pages when heuristics detect Q&A.
- Author bios: render as Portable Text when array; otherwise render as plain text only.
- When importing content, run `scripts/cleanup-rtf-noise.js` and `scripts/lint-content.js` to pre-clean anchors, captions, and footer noise.

## Bullet List Normalization
- Convert paragraphs starting with bullet glyphs (•, –, —, •) into semantic list items during render.
- Bold the leading phrase before the first colon in list items (e.g., "Active Commuting:" → bolded).
- Keep consistent list spacing and grouping; avoid double bullets or nested paragraphs.
- This normalization applies globally via `components/PortableBody.tsx`.

## Tags (Article Pages Only)
- Display tags only on the full article page (`app/category/[slug]/[article]/page.tsx`).
- Placement: render tag chips below the main body content, above related posts.
- Styling: use header blue `#082945` for text; light blue chip backgrounds (`bg-[#082945]/10`) with subtle border and hover (`/20`).
- Content: use common, short words; Title Case; prefer 3–5 tags per article; avoid duplicating the primary category unless clarifying.
- Chips are informational only (no links to tag pages).
## Systems-First Rule: No Shortcuts

- Do not patch individual slugs ad hoc when an issue is systemic.
- Codify fixes in reusable scripts (e.g., `scripts/batch-sanitize-rtf-posts.js`) and run them across all affected content.
- Document the change in `PROJECT_DOCUMENTATION.md` and add it to the import checklist.
- Before closing tasks, run a quick local preview on representative pages to visually confirm formatting.

## Required Post-Import Cleanup

- After any RTF or Markdown import:
  - Run `node scripts/batch-sanitize-rtf-posts.js`.
  - Run `node scripts/lint-content.js` and `node scripts/fix-excerpts.js`.
  - Verify two article pages render clean first paragraphs and correct punctuation.

## Writer Policy (MANDATORY)

- Every article must have exactly one assigned Writer (Sanity `writer` reference to an approved writer document).
- No other roles are acceptable for attribution — do not use `author`, `editor`, or any alternate fields in content or UI.
- Auto-assign rule: if a post is missing a Writer, auto-assign from the approved writers list using `node scripts/auto-assign-missing-writers.js [--default <writer-slug>]`.
- Publishing gate: do not publish or deploy any article lacking a `writer` reference. Enforce via schema validation and preflight checks.
