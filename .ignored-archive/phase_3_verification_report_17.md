# Ralph Protocol: Phase 3 Verification (Issue #17)

**Task**: CI/CD Rulesets (Issue #17)
**Phase**: Gate 3 (Verification)

## 1. Technical Audit

### Workflow Synchronization

I have verified that the Status Check names in our configuration exactly match the job names defined in the repository's GitHub Actions files.

| Rule Context            | Workflow File             | Job Name            | Status   |
| :---------------------- | :------------------------ | :------------------ | :------- |
| `🛡️ TruffleHog Secrets` | `security.yml`            | `secrets`           | ✅ MATCH |
| `📦 Supply Chain Audit` | `security.yml`            | `supply-chain`      | ✅ MATCH |
| `🔍 Security Analysis`  | `security.yml`            | `static-analysis`   | ✅ MATCH |
| `🧪 E2E Verification`   | `playwright.yml`          | `e2e-verification`  | ✅ MATCH |
| `🏗️ Schema Integrity`   | `sanity-schema-check.yml` | `schema-validation` | ✅ MATCH |

### Configuration Validation

The proposed Ruleset JSON in `docs/github_ruleset_main.json` has been linted and follows the GitHub API schema for repository rulesets.

## 2. Implementation Guide (The "Human Gate")

Since the repository is private, you must have **GitHub Pro** or **Team** to enable these specific automation rules. If you cannot see "Rulesets" in your settings, you can use the instructions below for standard **Branch Protection Rules**.

### Option A: Modern Repository Rulesets (Recommended)

1. Go to **Settings** -> **Rules** -> **Rulesets**.
2. Click **New Ruleset** -> **Import from JSON**.
3. Select `docs/github_ruleset_main.json`.
4. Ensure "Enforcement" is set to **Active**.

### Option B: Standard Branch Protection (Fallback)

1. Go to **Settings** -> **Branches** -> **Add branch protection rule**.
2. Branch name pattern: `main`.
3. Check: **Require a pull request before merging**.
4. Check: **Require status checks to pass before merging**.
5. Search and add the jobs listed in the table above.
6. Check: **Require branches to be up to date before merging**.

## 3. Final Recommendation

The repository is now "Ready for Enforcement." Once these settings are applied in the GitHub UI, the "Iron Dome" will be fully operational, and no developer (including AI agents) will be able to break `main`.

**I recommend marking Issue #17 as RESOLVED.**
