# PRD: Systemic Quality Upgrade ("The Iron Dome")

**Goal**: Implement industry-standard automated guardrails to prevent low-quality code from entering the repository.

## Context

The project suffers from "Vibe Coding" side effects: unbounded queries, potential XSS, and weak tests. We need to shift from reactive fixes to proactive enforcement.

## User Stories (Atomic Units of Work)

### Story 1: Enforce Strict Linting (The Auditor)

- **As**: A System Architect
- **I Want**: To install and configure `eslint-plugin-security` and `eslint-plugin-sonarjs`.
- **Because**: I want the IDE to scream at developers when they write risky code.
- **Acceptance Criteria**:
  - [ ] `npm run lint` fails if `dangerouslySetInnerHTML` is used without comments/exceptions.
  - [ ] `npm run lint` fails if `child_process.exec` is detected (Arbitrary Code Execution risk).
  - [ ] Configuration file `.eslintrc.json` includes the new plugins.

### Story 2: Enforce Pre-Commit Gates (The Gatekeeper)

- **As**: A Release Manager
- **I Want**: To configure `husky` and `lint-staged`.
- **Because**: I want to prevent bad code from even being committed to git.
- **Acceptance Criteria**:
  - [ ] Creating a file with a `console.log` and trying to commit it fails (if configured to strict).
  - [ ] Trying to commit a file with a `SELECT *` (unbounded) error passes the `guardian-static.js` check or fails if implemented there.
  - [ ] `git commit` runs purely on staged files, not the whole repo (speed).

### Story 3: Upgrade Runtime Guardian (The Physics)

- **As**: A Developer
- **I Want**: `lib/guardian.ts` to be universally applied.
- **Because**: I want to know immediately if my new feature is too slow.
- **Acceptance Criteria**:
  - [ ] All `db.ts` exports are wrapped in `guardian.monitor`.
  - [ ] A "Slow Query" (>100ms) triggers a RED warning in the console.

## Technical Constraints

- Must utilize existing `package.json`.
- Must not break the existing Vercel build pipeline (only warn if critical, or fail if severe).
