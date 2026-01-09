#!/bin/bash

echo "🧪 SPOTLIGHT TESTING - Local Verification"
echo "=========================================="
echo ""

# 1. Test spotlight.json structure
echo "1. Validating spotlight.json..."
if ! jq empty public/spotlight.json 2>/dev/null; then
    echo "❌ Invalid JSON in spotlight.json"
    exit 1
fi

TOTAL=$(jq 'length' public/spotlight.json)
echo "   ✅ Valid JSON with $TOTAL items"

# 2. Verify order
echo ""
echo "2. Current grid order:"
jq -r 'to_entries[] | "   Grid \(.key + 1). \(.value.href | split("/")[-1])"' public/spotlight.json

# 3. Check for Rich Stinson
echo ""
echo "3. Checking for Rich Stinson in grid..."
if jq -e '.[] | select(.href | contains("rich-stinson"))' public/spotlight.json > /dev/null; then
    echo "   ❌ FAIL: Rich Stinson found in grid (should only be in Executive in Focus)"
    exit 1
else
    echo "   ✅ PASS: Rich Stinson not in grid"
fi

# 4. Verify positions
echo ""
echo "4. Verifying required positions:"

GRID_1=$(jq -r '.[0].href | split("/")[-1]' public/spotlight.json)
GRID_2=$(jq -r '.[1].href | split("/")[-1]' public/spotlight.json)

if [ "$GRID_1" = "stella-ambrose-deputy-ceo-sawit-kinabalu" ]; then
    echo "   ✅ Grid 1: Stella Ambrose"
else
    echo "   ❌ Grid 1: $GRID_1 (expected stella-ambrose-deputy-ceo-sawit-kinabalu)"
    exit 1
fi

if [ "$GRID_2" = "bill-faruki" ]; then
    echo "   ✅ Grid 2: Bill Faruki"
else
    echo "   ❌ Grid 2: $GRID_2 (expected bill-faruki)"
    exit 1
fi

# 5. Check TypeScript compilation
echo ""
echo "5. Checking TypeScript compilation..."
if npm run build > /tmp/build.log 2>&1; then
    echo "   ✅ Build successful"
else
    echo "   ❌ Build failed - check /tmp/build.log"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ ALL TESTS PASSED - Safe to deploy"
echo "=========================================="
