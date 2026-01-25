# PRD: Issue #45 - The Integrity Layer (Ralph Protocol v2.7)

## 1. Context

"Vibe Coding" and checkbox compliance have led to broken URL logic and superficial fixes. This PRD mandates structural mechanisms to ensure every claim is verified by the machine, not just assumed by the agent.

## 2. Requirements

### 2.1. Assumption Scanner

- **Target**: Staged files in Git.
- **Detections**:
  - `any` without bypass.
  - `|| true` in shell scripts.
  - Manually constructed URLs matching `/category/` (must use `lib/urls.ts`).
- **Path**: `scripts/assumption-scanner.ts`.

### 2.2. Structural Evidence

- Every "Proof" provided in Phase 2/3 must be wrapped in a block that starts with:
  ```bash
  date
  git rev-parse --short HEAD
  ```

### 2.3. Digital Twin verification

- Playwright tests must explicitly assert the accessibility of the 3 highest revenue articles.

## 3. Implementation Guards

- Commits are BLOCKED if the scanner fails.
