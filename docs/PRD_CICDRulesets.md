# PRD: CI/CD Rulesets (#17)

## 1. Objective

Establish a "Locked Vault" deployment model. Ensure that no code can reach the `main` branch without passing automated quality gates, security scans, and peer review.

## 2. User Stories

### 2.1 Developer Safety

**As a developer**, I want the repository to block me from accidentally pushing directly to `main`, so that I don't bypass CI/CD checks or break production.

### 2.2 Quality Assurance

**As a project owner**, I want to mandate that all Playwright E2E tests and security audits pass before a merge is allowed, to ensure 100% system integrity.

## 3. Acceptance Criteria (AC)

- [ ] **AC 1: Branch Protection** - Direct pushes to `main` must be disabled.
- [ ] **AC 2: Pull Request Mandate** - All changes must via Pull Request.
- [ ] **AC 3: Required Status Checks** - The following jobs MUST pass:
  - `build-verification`
  - `e2e-tests` (Playwright)
  - `security-scan` (Trufflehog/Audit)
- [ ] **AC 4: Linear History** - Require squash merges or rebase merges to keep history clean.
- [ ] **AC 5: Staging-to-Main Workflow** - Explicitly protect the path from `staging` to `main`.

## 4. Technical Strategy

1. Define a GitHub **Repository Ruleset** (the modern replacement for Branch Protection Rules).
2. Configure "Restrict Pushes" to `main`.
3. Configure "Require Status Checks" and list the specific GitHub Actions jobs.
4. Document the JSON configuration for easy import/reference.

## 5. Security Considerations

- Prevents "Ghost Merges" (merging without CI passing).
- Enforces the "Iron Dome" architecture by making it a repository-level law.
