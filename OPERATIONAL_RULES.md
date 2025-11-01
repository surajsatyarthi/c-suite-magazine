# Operational Rules

## Deployment Policy
- "Live" means: deploy the latest production build and ensure `csuitemagazine.global` points to it.
- Do not ask for confirmation; proceed with production deployment and alias update.
- Use `vercel build --prod` followed by `vercel deploy --prebuilt --prod`.
- After deploy, set alias: `vercel alias set <deployment-url> csuitemagazine.global`.

## Verification
- Open `https://csuitemagazine.global/` after deployment to confirm the site is live.
- Spot-check pages: `/search`, `/category/leadership`, `/author/<slug>`, and one `/article/<slug>`.

## Notes
- Project is linked to `suraj-satyarthis-projects/ceo-magazine`.
- Domain conflicts: operate within the existing Vercel project; do not add `csuitemagazine.global` to a different project.
