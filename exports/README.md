Sanity Dataset Backups
======================

Overview
--------
- This folder holds local dataset exports created by the Sanity CLI.
- Backups are timestamped and stored under `exports/backups/` (ignored by git).
- A scheduled GitHub Action also runs weekly and uploads a backup as an artifact.

Manual Backup (Local)
---------------------
- Ensure you're authenticated with the Sanity CLI (`sanity login`) or set a token.
- Run: `pnpm run sanity:backup`
  - Output file: `exports/backups/YYYY-MM-DD-HHMM-production.tar.gz`

Restore (Local)
---------------
- Set env `BACKUP_FILE` to the path of your backup tarball.
- Run: `BACKUP_FILE=exports/backups/<file>.tar.gz pnpm run sanity:restore`
- Flags used:
  - `--replace` — overwrite existing documents.
  - `--missing` — skip importing documents that already exist.

GitHub Action (Scheduled)
-------------------------
- Workflow: `.github/workflows/sanity-backup.yml`
- Schedule: weekly (Mondays at 03:00 UTC) and manual dispatch.
- Requirements:
  - Add `SANITY_AUTH_TOKEN` as a repository secret in GitHub.
    - Create a token at `sanity.io/manage` (project → API tokens) with read access.
    - Recommended: `Editor` or `Deploy` token scope sufficient for export.

Cloud Storage Upload (S3)
-------------------------
- The workflow can automatically upload backups to Amazon S3.
- Add these GitHub repo secrets:
  - `AWS_ACCESS_KEY_ID` — IAM access key.
  - `AWS_SECRET_ACCESS_KEY` — IAM secret.
  - `AWS_REGION` — e.g., `us-east-1`.
  - `AWS_S3_BUCKET` — bucket name (no `s3://` prefix), e.g., `my-backups-bucket`.
- Backups are uploaded to `s3://<bucket>/sanity-backups/<timestamp>-production.tar.gz` with server-side encryption (`SSE-S3`).
- Tip: Use a dedicated IAM user limited to `s3:PutObject` on the backup path.

Notifications (Slack)
---------------------
- Optional: receive a Slack message when a backup is uploaded.
- Add `SLACK_WEBHOOK_URL` as a GitHub secret (Incoming Webhook URL).
- The workflow posts a brief message with the S3 path of the uploaded backup.

Notes
-----
- The hosted Studio and dataset remain on Sanity’s infrastructure; this backup is for disaster recovery.
- Consider mirroring large assets to cloud storage if you need a full offline copy.
- Keep at least 30 days of rolling backups; adjust retention in the workflow as needed.
