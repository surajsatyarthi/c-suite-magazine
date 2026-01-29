# Research Exemption Guidelines

## When Research IS Required (Default)

**Most issues need external research**:

- Bugs with unknown root cause
- Performance issues
- Framework/library behavior questions
- Security vulnerabilities
- Deployment failures
- "It should work but doesn't" problems

**Why**: Pattern-matching from memory leads to wasted time and rework.

---

## When Research CAN Be Exempted

### Valid Exemption Scenarios

1. **Simple Documentation Fixes**
   - Typo corrections
   - Formatting fixes
   - Adding missing punctuation
   - **Example**: "Fix typo in README: 'teh' → 'the'"

2. **File Removal**
   - Deleting unused/deprecated files
   - Removing test fixtures
   - **Example**: "Remove legacy .eslintrc.old file"

3. **Hardcoded Value Updates**
   - Changing configuration constants
   - Updating copyright year
   - **Example**: "Update copyright 2025 → 2026"

4. **Simple UI Tweaks**
   - Spacing adjustments (if design approved)
   - Color value changes (if design approved)
   - **Example**: "Increase button padding from 8px to 12px per design"

5. **Straightforward Refactoring**
   - Renaming variables for clarity (no logic change)
   - Moving code to existing helper (no behavior change)
   - **Example**: "Extract hardcoded URL to constant"

---

## How to Claim Exemption

### Step 1: Document in Phase 1 Report

Add this section to `docs/reports/phase_1_assessment_report_<ISSUE_NUM>.md`:

```markdown
## Research Exemption

**Claimed**: Yes

**Issue Type**: [Simple documentation fix / File removal / Config update / etc.]

**Justification**:
This is a straightforward [typo fix / deletion / value update] that does not
require external research because:

- No framework behavior involved
- No unknown edge cases
- Standard practice / obvious solution
- [Specific reason]

**What would research find?**:
Nothing beyond what's already known: [brief explanation]
```

### Step 2: Get User Approval

User must review and approve the exemption in the Phase 2 implementation plan.

---

## Invalid Exemption Scenarios

### ❌ These CANNOT Skip Research

1. **"I've seen this before"**
   - **Why invalid**: Memory can be wrong
   - **Example**: "This looks like the Issue #X bug" (research might show different root cause)

2. **"It's obvious what's wrong"**
   - **Why invalid**: "Obvious" fixes fail all the time
   - **Example**: "Just add revalidate = 600" (without researching why it's missing)

3. **"It's a simple code change"**
   - **Why invalid**: Simple changes can have complex implications
   - **Example**: "Change true to false" (without understanding what the flag does)

4. **"Vercel docs say so"**
   - **Why invalid**: Still need to search for edge cases, alternatives, gotchas
   - **Example**: Can't claim exemption just because you found one doc page

---

## Validation

### Gate Validator Checks

```bash
bash .agent/workflows/validate-ralph-gates.sh <issue_num>
```

**Passes if**:

- 3+ searches documented, OR
- Valid exemption with justification

**Fails if**:

- Exemption claimed but no justification
- Justification is vague/invalid
- Less than 3 searches AND no exemption

### Pre-Commit Hook Checks

```bash
git commit -m "Issue #X: ..."
```

**Allows commit if**:

- Phase 1 has 3+ searches, OR
- Phase 1 has valid exemption
- Phase 2 approved (user must approve exemption)

**Blocks commit if**:

- Exemption claimed without justification
- Justification missing required detail

---

## Example: Valid Exemption

### Issue #99: Fix Typo in Footer

**Phase 1 Report**:

```markdown
# Phase 1: Assessment - Issue #99

## Problem

Footer displays "© 2025 INVICTUS INTERNATONAL" (missing 'I')

## Physical Audit

- File: components/Footer.tsx line 42
- Current: "INTERNATONAL"
- Should be: "INTERNATIONAL"

## Research Exemption

**Claimed**: Yes

**Issue Type**: Simple typo correction

**Justification**:
This is a one-character typo fix in hardcoded text. No external research
needed because:

- No framework/library behavior involved
- No logic changes required
- Standard spelling correction
- No edge cases or side effects possible

**What would research find?**:
Nothing. "International" is spelled with an 'I'. No configuration, no
system behavior, just fixing English spelling.
```

**Phase 2 Implementation Plan**:

```markdown
# Phase 2: Implementation - Issue #99

## Changes

File: components/Footer.tsx, Line 42
Change: "INTERNATONAL" → "INTERNATIONAL"

## Testing

Visual inspection of footer text

<!-- USER APPROVED - Exemption accepted -->
```

**Result**: ✅ Passes all gates, commit allowed

---

## Example: Invalid Exemption

### ❌ Issue #45: Fix Andy Jassy 404

**Phase 1 Report (INVALID)**:

```markdown
## Research Exemption

**Claimed**: Yes

**Justification**: I know Next.js, just need to add revalidate config
```

**Why This Fails**:

- ❌ "I know Next.js" is not a valid justification
- ❌ Doesn't explain WHY research is unnecessary
- ❌ Issue involves framework behavior (Next.js routing)
- ❌ Potential edge cases need investigation

**Correct Approach**:

- ✅ Research Next.js dynamic params documentation
- ✅ Search for similar 404 issues
- ✅ Understand difference between staticParams and dynamicParams
- ✅ Document 3+ searches

---

## Summary

| Issue Type                      | Research Required? | Exemption Allowed? |
| ------------------------------- | ------------------ | ------------------ |
| Typo in text                    | ❌                 | ✅ Yes             |
| Framework 404 error             | ✅                 | ❌ No              |
| Delete unused file              | ❌                 | ✅ Yes             |
| Performance issue               | ✅                 | ❌ No              |
| Update copyright year           | ❌                 | ✅ Yes             |
| "Should work but doesn't"       | ✅                 | ❌ No              |
| Spacing tweak (approved design) | ❌                 | ✅ Yes             |
| Security vulnerability          | ✅                 | ❌ No              |

**When in doubt**: Do the research. It takes 10 minutes and prevents days of rework.
