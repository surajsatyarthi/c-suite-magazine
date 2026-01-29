#!/bin/bash
# Ralph Protocol Gate Validator
# Run this BEFORE making any code changes
# Usage: bash .agent/workflows/validate-ralph-gates.sh <issue_number>

set -e

ISSUE_NUM=$1

if [[ -z "$ISSUE_NUM" ]]; then
  echo "❌ Usage: bash validate-ralph-gates.sh <issue_number>"
  echo "Example: bash validate-ralph-gates.sh 45"
  exit 1
fi

echo "🔍 Ralph Protocol Gate Validation - Issue #${ISSUE_NUM}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PHASE_1="docs/reports/phase_1_assessment_report_${ISSUE_NUM}.md"
PHASE_2="docs/reports/phase_2_execution_report_${ISSUE_NUM}.md"

GATES_PASSED=0
GATES_FAILED=0

# Gate 1: Physical Audit
echo "Gate 1: Physical Audit"
if [[ -f "$PHASE_1" ]]; then
  echo "  ✅ Assessment report exists: $PHASE_1"
  GATES_PASSED=$((GATES_PASSED + 1))
else
  echo "  ❌ MISSING: $PHASE_1"
  echo "     Required: Document root cause analysis"
  GATES_FAILED=$((GATES_FAILED + 1))
fi
echo ""

# Gate 2: External Research (MANDATORY)
echo "Gate 2: External Research (MANDATORY)"
if [[ -f "$PHASE_1" ]]; then
  # Check for research exemption
  if grep -q "## Research Exemption\|RESEARCH NOT REQUIRED\|NO RESEARCH NEEDED" "$PHASE_1"; then
    # Exemption claimed - validate justification exists
    if grep -A3 "## Research Exemption\|RESEARCH NOT REQUIRED\|NO RESEARCH NEEDED" "$PHASE_1" | grep -q "Justification:\|Reason:\|Why:"; then
      echo "  ⚠️  RESEARCH EXEMPTION claimed (requires user approval)"
      echo "     Exemption documented in $PHASE_1"
      # Mark as passed but flag for user review
      GATES_PASSED=$((GATES_PASSED + 1))
    else
      echo "  ❌ RESEARCH EXEMPTION claimed but NO JUSTIFICATION"
      echo "     Add 'Justification: [reason]' after exemption declaration"
      GATES_FAILED=$((GATES_FAILED + 1))
    fi
  else
    # No exemption - require 3+ searches
    SEARCH_COUNT=$(grep -c "## Search" "$PHASE_1" 2>/dev/null || echo "0")
    if [[ $SEARCH_COUNT -ge 3 ]]; then
      echo "  ✅ External research complete: $SEARCH_COUNT searches documented"
      GATES_PASSED=$((GATES_PASSED + 1))
    else
      echo "  ❌ INSUFFICIENT: Only $SEARCH_COUNT searches (need 3+)"
      echo "     Add web search documentation to $PHASE_1"
      echo "     Format: '## Search 1: [query]'"
      echo ""
      echo "     OR claim exemption if research truly not needed:"
      echo "     ## Research Exemption"
      echo "     Justification: [explain why external research is unnecessary]"
      GATES_FAILED=$((GATES_FAILED + 1))
    fi
  fi
else
  echo "  ⏳ PENDING: Complete Gate 1 first"
  GATES_FAILED=$((GATES_FAILED + 1))
fi
echo ""

# Gate 3: Implementation Plan + User Approval
echo "Gate 3: Implementation Plan & User Approval"
if [[ -f "$PHASE_2" ]]; then
  if grep -q "USER APPROVED\|APPROVED BY USER\|\\[APPROVED\\]" "$PHASE_2"; then
    echo "  ✅ Implementation plan approved by user"
    GATES_PASSED=$((GATES_PASSED + 1))
  else
    echo "  ⏳ AWAITING APPROVAL: Plan exists but not approved"
    echo "     Get user approval and add marker to $PHASE_2"
    GATES_FAILED=$((GATES_FAILED + 1))
  fi
else
  echo "  ❌ MISSING: $PHASE_2"
  echo "     Required: Create implementation plan for user review"
  GATES_FAILED=$((GATES_FAILED + 1))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Gates Passed: $GATES_PASSED / 3"
echo "Gates Failed: $GATES_FAILED / 3"
echo ""

if [[ $GATES_FAILED -eq 0 ]]; then
  echo "✅ ALL GATES PASSED - Code editing AUTHORIZED"
  echo ""
  echo "You may now use:"
  echo "  - replace_file_content"
  echo "  - write_to_file"
  echo "  - multi_replace_file_content"
  echo ""
  exit 0
else
  echo "❌ GATES INCOMPLETE - Code editing BLOCKED"
  echo ""
  echo "Complete missing gates before making code changes."
  echo "This prevents the rework loop that extends timelines."
  echo ""
  exit 1
fi
