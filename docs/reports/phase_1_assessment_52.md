# Phase 1 Assessment Report: Issue #52 (SEO Sentinel)

**Date**: 2026-01-28
**Author**: Antigravity Agent
**Status**: 🟡 IN PROGRESS

## 1. Problem Definition

The project requires a weekly automated email report summarizing SEO performance from Google Search Console (GSC).

- **Current State**: A script `scripts/seo/weekly-report-email.js` exists but is not scheduled in GitHub Actions.
- **Blocker**: The script implementation relies on a local file `.credentials/google-search-console.json` and `dotenv`, which is incompatible with a cloud-native CI/CD environment where secrets must be injected via Environment Variables.

## 2. Technical Assessment

**File**: `scripts/seo/weekly-report-email.js`

- **Lines**: 28-30 (File Read)
- **Dependency**: `googleapis`, `nodemailer`
- **Missing**: No GitHub Workflow (`.yml`) to trigger this script.

## 3. Implementation Plan

### Step 1: Refactor Script (Gate 2)

Modify `weekly-report-email.js` to implement a "Cloud First" authentication strategy:

1.  Check `process.env.GOOGLE_SEARCH_CONSOLE_JSON` first.
2.  Fallback to local file (for local dev).
3.  Throw error if neither is found.

### Step 2: Create Workflow (Gate 5)

Create `.github/workflows/seo-sentinel.yml`:

- **Schedule**: `0 9 * * 1` (Mondays at 09:00 UTC).
- **Secrets**: Inject `EMAIL_USER`, `EMAIL_PASS`, `GOOGLE_SEARCH_CONSOLE_JSON`.

## 4. Verification Plan (Gate 3)

Since the `GOOGLE_SEARCH_CONSOLE_JSON` secret does not yet exist in GitHub:

- **Test**: Run the refactored script locally without the secret.
- **Expectation**: "Graceful Failure" (Missing Credentials Error).
- **Why**: This proves the script compiles, runs, and hits the logic check. It confirms the changes didn't break the existing local file path (if the file existed) or the error handling.

## 5. Security & Risk (Gate 7)

- **Risk**: Exposing GSC credentials.
- **Mitigation**: Use GitHub Secrets (Encrypted). No hardcoded keys. Log output must mask credentials.

signed,
_Antigravity Agent_
