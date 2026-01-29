---
description: Mandatory workflow for ALL issue resolution - enforces Ralph Protocol gates
---

# Ralph Protocol: Mandatory Issue Resolution Workflow

**CRITICAL**: This workflow is UNSKIPPABLE. Any attempt to bypass these gates will be blocked by pre-commit hooks.

## Why This Exists

- **Day 10 instead of Day 3**: Skipping gates causes rework loops
- **Issue #45**: Failed 5+ times due to missing research
- **Issue #50**: Failed 4 times due to incomplete root cause analysis
- **Pattern**: "Quick fixes" without planning = guaranteed failure

---

## The 10 Gates (MANDATORY)

### **PHASE 1: Assessment (Gates 1-2)**

#### Gate 1: Physical Audit ✋ STOP HERE FIRST

**DO NOT**:

- ❌ Assume you know the problem
- ❌ Pattern-match from previous experience
- ❌ Jump to solutions

**DO**:

1. Curl actual URLs, check HTTP status codes
2. Query Sanity for actual data state
3. Check file existence, not assumptions
4. Read actual code, not memory of code
5. Test in production, not just locally

**Deliverable**: `docs/reports/phase_1_assessment_report_<ISSUE_NUM>.md`

**Template**:

```markdown
# Phase 1: Physical Audit - Issue #XX

## Problem Statement

[What is actually broken - be specific]

## Physical Verification

1. **Production Check**:
   - Command: `curl -I https://...`
   - Result: HTTP 404
   - Evidence: [paste output]

2. **Data Check**:
   - Command: `sanity documents query "..."`
   - Result: [actual data]

3. **Code Check**:
   - File: app/article/[slug]/page.tsx
   - Current state: [what it actually does]

## Root Cause Hypothesis

[Based on evidence, not assumptions]
```

---

#### Gate 2: External Research (MANDATORY - NO EXCEPTIONS)

**You MUST**:

- Document minimum 3 web searches
- Search official documentation
- Search GitHub issues, StackOverflow
- Find how others solved similar problems

**DO NOT**:

- ❌ Skip research because "I know Next.js"
- ❌ Trust internal pattern-matching
- ❌ Proceed without external validation

**Add to Phase 1 report**:

```markdown
## External Research (Gate 2)

### Search 1: Next.js dynamic params 404

- Query: "Next.js 16 dynamic params returns 404"
- URL: https://nextjs.org/docs/...
- Finding: dynamicParams defaults to false, causing 404 for non-prerendered paths

### Search 2: ISR configuration

- Query: "Next.js ISR revalidate configuration"
- URL: https://...
- Finding: revalidate = 600 enables 10-minute regeneration

### Search 3: Similar issues

- Query: "Next.js app router 404 dynamic route"
- URL: https://github.com/vercel/next.js/issues/...
- Finding: Missing dynamicParams export is common cause
```

**Validation**: `bash .agent/workflows/validate-ralph-gates.sh <ISSUE_NUM>`

---

### **PHASE 2: Planning (Gate 3)**

#### Gate 3: Implementation Plan + User Approval

**DO NOT START CODING YET**

1. Create `docs/reports/phase_2_execution_report_<ISSUE_NUM>.md`
2. Document:
   - Proposed changes (specific files, lines)
   - Why this fixes the root cause
   - Alternative approaches considered
   - Testing strategy
3. Request user review via `notify_user`
4. Wait for approval
5. Add marker: `<!-- USER APPROVED -->` after approval

**Template**:

```markdown
# Phase 2: Implementation Plan - Issue #XX

## Proposed Solution

### Root Cause

[From Gate 1 audit]

### Fix Strategy

[Based on Gate 2 research]

### Changes Required

#### File: app/article/[slug]/page.tsx

- **Line 10**: Add `export const revalidate = 600`
- **Line 11**: Add `export const dynamicParams = true`
- **Why**: Enables ISR and on-demand rendering (per Next.js docs)

## Alternatives Considered

1. **Option A**: Update redirect in next.config.ts
   - Pro: Quick fix
   - Con: Doesn't solve root cause
2. **Option B** (chosen): Fix route configuration
   - Pro: Permanent solution
   - Con: Requires deeper change

## Testing Plan

