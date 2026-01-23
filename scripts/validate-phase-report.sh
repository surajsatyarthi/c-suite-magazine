#!/usr/bin/env bash

# 🛡️ Ralph Protocol v2.5: Structural Report Validator
# Verifies that Phase Reports contain raw logs anchored to the current Git HEAD.

set -e

REPORT_DIR="docs/reports"
CURRENT_HASH=$(git rev-parse HEAD)
SHORT_HASH=${CURRENT_HASH:0:7}

echo "🔍 Auditing Phase Reports for Contextual Anchoring (Git HEAD: $SHORT_HASH)..."

# Find all reports modified in the last 1 day.
# If ISSUE_ID is provided, only scan reports for that issue.
if [ -n "$ISSUE_ID" ]; then
  echo "🎯 Filtering by Issue ID: $ISSUE_ID"
  REPORTS=$(find "$REPORT_DIR" -name "*_${ISSUE_ID}.md" -mtime -1)
else
  REPORTS=$(find "$REPORT_DIR" -name "*.md" -mtime -1)
fi

if [ -z "$REPORTS" ]; then
  echo "⚠️ No recent reports found to audit."
  exit 0
fi

FAILED=0

for report in $REPORTS; do
  echo "  - Checking $report..."
  
  # 1. Check for raw terminal logs
  if ! grep -q '```bash' "$report"; then
    echo "    ❌ ERROR: No raw terminal logs found in $report."
    FAILED=1
  fi
  
  # 2. Check for Contextual Anchoring (Git Hash)
  # The log must include something like "git hash: abc1234"
  if ! grep -q "$SHORT_HASH" "$report"; then
    echo "    ❌ ERROR: Logs in $report are not anchored to the current Git HEAD ($SHORT_HASH)."
    echo "       Please include 'git rev-parse --short HEAD' output in your terminal logs."
    FAILED=1
  fi
done

if [ $FAILED -eq 1 ]; then
  echo "------------------------------------------------------------------------"
  echo "❌ Ralph Protocol v2.5 Failure: Structural Evidence Audit Failed."
  echo "Reports must contain verifiable raw logs anchored to the current commit."
  echo "------------------------------------------------------------------------"
  exit 1
fi

echo "✅ All reports passed structural audit."
exit 0
