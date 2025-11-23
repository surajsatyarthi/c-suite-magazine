#!/usr/bin/env bash
set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 PRE-DEPLOYMENT VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Critical verification checks
VERIFICATION_FAILED=0

# 1. Check for duplicate images
echo ""
echo "1️⃣  Checking for duplicate images..."
if node scripts/comprehensive-duplicate-verification.js > /tmp/dup-verify.log 2>&1; then
  DUPLICATES=$(grep "Duplicate image groups:" /tmp/dup-verify.log | awk '{print $NF}')
  if [ "$DUPLICATES" = "0" ]; then
    echo "   ✅ Zero duplicates confirmed"
  else
    echo "   ❌ CRITICAL: $DUPLICATES duplicate image groups found"
    echo "   Run: node scripts/comprehensive-duplicate-verification.js"
    VERIFICATION_FAILED=1
  fi
else
  echo "   ❌ CRITICAL: Duplicate verification script failed"
  VERIFICATION_FAILED=1
fi

# 2. Check for missing images
echo ""
echo "2️⃣  Checking for missing images..."
MISSING=$(grep "Articles WITHOUT images:" /tmp/dup-verify.log | awk '{print $NF}' || echo "unknown")
if [ "$MISSING" = "0" ]; then
  echo "   ✅ No missing images"
elif [ "$MISSING" = "unknown" ]; then
  echo "   ⚠️  WARNING: Could not verify missing images"
else
  echo "   ❌ CRITICAL: $MISSING articles missing images"
  VERIFICATION_FAILED=1
fi

# Exit if verification failed
if [ $VERIFICATION_FAILED -eq 1 ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ VERIFICATION FAILED - DEPLOYMENT BLOCKED"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Fix the issues above before deploying."
  echo "This is a $5,000/day revenue protection measure."
  echo ""
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ VERIFICATION PASSED - PROCEEDING WITH DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ "${FAST_DEPLOY:-}" == "1" ]]; then
  echo "FAST_DEPLOY enabled: skipping preview smoke checks and local build."
  echo "Deploying directly to production via Vercel cloud build..."
  npx vercel --prod --yes --archive=tgz
  echo "Production deploy complete (fast path)."
else
  echo "Building preview artifacts..."
  npx tsc --noEmit
  npx vercel build

  echo "Deploying preview to get URL for smoke checks..."
  PREVIEW_OUTPUT=$(npx vercel deploy --prebuilt --yes --archive=tgz || true)
  if [[ -z "${PREVIEW_OUTPUT}" ]]; then
    echo "Prebuilt upload may be rate-limited; trying cloud build deploy..."
    PREVIEW_OUTPUT=$(npx vercel --yes --archive=tgz || true)
  fi
  PREVIEW_URL=$(echo "$PREVIEW_OUTPUT" | grep -Eo 'https://[^ ]+' | tail -n 1)

  if [[ -z "${PREVIEW_URL}" ]]; then
    echo "Failed to determine preview URL from Vercel output" >&2
    exit 1
  fi

  echo "Preview URL: ${PREVIEW_URL}"
  echo "Running smoke checks against preview..."
  ALLOW_401=1 SMOKE_BASE_URL="${PREVIEW_URL}" node scripts/smoke-check.js

  echo "Smoke checks passed (or preview protected). Building production artifacts..."
  npx vercel build --prod
  echo "Promoting to production..."
  PROD_OUTPUT=$(npx vercel deploy --prebuilt --prod --yes --archive=tgz 2>&1 || npx vercel --prod --yes --archive=tgz 2>&1)
  echo "$PROD_OUTPUT"
  
  # Extract production URL
  PROD_URL=$(echo "$PROD_OUTPUT" | grep -E "Production:|https://ceo-magazine.*vercel\.app" | grep "https://" | awk '{print $NF}' | head -1)
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ DEPLOYMENT COMPLETE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  if [ -n "$PROD_URL" ]; then
    echo "Production URL: $PROD_URL"
    echo ""
    echo "Next steps:"
    echo "  1. Set alias: npx vercel alias set $PROD_URL csuitemagazine.global --scope suraj-satyarthis-projects"
    echo "  2. Verify: curl -I https://csuitemagazine.global"
    echo "  3. Final check: node scripts/triple-verification.js"
  fi
  echo ""
fi
