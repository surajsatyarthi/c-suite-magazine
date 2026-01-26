# Phase 1 Assessment Report: Issue #48 (Sanity Backup Fail)

**Date**: 2026-01-27
**Author**: Antigravity
**Issue**: #48 Daily Sanity Backup Failure
**Gate**: 1 (Assessment & Reproduction)

## 1. Problem Statement

The automated daily backup of the Sanity dataset to Google Drive is failing. This poses a critical risk (RICE Script: 500) as data loss could occur without recovery points.

## 2. Component Analysis

- **Script**: `scripts/backup-sanity.ts`
- **Workflow**: `.github/workflows/sanity-backup.yml`
- **Dependencies**:
  - `googleapis` (for Drive upload)
  - `@sanity/cli` (via `npx` spawn)
  - `sanity` (project dependency)

## 3. Findings & Hypothesis

### 3.1. Redundant External Dependency

The script currently spawns `npx -y @sanity/cli dataset export ...`.

- **Risk**: Downloads latest CLI version on every run (slow, potential breaking changes).
- **Redundancy**: The project already has `sanity` (^4.22.0) in `dependencies`.
- **Failure Mode**: `npx` might be failing due to network, registry, or interactivity prompts.

### 3.2. Error Visibility

The `spawnSafe` function captures `stdio: inherit` but if the child process fails silently or with specific exit codes, the error propagation might be vague.

### 3.3. Auth Token

The workflow relies on `SANITY_AUTH_TOKEN`. If this token has expired or has insufficient permissions, the export will fail. Checks confirm `SANITY_AUTH_TOKEN` is passed to the script.

## 4. Reproduction Plan

Since I cannot run the Github Action directly, I will simulate the execution logic by:

1. Verifying if `node_modules/.bin/sanity` exists and works.
2. Attempting a dry-run of the export command using the local dependency.

## 5. Action Plan

1.  **Refactor Script**: Modify `scripts/backup-sanity.ts` to use the local `sanity` binary (`pnpm exec sanity` or direct path) instead of `npx`.
2.  **Enhance Logging**: Add detailed error logging for the export process.
3.  **Validate**: Run the script (or parts of it) to ensure it can invoke the CLI.

## 6. Verification Method

- **Local**: Successful execution of `scripts/backup-sanity.ts` (mocking Drive upload if needed).
- **CI**: Triggering the workflow manually and verifying success.

## 7. Compliance

This report fulfills the requirements for Gate 1 of the Ralph Protocol.
