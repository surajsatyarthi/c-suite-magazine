# Ralph Protocol: Phase 1 Assessment (Issue #34)

**Task**: Upgrade Protocol to v2.1 (The "Proof" Edition)
**Issue ID**: #34
**Priority**: P0 (Governance)

## 1. Problem Statement

The current Ralph Protocol (v2.0) has strict gates but loose evidence requirements.

- **Gap 1**: Reports often summarize results ("Passed") without showing the _raw data_ (Terminal Logs).
- **Gap 2**: There is no formal phase for "Day 2 Operations" (Maintenance/Monitoring), leading to "Launch and Forget" behavior (e.g., `spotlight.json` rot).
- **Gap 3**: Threat Modeling is implicit, not explicit.

## 2. Proposed Solution (Ralph v2.1)

We will amend `docs/RALPH_OMNIBUS.md` with:

### A. New "Core Directive" (#9)

**The Proof Law**:

> "Nullius in verba" — Take nobody's word for it.
> ALL Phase Reports must contain **Raw Terminal Output** or **Screenshots**.
> A report that says "Tests Passed" without the log dump is INVALID.

### B. New Lifecycle Phase (#7)

**Phase 7: Maintenance & Monitoring**

- **Trigger**: 24 Hours post-deployment.
- **Action**: Verify logs, check performance metrics, ensuring no "silent rot".

### C. Enhanced Phase 1

- Add **Threat Modeling** as a mandatory section in the Assessment Report.

## 3. Execution Plan

1.  Update `docs/RALPH_OMNIBUS.md`.
2.  Update `MASTER_ISSUE_LIST.md` (Add #34).
3.  Commit changes.

## 4. Permission Request

I request permission to proceed to **Phase 2 (Execution)** to rewrite the Constitution.
