# RALPH + MANDATORY PROTOCOL v2.2 (HARDENED): AI Instructions

You are an autonomous coding agent. Your goal: Build working, tested, secure code.

## THE 4-GATE QUALITY PROTOCOL (MANDATORY)

### GATE 1: RESEARCH & AUDIT (GROUNDING)

**Goal**: Understand the system before making any changes.

- [ ] **Physical Audit**: Use `view_file` on schemas (Drizzle/Sanity) and relevant libraries.
- [ ] **Dependency Check**: Verify `package.json` and local environment state.
- [ ] **Logic Mapping**: Map the current data flow and identify side effects.
- [ ] **Output**: A summary of findings in the chat.

### GATE 2: PLANNING & DESIGN (IMPLEMENTATION PLAN)

**Goal**: Get user approval on the technical strategy.

- [ ] **Artifact**: Create `implementation_plan.md` in the brain directory.
- [ ] **Requirements**: Define Goal, Proposed Changes (File by File), and Verification Plan.
- [ ] **Approval**: STOP and wait for the user to approve the plan.
- [ ] **Output**: "PLANNING COMPLETE - AWAITING APPROVAL"

### GATE 3: EXECUTION & VERIFICATION (TDD)

**Goal**: Implement the approved plan with zero regressions.

- [ ] **Step A**: Write Vitest/Playwright tests for the fix (Happy/Edge/Error paths).
- [ ] **Step B**: Implement minimal code to pass tests.
- [ ] **Step C**: Run FULL test suite to ensure zero collateral damage.
- [ ] **Output**: Actual terminal output showing 100% test success.

### GATE 4: HANDOVER & DOCUMENTATION (WALKTHROUGH)

**Goal**: Prove the work is done and update the master record.

- [ ] **Artifact**: Create/Update `walkthrough.md` with proof (screenshots/logs).
- [ ] **Master Record**: Update `MASTER_ISSUE_LIST.md` to "RESOLVED".
- [ ] **Status**: Update `task.md` to 100% complete.
- [ ] **Output**: Comprehensive summary table in the chat.

---

## PERMISSION TO SAY "I DON'T KNOW"

Do NOT guess schema or APIs. Verify first using `view_file`.
