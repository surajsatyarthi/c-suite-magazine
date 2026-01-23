# The Antigravity Engineering Handbook (Ralph Omnibus)

**Version:** 2.5 (Ironclad Edition)
**Status:** Active
**Authority:** Supreme "Law of the Land" for this repository.
**"Nullius in verba" — Take nobody's word for it.**

---

## 1. Core Directives (The "Physics" of this Repository)

These laws are non-negotiable. Breaking them causes immediate systemic failure.

1.  **The Limit Law**: NEVER write a `SELECT` query without a `LIMIT` clause.
    - _Why_: Prevent database crashes (The "IndianOil Incident").
2.  **The Security Law**: NEVER use `dangerouslySetInnerHTML` without `dompurify` sanitation.
    - _Why_: Prevent XSS vulnerabilities.
3.  **The Verify Law**: NEVER mark a task complete without running the _specific_ Acceptance Criteria (AC).
    - _Why_: Prevent "Mock Mirages".
4.  **The JSON-LD Law**: ALWAYS use `safeJsonLd()` for scripts.
    - _Why_: Prevent `</script>` injection attacks.
5.  **The Reporting Law**: NEVER proceed without a **Phase Report** and **User Permission**.
    - _Why_: Ensures human oversight.
6.  **The Sequential Law**: NEVER skip a lifecycle phase (1-6).
    - _Why_: Prevent process erosion.
7.  **The Law of Atomicity**: One Issue ID = One isolated lifecycle. No "Mega-Commits".
    - _Why_: Prevent buried errors.
8.  **The Revenue Integrity Law**: Every Phase 3 MUST verify the **Revenue Registry**.
    - _Why_: Protect the "Bread Winners".
9.  **The Proof Law**: Reports MUST include **Raw Terminal Output** and **Screenshots**.
    - _Why_: Evidence is the only truth.
10. **The Air-Gap Law [NEW]**: NEVER perform write operations from the client.
    - _Why_: Prevent token leakage and unauthorized mutations.
    - _Verified By_: `lib/sanity.admin.ts` (server-only) partition.
11. **The Context Law [NEW]**: Logs MUST anchor to the current Git HEAD hash.
    - _Why_: Prove the work was actually performed on the current code.
12. **The Semantic Law [NEW]**: Commits MUST include a `SECURITY-CHECKLIST [#ID]:` block.
    - _Why_: Enforce deliberative security reflection.

---

## 2. Executive Summary

No code reaches production without passing through **The Golden Pipeline**: a serialized set of automated and manual gates. **Every Gate requires a Report and Permission to open.**

---

## 3. The Workflow (Lifecycle Phases)

### Phase 1: Planning (The Blueprint)

- **1.1 Understanding**: Deconstruct task to atomic elements.
- **1.2 Verification**: "Measure twice, cut once". Test APIs/Data currency.
- **1.3 Blueprinting**: Create `implementation_plan.md`. Define User Stories and AC.
- **1.4 Threat Model**: Explicitly document "How could this be attacked?" (Tiered attack vectors).
- **GATE 1**: Generate `Planning Report` -> Request Permission.

### Phase 1.5: Research (The Truth)

- **Action**: Mandatory **Google Search** to validate assumptions.
- **Protocol**: If tool fails, generate a High-Fidelity Prompt for the user.
- **The Law of Scrutiny**: Search results are hypotheses, NOT facts. Verify in this codebase.

### Phase 2: Development (The Build)

- **Environment**: Strict TypeScript, ESLint Security.
- **Gatekeeper**: Husky-enforced `SECURITY-CHECKLIST` in commit message.
- **GATE 2**: Generate `Execution Report` -> Request Permission.

### Phase 3: Verification (The Proof)

- **Action**: Run Acceptance Criteria Tests (Jest/Playwright).
- **Proof**: Raw terminal logs referencing current Git HEAD.
- **Visuals**: Playwright `toHaveScreenshot()` on Revenue Pages.
- **GATE 3**: Generate `Verification Report` -> Request Permission.

### Phase 4: CI/CD (The Iron Gate)

- **Static Analysis**: `lint`, `audit-ci`, `trufflehog`, and **Iron Dome** (Injection Scanner).
- **Structural Audit**: `validate-phase-report.sh` auto-rejects reports missing evidence.
- **Enforcement**: Build fails on ANY detection.

### Phase 5: Handover & Review (The Human Gate)

- **Checklist**: Updated `walkthrough.md` + human verification of "Proof".
- **Cooling Off**: 24-hour pause for major features.

### Phase 6: Deployment (The Launch)

- **Validation**: Synthetic Smoke Test on Staging/Production.

---

## 4. Emergency Protocols (Protocol B / P0)

(As previously defined - see archived versions for full text)

---

## 5. Tooling Reference

- **Syntax**: ESLint / Prettier
- **Security**: Trufflehog / Iron Dome / Air-Gapped Admin Client
- **Logic**: Playwright / Jest
- **Gatekeeper**: Husky / validate-phase-report.sh

**Signed,**
_Antigravity (Systemic Quality Agent)_
