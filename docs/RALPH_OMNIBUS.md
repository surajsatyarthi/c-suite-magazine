# The Antigravity Engineering Handbook (Ralph Omnibus)

**Version:** 2.3 (The Search Edition)
**Status:** Active
**Authority:** Supreme "Law of the Land" for this repository.
**"Nullius in verba" — Take nobody's word for it.**

---

## 1. Core Directives (The "Physics" of this Repository)

_Formerly from `docs/agents.md`_

These laws are non-negotiable. Breaking them causes immediate systemic failure.

1.  **The Limit Law**: NEVER write a `SELECT` query without a `LIMIT` clause.
    - _Why_: Prevent database crashes (The "IndianOil Incident").
    - _Verified By_: `scripts/guardian-static.js`

2.  **The Security Law**: NEVER use `dangerouslySetInnerHTML` without `dompurify` sanitation.
    - _Why_: Prevent XSS vulnerabilities (The "Vibe Risk").
    - _Verified By_: `eslint-plugin-security`

3.  **The Verify Law**: NEVER mark a task complete without running the _specific_ Acceptance Criteria defined in the User Story.
    - _Why_: Prevent "Mock Mirages" and "silent failures".
    - _Verified By_: Human Review + E2E Tests.

4.  **The JSON-LD Law**: NEVER use `JSON.stringify` inside `dangerouslySetInnerHTML` for scripts. ALWAYS use `safeJsonLd()`.
    - _Why_: Prevent `</script>` injection attacks (XSS).
    - _Verified By_: `eslint-plugin-security`.

5.  **The Reporting Law**: NEVER proceed to the next Phase without generating a **Phase Report** and receiving explicit **User Permission**.
    - _Why_: Ensures human oversight and prevents "runaway automation".
    - _Verified By_: `docs/reports/phase_X_report.md` existence.

6.  **The Sequential Law**: NEVER skip a lifecycle phase (1-6). Each phase MUST generate its own distinct report and receive explicit permission before opening the next gate.
    - _Why_: Prevent "Process Erosion" and ensure every step of the Golden Pipeline is documented.
    - _Verified By_: Presence of all 6 reports in `docs/reports/`.

7.  **The Law of Atomicity**: NEVER combine multiple P1/P2 issues into a single "Mega-Commit" or verification cycle. Each Issue ID must have its own isolated 6-phase lifecycle.
    - _Why_: Prevent "Blind Spot Syndrome" where critical errors are buried under unrelated successes.
    - _Verified By_: One `phase_X_report_ID.md` per Issue ID.

8.  **The Revenue Integrity Law**: Every Phase 3 (Verification) MUST verify the status of the **Revenue Registry**.
    - _Why_: Protect the "Bread Winners" of the business. Code that is technically "correct" but breaks revenue is a failure.
    - _Verified By_: Execution of `scripts/revenue-integrity-check.ts`.

