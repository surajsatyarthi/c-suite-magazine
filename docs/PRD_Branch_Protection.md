# PRD: Branch Protection Rules (Issue #17)

**Status**: Draft
**Owner**: Antigravity
**Epics**: Security, CI/CD, Quality Assurance

## 1. Introduction

To prevent "False Ready" signals and unauthorized code from entering `main`, we must enforce strict branch protection using GitHub Status Checks. This ensures that the "Iron Dome" (GitHub Actions) must explicitly pass before any merge is allowed.

## 2. User Stories

- **US 1**: As a Release Manager, I want to prevent any direct pushes to the `main` branch so that all changes go through a Pull Request.
- **US 2**: As a Developer, I want to see exactly which CI checks failed on my PR so I can fix them before merging.
- **US 3**: As a Stakeholder, I want to be mathematically certain that no code enters `main` unless it has passed E2E tests, Build Verification, and Sanity Schema checks.

## 3. Acceptance Criteria (AC)

- [ ] **AC 1 (Lockdown)**: Direct push to `main` by any user (including Admin) is rejected.
- [ ] **AC 2 (The Gate)**: A PR cannot be merged if `e2e`, `build`, or `sanity-schema-check` workflows fail or are pending.
- [ ] **AC 3 (Freshness)**: A PR cannot be merged if it is behind `main` (Require branches to be up to date).
- [ ] **AC 4 (No Skip)**: "Bypass Branch Protection" is disabled for all users.

## 4. Technical Constants

- **Target Branch**: `main`
- **Required Contexts**:
  - `E2E` (or equivalent job name)
  - `Build Verification`
  - `Sanity Schema Integrity Check`

## 5. Security Risks

- **Admin Bypass**: If Admins are not included in the restrictions, they can accidentally force push. _Mitigation_: Enable "Do not allow bypassing the above settings" for everyone including admins.
