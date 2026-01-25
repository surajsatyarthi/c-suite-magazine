# Internal Secrets Map & Checklist

> [!NOTE]
> This file is for tracking the **existence** and **location** of credentials. **NEVER** store actual secret values in this file.

## 🔑 Sanity CMS (Project: 2f93fcy8)

| Secret Name          | Scope  | Location     | Status          |
| :------------------- | :----- | :----------- | :-------------- |
| `SANITY_PROJECT_ID`  | Config | `.env.local` | ✅ Validated    |
| `SANITY_DATASET`     | Config | `.env.local` | ✅ Validated    |
| `SANITY_API_TOKEN`   | Viewer | --           | ❌ Purged (403) |
| `SANITY_WRITE_TOKEN` | Editor | --           | ✅ Validated    |

## 📧 Email / Notifications

| Secret Name  | Scope    | Location     | Status       |
| :----------- | :------- | :----------- | :----------- |
| `EMAIL_USER` | Gmail    | `.env.local` | ✅ Validated |
| `EMAIL_PASS` | App Pass | `.env.local` | ✅ Validated |

## 🛡️ Cleanup Guards

- All mass-deletion commands MUST include `--exclude ".env*"` or equivalent logic.
- Diagnostic scripts containing tokens must be hard-deleted immediately after use.