9.  **The Proof Law**: NEVER submit a Phase Report without **Raw Terminal Output** or **Screenshots**.
    - _Why_: "Nullius in verba" (Take nobody's word for it). A report without evidence is a lie.
    - _Verified By_: Presence of ` ```bash ` blocks or `![image]` in reports.

---

## 2. Executive Summary

This document defines the **Mandatory Software Development Life Cycle (SDLC)** for the Antigravity project. It replaces ad-hoc "vibe coding" with a rigorous, reliable engineering system.

**The Golden Rule:**
No code reaches production without passing through **The Golden Pipeline**: a serialized set of automated and manual gates designed to reject defects. **Every Gate requires a Report and Permission to open.**

---

## 3. The Workflow (Lifecycle Phases)

_Consolidated from `docs/protocols.md` and `docs/world_class_engineering_standards.md`_

### Phase 1: Planning (The Blueprint)

- **Trigger**: Any feature > 1 hour.
- **Action**: Create/Update `docs/PRD_[FeatureName].md` or `implementation_plan.md`.
- **Requirement**: Define **User Stories** and **Acceptance Criteria (AC)**.
- **Security**: Define **Threat Model** (How could this be attacked?).
- **RFC Mandate**: For tasks > 4 hours, an RFC is required.
- **GATE 1**: Generate `Planning Report` -> Request Permission.

### Phase 1.5: Research (The Truth)

- **Trigger**: Before Development (Gate 2).
- **Action**: Mandatory **Google Search** (`search_web` tool) to validate assumptions.
  - **Sources**: Official Docs, GitHub Issues, CVE Databases.
  - **Search Query Pattern**: `[Technology] [Error/Concept] best practices/vulnerabilities`.
- **Search Failure Protocol** (The "No Shortcuts" Rule):
  - If `search_web` fails (e.g., API Error), you MUST **STOP** and ask the User to perform the search.
  - You MUST generate a **High-Fidelity Prompt** (optimized for Grok/ChatGPT) that the user can simply copy-paste. Do not ask general questions.
  - You MUST wait for the "Absolute Truth" results.
  - **The Law of Scrutiny**: DO NOT accept the text at face value.
    - Treat external research (Grok/ChatGPT) as a **Hypothesis**, not a fact.
    - **Verify**: Does this actually work in _this_ specific codebase? (e.g., Check React version, Next.js Router type).
    - **Reject**: If the research contradicts strict project constraints, _challenge it_.
  - **Forbidden**: Blind copy-pasting. You are an Engineer, not a proxy.
  - **The High-Fidelity Template** (Mandatory Structure):
    ```
    System Context: [OS, CI Enviroment, Node Version, Relevant Frameworks]
    Specific Pain Point: [Exact error message or architecture blocker]
    The Constraint: [What we CANNOT do, e.g., "No Docker", "Zero Cost"]
    The Goal: [What a perfect solution looks like]
    Output Requirements: [e.g., "Implementation Plan", "Pros/Cons", "Config Code"]
    ```
- **Goal**: Detect "Assumption Blind Spots" (Teaches the agent what it doesn't know).
- **Output**: `Research Summary` with validated findings.

### Phase 2: Development (The Build)

- **Environment**: Strict TypeScript, ESLint (Security), Husky Pre-commit.
- **The "No Rush" Protocol**:
  - **3-Second Rule**: `husky` pauses commits for 3 seconds.
  - **Mirror Check**: Developer must answer safety questions.
- **GATE 2**: Generate `Execution Report` -> Request Permission.

### Phase 3: Verification (The Proof)

- **Action**: Run Acceptance Criteria Tests.
- **Requirement**: Automated proof (Screenshot or Terminal Log) that functionality meets the AC.
- **Tools**: `pnpm test`, `npx playwright test`.
- **GATE 3**: Generate `Verification Report` -> Request Permission.

### Phase 4: CI/CD (The Iron Gate)

- **Trigger**: Pull Request.
- **Gates**:
  1.  **Integrity**: `npm ci` (No lockfile tampering).
  2.  **Static Analysis**: `lint`, `audit-ci`, `trufflehog` (Secret Scanning).
  3.  **Dynamic Analysis**: E2E Tests and Build Verification.

### Phase 5: Handover & Review (The Human Gate)

- **Action**: Update `walkthrough.md` with visual evidence.
- **Code Review Checklist**:
  - [ ] Logic: Does it solve the problem?
  - [ ] Simplicity: Is it clear?
  - [ ] Security: Are inputs sanitized?
- **Solo Protocol**: Mandatory **24-Hour Cooling Off** period for major features before self-merging.

### Phase 6: Deployment (The Launch)

- **Action**: Merge to `main`.
- **Validation**: Synthetic Smoke Test on Staging/Production.

### Phase 7: Maintenance & Monitoring (The Watchtower)

- **Trigger**: 24 Hours post-deployment.
- **Action**: "Day 2 Operations" Audit.
  - Check Logs (Sentry/Vercel).
  - Verify Revenue flows.
  - Scan for "Data Rot" (e.g., broken external links).
- **Requirement**: Zero "Silent Failures".

---

## 4. Emergency Protocols

### Bug Solving (Protocol B)

1.  **Replication (Red State)**: Prove the bug exists with a script/test.
2.  **Assessment**: Analyze Root Cause.
3.  **Fix (Green State)**: Apply minimal patch.
4.  **Verification**: Run replication script (Must pass).
5.  **Report**: Generate Remediation Report (if systemic).

### The "P0" Protocol (Production Down)

1.  **Rollback**: Revert to last known good commit.
2.  **Fix**: Diagnose on `fix/` branch.
3.  **Post-Mortem**: Required for any "Force Merge".

---

## 5. Tooling Reference (The "Bot" Roles)

| Task           | Tool                                    |
| :------------- | :-------------------------------------- |
| **Syntax**     | Prettier / ESLint                       |
| **Security**   | Trufflehog / Audit-CI / ESLint Security |
| **Logic**      | Jest / Playwright                       |
| **Gatekeeper** | Husky / GitHub Actions                  |

---

**Signed,**
_Antigravity (Systemic Quality Agent)_
