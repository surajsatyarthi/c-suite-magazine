# The Antigravity Engineering Handbook (v1.0)

**"Nullius in verba" — Take nobody's word for it.**

## 1. Executive Summary

This document defines the **Mandatory Software Development Life Cycle (SDLC)** for the Antigravity project. It replaces ad-hoc "vibe coding" with a rigorous, reliable engineering system modeled after high-maturity organizations (Google, Amazon, Meta).

**The Core Directive:**
No code reaches production without passing through **The Golden Pipeline**: a serialized set of automated and manual gates designed to reject defects, security vulnerabilities, and architectural drift.

---

## 2. Phase I: Discovery & Planning (The "RFC")

**Goal:** Prevent "Building the Wrong Thing" and "Architectural Dead Ends".
**Trigger:** Any feature estimated to take > 4 hours or modifying core infrastructure.

### 2.1 The RFC Process

1.  **Drafting**: Engineer creates a designated issue/doc using the **Standard RFC Template** (see below).
2.  **Review**: The "Lead" (Product Owner/Lead Eng) reviews specifically for:
    - **Security**: Data leaks, AuthZ model.
    - **Scale**: Database impact (The Limit Law).
    - **Complexity**: Is there a simpler way?
3.  **Approval**: "Approved", "Request Changes", or "Rejected". Code _cannot_ start without Approval.

### 2.2 Standard RFC Template

```markdown
# RFC: [Feature Name]

## 1. Problem Statement

What are we solving? Who is it for? Why now?

## 2. Proposed Solution (Technical Design)

- **Architecture**: (Diagram or Description of components)
- **Data Model**: (New tables, fields, relationships)
- **API Spec**: (New endpoints, inputs/outputs)

## 3. Security & Risk

- **Data Sensitivity**: Does this handle PII/Payment data?
- **Threat Model**: How could this be abused? (DoS, IDOR, Injection)
- **Mitigation**: How do we prevent the above?

## 4. Test Strategy

- **Unit**: What logic needs isolation testing?
- **E2E**: What critical user journey needs a Playwright test?
```

---

## 3. Phase II: Development (The "Vibe Defense" Loop)

**Goal:** Catch bugs _instantly_ (seconds), not _later_ (minutes/hours).
**Environment:** Local Machine + VS Code.

### 3.1 The Local Toolchain ("Ralph's Eyes")

The development environment is **Hardened**. It is not a suggestion; it is a constraint.

1.  **Strict TypeScript**: `noImplicitAny: true`. No guessing types.
2.  **Linter (ESLint)**: configured with `security` and `sonarjs` plugins.
    - **Real-time feedback**: Red squiggles for XSS, Secrets, and Complexity.
3.  **Pre-Commit Hook (Husky)**:
    - **Trigger**: `git commit`
    - **Action**: Runs `lint-staged`.
    - **Blocker**: Fails commit if _any_ linter error or hardcoded secret (entropy check) is found.
    - **Bypass**: Forbidden without documented Incident ID.

### 3.2 Branching Strategy

- **Trunk Based Development**:
  - `main`: The Source of Truth. Always Deployable.
  - `feat/xyz`: Short-lived (max 2 days).
  - `fix/xyz`: Bug fixes.
- **Commit Convention**: Conventional Commits (`feat:`, `fix:`, `chore:`).

---

## 4. Phase III: The Automated Gauntlet (CI/CD)

**Goal:** The "Iron Gate". If it fails here, it _never_ merges.
**Trigger**: Push to any branch / Open Pull Request.

### 4.1 The Pipeline Steps

1.  **Setup & Integrity**:
    - `npm ci` (Clean Install). **Fails** if `package-lock.json` is modified without review ("Slopsquatting" Defense).
2.  **Static Analysis (The Auditor)**:
    - `npm run lint`: Code quality & security patterns.
    - `audit-ci`: Checks for known vulnerabilities in dependencies (CVEs).
3.  **Secret Scanning (The Shield)**:
    - `trufflehog`: Scans entire git history of the PR for high-entropy strings (Keys, Passwords).
4.  **The Test Pyramid**:
    - **Unit Tests (Jest)**: Logic verification. (Target: 80% coverage on util/lib).
    - **Integration Tests**: API Route verification.
    - **E2E Tests (Playwright)**: "Golden Set" runs. (Smoke test critical flows).

**Result**: Pass (Green) or Fail (Red). Red pipelines **Block Merge** physically.

