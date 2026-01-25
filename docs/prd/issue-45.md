# PRD: Ralph Protocol v2.7 (The Integrity Layer)

## 1. Objective

Eliminate "Process Erosion" and "Vibe Coding" where an agent (AI) or human performs "Checkbox Compliance" without actually verifying the truth.

## 2. Technical Requirements

### 2.1. Assumption Scanner (`scripts/assumption-scanner.ts`)

- **Action**: Must scan staged code for "Fragile Patterns".
- **Patterns to Detect**:
  - `|| true` or `|| echo` in shell commands (Masking failure).
  - Hardcoded article types (e.g., searching for `'post'` or `'csa'` outside of `lib/urls.ts`).
  - Use of `any` in TypeScript (unless explicitly bypassed with a comment).
  - GROQ queries missing the `_type` field.
- **Enforcement**: Blocks commit via Husky if patterns are found without a `// RALPH-BYPASS` comment and justification.

### 2.2. Mini-PRD Mandate

- **Action**: Every new Issue ID must have a requirements file in `docs/prd/issue-[ID].md`.
- **Enforcement**: `validate-phase-report.sh` checks for the existence of this file.

### 2.3. Unmaskable Logs (Anti-Spoofing)

- **Action**: `validate-phase-report.sh` must verify that reported logs are not "stale".
- **Mechanism**: Every log must contains a line showing `date` and `git rev-parse --short HEAD` executed within the log block itself.

### 2.4. Digital Twin (Visual Regression)

- **Action**: Strengthen Playwright tests to automatically run against the 3 high-revenue articles (Stella, Rich, Sukhinder) for every P0 fix.

## 3. Success Metrics

- **Zero Reopens**: 100% of tasks pass first verification without requiring a "Day 2" patch.
- **Structural Rejection**: The validator script correctly identifies and rejects at least 1 simulated "crappy fix".
