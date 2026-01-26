# Ralph Protocol: Phase 4 Research (Issue #48)

**Task**: Fix Sanity Backup Failure
**Phase**: Gate 4 (Research & Search)

## 1. Research Question

"What are the best practices for automating Sanity.io dataset backups to Google Drive using GitHub Actions?"

## 2. Search Strategy

**Query**: `sanity backup to google drive github action script best practices`
**Date**: 2026-01-27
**Source**: Google Search

## 3. Findings

1.  **Service Account**: Using a Google Service Account (GSA) with a specific JSON key is the standard, secure way to authenticate with Google Drive non-interactively.
2.  **Shared Folder**: The GSA must be given "Editor" access to the destination Google Drive folder via its client email.
3.  **Sanity Export**: The standard command `sanity dataset export` is reliable.
4.  **Secrets Management**: Credentials should be stored in GitHub Secrets (`SANITY_AUTH_TOKEN`, `GDRIVE_CREDENTIALS`, etc.).

## 4. Validation of Current Approach

Our current script (`scripts/backup-sanity.ts`) follows these patterns:

- Uses `googleapis` with GSA credentials (conceptually correct).
- Uses `sanity dataset export` via `npx` (which is the point of failure we are fixing).

## 5. Conclusion

The proposed plan to use the _local_ Sanity binary decreases fragility (removing the `npx` network dependency) while maintaining the correct authentication flow validated by research.

**Gate 4 Status**: PASSED.
