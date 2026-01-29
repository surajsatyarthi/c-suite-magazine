#!/bin/bash
# Ralph Protocol Gate 10: 24-Hour Production Monitoring
# Monitors a deployed fix for 24 hours before marking RESOLVED
# Usage: bash .agent/workflows/monitor-gate-10.sh <issue_number> <production_url>

set -e

ISSUE_NUM=$1
URL=$2

if [[ -z "$ISSUE_NUM" ]] || [[ -z "$URL" ]]; then
  echo "❌ Usage: bash monitor-gate-10.sh <issue_number> <production_url>"
  echo "Example: bash monitor-gate-10.sh 45 https://csuitemagazine.global/article/andy-jassy"
  exit 1
fi

# Create monitoring log directory
MONITOR_DIR="docs/reports/monitoring"
mkdir -p "$MONITOR_DIR"

LOG_FILE="$MONITOR_DIR/issue_${ISSUE_NUM}_gate10.log"
HOURS_TO_CHECK=(0 6 12 24)

echo "🔍 Ralph Protocol Gate 10: 24-Hour Monitoring - Issue #${ISSUE_NUM}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "URL: $URL"
echo "Log: $LOG_FILE"
echo ""

# Function to check URL
check_url() {
  local hour=$1
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S %Z')
  
  echo "[$timestamp] Hour $hour Check:" | tee -a "$LOG_FILE"
  
  # Get HTTP status
  STATUS=$(curl -sL -o /dev/null -w '%{http_code}' "$URL" 2>&1)
  
  if [[ $STATUS == "200" ]] || [[ $STATUS == "308" ]]; then
    echo "  ✅ HTTP $STATUS - Success" | tee -a "$LOG_FILE"
    return 0
  else
    echo "  ❌ HTTP $STATUS - FAILURE" | tee -a "$LOG_FILE"
  return 1
  fi
}

# Hour 0 (immediate check)
echo "🕐 Hour 0: Deployment Verification"
if check_url 0; then
  echo ""
  echo "✅ Hour 0 check passed"
  echo ""
  echo "📅 Scheduled Checks:"
  echo "  - Hour 6:  $(date -v+6H '+%Y-%m-%d %H:%M %Z' 2>/dev/null || date -d '+6 hours' '+%Y-%m-%d %H:%M %Z' 2>/dev/null || echo 'In 6 hours')"
  echo "  - Hour 12: $(date -v+12H '+%Y-%m-%d %H:%M %Z' 2>/dev/null || date -d '+12 hours' '+%Y-%m-%d %H:%M %Z' 2>/dev/null || echo 'In 12 hours')"
  echo "  - Hour 24: $(date -v+24H '+%Y-%m-%d %H:%M %Z' 2>/dev/null || date -d '+24 hours' '+%Y-%m-%d %H:%M %Z' 2>/dev/null || echo 'In 24 hours')"
  echo ""
  echo "💡 To run scheduled checks:"
  echo "   # Hour 6:"
  echo "   bash .agent/workflows/monitor-gate-10.sh $ISSUE_NUM \"$URL\" --check 6"
  echo ""
  echo "   # Hour 12:"
  echo "   bash .agent/workflows/monitor-gate-10.sh $ISSUE_NUM \"$URL\" --check 12"
  echo ""
  echo "   # Hour 24 (final):"
  echo "   bash .agent/workflows/monitor-gate-10.sh $ISSUE_NUM \"$URL\" --check 24"
  echo ""
else
  echo ""
  echo "❌ Hour 0 check FAILED - Deployment issue detected!"
  echo "   Do NOT mark issue as RESOLVED"
  echo ""
  exit 1
fi

# Check if this is a scheduled check
if [[ "$3" == "--check" ]] && [[ -n "$4" ]]; then
  HOUR=$4
  echo ""
  echo "🕐 Hour $HOUR: Scheduled Check"
  
  if check_url "$HOUR"; then
    echo ""
    
    if [[ $HOUR -eq 24 ]]; then
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "🎉 Gate 10 COMPLETE - 24 Hours Verified"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo ""
      echo "Issue #${ISSUE_NUM} can now be marked as RESOLVED"
      echo ""
      echo "Next steps:"
      echo "  1. Update ISSUES_LOG.md to mark Issue #${ISSUE_NUM} as RESOLVED"
      echo "  2. Document final resolution date"
      echo "  3. Archive monitoring logs"
      echo ""
    else
      echo "✅ Checkpoint passed. Continue monitoring."
      echo ""
    fi
  else
    echo ""
    echo "❌ Hour $HOUR check FAILED"
    echo "   Issue #${ISSUE_NUM} NOT ready to mark RESOLVED"
    echo "   Investigate the failure before proceeding"
    echo ""
    exit 1
  fi
fi