1. Local: Test curl http://localhost:3000/article/andy-jassy
2. Staging: Deploy to preview
3. Production: Verify with curl + 24h monitoring

## User Approval

⏳ Awaiting user review...

<!-- After approval, user adds: -->
<!-- USER APPROVED - 2026-01-28 -->
```

---

### **PHASE 3: Execution (Gates 4-9)**

**BEFORE editing ANY code, run**:

```bash
bash .agent/workflows/validate-ralph-gates.sh <ISSUE_NUM>
```

If exit code != 0, you are **BLOCKED** from code editing.

#### Gate 4: Implementation

- Make only approved changes
- No scope creep
- Document what you're doing

#### Gate 5: Local Testing

```bash
pnpm build
pnpm start
curl -I http://localhost:3000/article/andy-jassy
```

#### Gate 6: Security Scan

```bash
pnpm secretlint
```

#### Gate 7: E2E Tests

```bash
pnpm test:e2e
```

#### Gate 8: Staging Deployment

```bash
git push origin staging
# Verify: curl -I https://preview-url.vercel.app/article/andy-jassy
```

#### Gate 9: Production Deployment

```bash
git push origin main
```

---

### **PHASE 4: Verification (Gate 10)**

#### Gate 10: 24-Hour Watchtower (MANDATORY)

**DO NOT mark RESOLVED until**:

- ✅ Monitored for 24 hours
- ✅ Curl shows 200 OK
- ✅ No errors in logs
- ✅ Screenshot proof captured

```bash
# Hour 0
curl -I https://csuitemagazine.global/article/andy-jassy

# Hour 6
curl -I https://csuitemagazine.global/article/andy-jassy

# Hour 12
curl -I https://csuitemagazine.global/article/andy-jassy

# Hour 24
curl -I https://csuitemagazine.global/article/andy-jassy
```

**Create**: `docs/reports/phase_3_verification_report_<ISSUE_NUM>.md`

---

## Enforcement Mechanisms

### 1. Pre-Commit Hook

- Installed: `.git/hooks/pre-commit`
- **Blocks** commits without phase reports
- **Blocks** commits without user approval
- **Blocks** commits with <3 external searches

### 2. Gate Validation Script

```bash
# Run BEFORE any code changes
bash .agent/workflows/validate-ralph-gates.sh 45

# If fails, you CANNOT edit code
# Complete missing gates first
```

### 3. Manual Verification

User can check gate status anytime:

```bash
bash .agent/workflows/validate-ralph-gates.sh <ISSUE_NUM>
```

---

## The Golden Rule

**"If you haven't run validate-ralph-gates.sh and seen ✅ ALL GATES PASSED, you are NOT authorized to edit code"**

---

## Breaking The Loop

**OLD PROCESS** (caused 10-day delays):

1. See problem
2. "Fix" immediately (symptom)
3. Deploy
4. Breaks again
5. Repeat 5+ times

**NEW PROCESS** (enforced):

1. Physical audit (Gate 1)
2. External research (Gate 2)
3. Plan + approval (Gate 3)
4. Implement (Gates 4-9)
5. Monitor 24h (Gate 10)
6. Actually resolved

**Time saved**: 7 days per issue

---

## Example Usage

```bash
# Step 1: Validate current state
bash .agent/workflows/validate-ralph-gates.sh 45

# Output: Gates Failed, shows what's missing

# Step 2: Complete Gate 1 (audit)
# Create: docs/reports/phase_1_assessment_report_45.md

# Step 3: Complete Gate 2 (research)
# Add 3+ searches to phase_1 report

# Step 4: Validate again
bash .agent/workflows/validate-ralph-gates.sh 45

# Output: Gate 3 pending

# Step 5: Create implementation plan
# Create: docs/reports/phase_2_execution_report_45.md

# Step 6: Get user approval
# User reviews, approves, adds marker

# Step 7: Final validation
bash .agent/workflows/validate-ralph-gates.sh 45

# Output: ✅ ALL GATES PASSED - Code editing AUTHORIZED

# Step 8: Now you can edit code
# Pre-commit hook will verify on git commit
```

---

**This workflow is now PHYSICALLY ENFORCED. You cannot bypass it.**
