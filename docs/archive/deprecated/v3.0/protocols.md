# Ralph Development Protocols

**Status**: Active
**Mandate**: All AI Agents and Developers must follow these workflows.

---

## 🏗️ Protocol A: New Feature Development

_Use this when adding new capabilities, pages, or major components._

### 1. Phase 1: The Blueprint (Planning)

- **Action**: Create/Update `docs/PRD_[FeatureName].md`.
- **Requirement**: Define **User Stories** and **Acceptance Criteria (AC)**.
  - _Example AC_: "User can click 'Login', see a modal, and receive a JWT token."
- **Output**: A clear definition of "Done".

### 2. Phase 2: The Plan (Architecture)

- **Action**: Update `implementation_plan.md`.
- **Requirement**: List specific files to create/modify and the technical strategy.
- **Review**: Request User Approval before writing a single line of code.

### 3. Phase 3: The Build (Execution)

- **Action**: Write the code.
- **Rule**: Follow the "Iron Dome" rules (No `any`, No Unsanitized Inputs).
- **Status**: Keep `task.md` updated in real-time.

### 4. Phase 4: The Proof (Verification)

- **Action**: Run the **Acceptance Criteria Tests**.
- **Requirement**: Automated proof (Screenshot or Terminal Log) that the feature works.

### 5. Phase 5: The Handover (Walkthrough)

- **Action**: Update `walkthrough.md` with visual evidence.
- **Output**: A summary of what was built and how to use it.

### 6. Phase 6: The Launch (Deployment)

- **Action**: Deploy to Production (e.g., Vercel).
- **Requirement**: Zero build errors, passing E2E tests, live verification.
- **Output**: Live URL.

---

## 🐛 Protocol B: Bug Solving

_Use this when fixing issues, crashes, or security vulnerabilities._

### 1. Phase 1: The Replication (Red State)

- **Action**: Create a reproduction script or find the failing log.
- **Goal**: Prove the bug exists. "If you can't reproduce it, you can't fix it."

### 2. Phase 2: The Assessment (Analysis)

- **Action**: Analyze the Root Cause.
- **Output**: A brief explanation of _why_ it broke (e.g., "Missing Input Sanitation").

### 3. Phase 3: The Fix (Green State)

- **Action**: Apply the patch.
- **Rule**: Minimal invasive changes. Don't refactor unrelated code.

### 4. Phase 4: The Verification (Iron Dome)

- **Action**: Run the replication script again.
- **Requirement**: It must pass (Exit Code 0).
- **Safety Check**: Run `eslint` or existing tests to ensure no regressions.

### 5. Phase 5: The Report (Remediation)

- **Action**: Generate a **Remediation Report** (e.g., `docs/ralph_completion_report_XXX.md`).
- **Standard**: Must include Vulnerability Title, Risk Level, Verification Proof, and Prevention Strategy.
- **Memory**: Update `docs/agents.md` with a new "Law" if a systemic flaw caused the bug.

### 6. Phase 6: The Patch (Deployment)

- **Action**: Push the fix to Production.
- **Requirement**: Verify the fix on the live environment (Smoke Check).
- **Status**: Close the issue in `task.md`.