---

## 5. Phase IV: The Human Quality Gate (Code Review)

**Goal:** Catch "Logic Bugs" and "Context Amnesia" that AI misses.
**Trigger**: CI Passes (Green).

### 5.1 The Review Checklist

The "Lead" must verify:

- [ ] **Logic**: Does the code actually solve the RFC problem?
- [ ] **Simplicity**: Is this code "clever" or "clear"? (Reject "clever").
- [ ] **Security**: "Spot Check" for IDOR, AuthZ, and sanitization.
- [ ] **Tests**: Did the engineer add a test for the new feature?
- [ ] **No "Happy Path"**: Are error states handled?

---

## 6. Phase V: Release Engineering (Deployment)

**Goal:** Boring, Reliable Deployments.
**Trigger**: Merge to `main`.

### 6.1 The Deployment Pipeline

1.  **Build**: Next.js Production Build (`next build`). Fails on type errors.
2.  **Staging Deploy**: Deployed to `staging.c-suitemagazine.com`.
3.  **Synthetic Smoke Test**:
    - An automated bot visits Staging.
    - Logs in.
    - Loads Homepage.
    - Verifies "Critical Elements" are present.
4.  **Promotion (Manual/Auto)**:
    - If Smoke Test PASSES -> Promote to Production.
    - If Smoke Test FAILS -> Rollback & Alert.

---

## 7. Phase VI: Operation & Maintenance

**Goal:** Know it's broken _before_ the customer does.

### 7.1 Observability

- **Error Tracking**: Centralized Dashboard (e.g., Sentry).
- **Performance**: Core Web Vitals monitoring.
- **Business Metrics**: "Orders per hour", "Signups".

### 7.2 Incident Response (The "P0" Protocol)

If Production breaks:

1.  **Stop the bleeding**: Rollback to last known good commit immediately.
2.  **Fix**: Diagnosis and Patch on `fix/` branch.
3.  **Post-Mortem (RCA)**:
    - **Root Cause**: What happened?
    - **Gap Analysis**: Why did Phases I-V miss it?
    - **Systemic Fix**: New Linter Rule / Test Case to prevent recurrence.

---

## 8. The "Solo Developer" Amendments

**Context**: Reviewing your own code is difficult.
**Protocol**:

1.  **The "24-Hour Cooling Off"**: For major features, do not merge immediately. Wait 24 hours, then review your own code with "fresh eyes".
2.  **Lite Mode (< 1 Hour Task)**:
    - Skip RFC.
    - Run Local Lint/Test.
    - Merge immediately if Green.
3.  **The "Rubber Duck"**: Use an AI Agent (like Grok/Antigravity) to act as the "Reviewer". Paste the diff and ask "Find the bug".

## 9. Automation vs. Human Verification Matrix

| Task                   | Primary Owner | Tooling (The "Bot")    | Human Role                 |
| :--------------------- | :------------ | :--------------------- | :------------------------- |
| **Syntax/Formatting**  | **Bot**       | Prettier/ESLint        | None (Ignored)             |
| **Security Scanning**  | **Bot**       | Trufflehog/Audit-CI    | Triage False Positives     |
| **Dependency Safety**  | **Bot**       | `npm audit` / Lockfile | Approve Upgrades           |
| **Logic Verification** | **Shared**    | Unit Tests             | **Code Review (Critical)** |
| **Architecture**       | **Human**     | None                   | **RFC Design & Approval**  |
| **User Experience**    | **Human**     | Vercel Preview         | **Manual/Visual QA**       |

## 10. The "No Rush" Protocol (Root Cause Mitigation)

**Problem**: Rushing leads to "blind merges", missed tests, and fragility.
**Solution**: Artificial Friction.

### 10.1 The Pre-Commit Speed Bump

We implement a mandatory **Cognitive Pause** logic in `husky`:

1.  **The 3-Second Rule**: The automated check waits 3 seconds before running.
2.  **The Mirror Check**: The terminal asks 3 random questions from the "Safety Checklist" (e.g., "Did you verify no secrets?", "Did you run the test locally?").
3.  **The Penalty**: If you answer "No" or fail the check, the commit is aborted.

### 10.2 The "Slow is Smooth" Rule

- **No Hotfixes without Ticket**: Even if production is on fire, a ticket/issue must exist.
- **No "Quick Edits" in GitHub UI**: All edits must go through the local toolchain.
