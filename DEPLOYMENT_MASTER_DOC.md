# Master Deployment Rules & Protocol

**Last Updated:** December 1, 2025
**Scope:** C-Suite Magazine (`ceo-magazine`)

## 🚨 Critical Rules

1.  **NEVER Deploy Directly to Production**:
    *   Do NOT run `vercel --prod` directly.
    *   Do NOT push to `main` expecting an auto-deploy (unless specifically configured and verified).
    *   **ALWAYS** use the gated deployment script.

2.  **Preview First**:
    *   Every deployment must first go to a **Preview URL**.
    *   Automated smoke checks must pass on the preview before promotion to production.

3.  **Verification is Mandatory**:
    *   The system must verify version numbers, check for duplicate images, and ensure no missing assets before even attempting a build.

## 🛠️ The Deployment Command

The **ONLY** approved way to deploy is by running this script from the project root:

```bash
./scripts/deploy-gated.sh
```

### What This Script Does (The Workflow)

1.  **Pre-Flight Verification**:
    *   Checks `package.json` version format.
    *   Scans for duplicate images.
    *   Scans for articles with missing images.
    *   *If any check fails, the deployment is BLOCKED.*

2.  **Preview Deployment**:
    *   Builds the project locally (or via Vercel cloud).
    *   Deploys to a Vercel Preview URL.

3.  **Smoke Testing**:
    *   Runs `scripts/smoke-check.js` against the Preview URL.
    *   Checks for 200 OK status on critical pages (Home, Category, Article).
    *   *If smoke checks fail, the deployment is ABORTED.*

4.  **Production Promotion**:
    *   Only if all above steps pass, the script promotes the build to Production (`csuitemagazine.global`).

## 📋 Vercel Configuration

*   **Team Scope:** `suraj-satyarthis-projects`
*   **Project Name:** `ceo-magazine`
*   **Production Domain:** `csuitemagazine.global`

## 🆘 Troubleshooting

*   **"Verification Failed"**: Read the error log. You likely have a duplicate image or a bad version number. Fix it and retry.
*   **"Smoke Checks Failed"**: The preview site is broken. Check the Vercel logs for the preview deployment. Do NOT force a production deploy.
*   **"Unable to Connect"**: Check your internet connection or Vercel status.

## Quick Reference

| Action | Command |
| :--- | :--- |
| **Deploy to Live** | `./scripts/deploy-gated.sh` |
| **Check Smoke Status** | `node scripts/smoke-check.js` |
| **Verify Images** | `node scripts/comprehensive-duplicate-verification.js` |
| **Backup Sanity** | `npm run sanity:backup` |

## 🏗️ System Architecture & Key Decisions

### 1. Ad System (V2)
*   **Component:** `AdInterstitialV2.tsx` (New) vs `AdInterstitial.tsx` (Legacy/Deprecated).
*   **Triggering:** Ads are triggered automatically on page load/scroll. The manual "Ad Trigger" block has been **removed** from the schema.
*   **Sizing:** Popup ads use "Free Size" logic (standard `img` tag, no fixed height) to adapt to the creative's aspect ratio.

### 2. Image Rendering
*   **Sanity URL:** Always use `.fit('max')` to preserve the full image and aspect ratio. Never use hard crops like `.height(800)`.
*   **CSS:** Always use `object-contain` for inline images and ads to ensure they are fully visible. Avoid `object-cover` which cuts off edges.
*   **Backgrounds:** Do not add background colors (like `bg-gray-50`) to image containers; keep them transparent/white.

### 3. Data Safety & Backups
*   **Automated:** GitHub Actions runs a daily backup of the Sanity `production` dataset.
*   **Manual:** Run `npm run sanity:backup` to create a local `.tar.gz` backup in `exports/backups/`.
*   **Code:** All code is version-controlled in GitHub. Never work outside of git.
