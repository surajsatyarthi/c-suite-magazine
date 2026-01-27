# SUPREME RALPH CONSTITUTION (v3.2)

**Effective Date**: January 27, 2026
**Authority**: Mandatory for all Agents & Engineers
**Enforcement**: Zero Tolerance. Violation = "Making a fool of the user".

## THE PROVENANCE LAW (v3.2 Addition)

**"Pic or it didn't happen."**
Every major claim (file created, text modified, bug fixed) must be backed by a **terminal output** (e.g., `grep`, `ls -l`, `cat`, `curl`) that visually confirms the claim in the same turn or report. You cannot just _say_ it is done. You must _show_ the terminal proof.
All previous documents (LEGACY-OMNIBUS, MANDATORY-PROCEDURES, LEGACY-PROTOCOL, procedures-doc, engineering-standards-doc, etc.) are **officially deprecated** and **must be deleted** after archiving.

---

## THE 10 GATES OF RALPH

Every task must pass through these 10 distinct phases (Gates). You cannot skip a gate. You cannot proceed to the next gate without explicit permission or satisfying the exit criteria.

### 🔴 Phase 1: ASSESSMENT & PLANNING (Gate 1)

- **Goal**: Understand the problem, verify existence, and plan the solution.
- **Output**: Phase 1 Assessment Report.
- **Action**: Read files, check current state, create `implementation_plan.md`.

### 🟡 Phase 2: EXECUTION (Gate 2)

- **Goal**: Write the code. Implement the fix.
- **Output**: Code changes. Phase 2 Execution Report.
- **Action**: Modify files, create new components.

### 🟢 Phase 3: VERIFICATION (Gate 3)

- **Goal**: Verify the fix works locally or in a test environment.
- **Output**: Verification Proof (Logs, Screenshots). Phase 3 Verification Report.
- **Action**: Run tests, curl endpoints, visual check.

### 🔵 Phase 4: RESEARCH & SEARCH (Gate 4)

- **Goal**: External validation and knowledge gathering.
- **Constraint**: **MANDATORY ONLINE SEARCH**. You must use the `search_web` tool to validate assumptions, find latest documentation, or check for similar issues globally.
- **User Directive**: "Have you already passed that gate (Search)?"
- **Output**: Research findings incorporated into reports.

### 🟣 Phase 5: CI/CD & HANDOVER (Gate 5)

- **Goal**: Prepare for deployment. Ensure pipeline passes.
- **Output**: Phase 5 Handover Report.
- **Action**: Check GitHub Actions, Linting, Build.

### 🚀 Phase 6: DEPLOYMENT (Gate 6)

- **Goal**: Push to production.
- **Output**: Phase 6 Deployment Report.
- **Action**: Merge to main, trigger Vercel deploy.

### 🛡️ Phase 7: SECURITY AUDIT (Gate 7)

- **Goal**: Security check. Secrets scanning.
- **Output**: Clean `trufflehog` / `audit-ci`.
- **Action**: Verify no exposed secrets or vulnerabilities.

### 🔎 Phase 8: PERFORMANCE AUDIT (Gate 8)

- **Goal**: Speed and efficiency check.
- **Output**: Lighthouse score, Bundle size check.
- **Action**: Optimize images, code splitting.

### 👁️ Phase 9: POST-DEPLOYMENT VERIFICATION (Gate 9)

- **Goal**: Verify production URL works.
- **Output**: Live site confirmation.
- **Action**: Visit `csuitemagazine.global`.

### 🏰 Phase 10: WATCHTOWER (Gate 10)

- **Goal**: Long-term stability.
- **Output**: 24-hour stability confirmation.
- **Action**: Monitor logs, ensure no regression after 24 hours.

---

## PROTOCOL RULES

1. **No Skipping**: You typically cannot move to Gate N+1 until Gate N is done.
2. **Evidence**: Every gate requires proof (a report or log).
3. **Honesty**: Do not claim to have done a gate (like Search) if you haven't.

Signed,
_The Supreme Ralph Architecture_
