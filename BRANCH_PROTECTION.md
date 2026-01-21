# Branch Protection Rules (The "Bank Vault")

**Target Branch**: `main`
**Enforcement Level**: **Advisory** (Free Plan) / **Critical** (Pro Plan)

> [!WARNING]
> **GitHub Free Plan Limitation**: Private repositories on the Free plan **cannot enforce** these rules (Required Status Checks, Reviewers).
>
> **Defense Strategy (Free Plan Pivot)**:
>
> 1.  **Local**: `husky` stops bad commits before they leave your machine.
> 2.  **CI (Advisory)**: GitHub Actions (`build`, `test`) will still run and show Red/Green signals. **Discipline is required to not merge on Red.**
> 3.  **Production**: Vercel will strictly reject any deployment if the Build fails. (The "Final Firewall").

To "Lock the Bank Vault" (if you ever upgrade), apply these exact settings:

## 1. Branch Name Pattern

- **Branch name pattern**: `main`

## 2. Protect Matching Branches

- **Require a pull request before merging**: `Checked`
  - **Require approvals**: `Checked` (Min: 1)
  - **Dismiss stale pull request approvals when new commits are pushed**: `Checked`
- **Require status checks to pass before merging**: `Checked`
  - **Require branches to be up to date before merging**: `Checked`
  - **Status checks that are required**:
    1.  `build` (from `build-check.yml`) -> Verifies Type Safety & Project Structure.
    2.  `test` (from `e2e.yml`) -> Verifies Critical User Journeys (Playwright).
    3.  `schema-validation` (from `sanity-schema-check.yml`) -> Verifies Sanity Schema integrity.
- **Require conversation resolution before merging**: `Checked`

## 3. Restrict Pushes

- **Restrict who can push to matching branches**: `Checked`
  - **Actor**: (Leave Empty) -> This effectively disables direct pushes for _everyone_ (including Admins), forcing all changes through PRs.

## 4. Admin Enforcement

- **Do not allow bypassing the above settings**: `Checked`
  - _Note: This applies to Repository Admins too. "Break Glass" requires temporarily disabling this rule._

---

## Technical Context (Why?)

- **`build`**: Prevents broken builds (syntax/types) from merging.
- **`test`**: Prevents functional regressions in critical paths.
- **`schema-validation`**: Prevents schema mismatches that crash the Studio.
- **Up-to-date Requirement**: Ensures the code you tested is the code that lands (prevents "Semantic Conflicts").
