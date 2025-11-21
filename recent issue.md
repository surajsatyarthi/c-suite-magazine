# Recent Issues and Resolutions

## Summary
- Vertical Brabus ad intermittently showed an old placeholder due to invalid CMS ad content.
- Force-placement approach was rejected; solution needed to remain CMS-driven.
- Fixed by detecting invalid placeholder links and falling back to a verified Brabus vertical creative only when CMS lacks a valid ad.
- Footer version updated to 3.3.3.3 and deployed; verified live and locally.

## Issues Faced
- Placeholder ad persisted on article sidebar even after CMS updates.
- Initial fix used forced placement which was not acceptable.
- CMS contained placeholder `example.com` target URLs treated as valid.
 - Sidebar “Trending Now” links caused a server-side exception (Digest: 3125437772) when the link’s category slug was missing/invalid, generating URLs like `/category/undefined/<slug>`.

## Resolutions
- Added invalid-ad detection: treat missing image or `example.com` target as invalid.
  - Implementation: `ceo-magazine/components/Ad.tsx:29-31`.
- Sidebar fallback to Brabus vertical ad only when invalid:
  - Implementation: `ceo-magazine/components/Ad.tsx:33-59`.
- In-article fallback guarded similarly and hardened global fallback:
  - Implementation: `ceo-magazine/components/Ad.tsx:61-88`, `94-118`.
- Footer version reads from `package.json` and was bumped to 3.3.3.3:
  - Rendering: `ceo-magazine/components/Footer.tsx:46`.
  - Source: `ceo-magazine/package.json:3`.
 - Fixed “Trending Now” link construction to safely build `/category/<cat>/<slug>` with a default fallback category and non-link render when slug is missing; disabled prefetch to reduce resource spikes on side menus.
   - Implementation: `ceo-magazine/app/category/[slug]/[article]/page.tsx:612-636`.

## Deployment & Verification
- Deployed with gated script:
  - Command: `pnpm deploy:prod`.
  - Script: `ceo-magazine/scripts/deploy-gated.sh:1-36`.
- Verified production URL responds and article pages render with Brabus fallback when CMS ad is invalid.
- Verified footer shows `v3.3.3.3`.
- Local verification: `npx next start -p 3010` then check homepage and an article.
 - Latest production build confirms “Trending Now” links navigate correctly under category-based routing.

## Notes
- CMS remains the primary source of truth for ads; fallback is strictly conditional on invalid/missing content.
- Vercel preview environments may require deployment protection bypass for automated checks. Production apex domain serves content normally.
 - If deploy errors reference authorization, log in once via `npx vercel login` and ensure the project is linked (`npx vercel link --project ceo-magazine`).

## References
- Ad invalid detection and fallbacks: `ceo-magazine/components/Ad.tsx:29-31`, `33-59`, `61-88`, `94-118`.
- Footer version rendering: `ceo-magazine/components/Footer.tsx:46`.
- Version source: `ceo-magazine/package.json:3`.
- Deploy script: `ceo-magazine/scripts/deploy-gated.sh:1-36`.
 - Trending links: `ceo-magazine/app/category/[slug]/[article]/page.tsx:612-636`.