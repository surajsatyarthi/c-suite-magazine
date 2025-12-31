#!/bin/bash

# Production Smoke Test Script
# Run this IMMEDIATELY after any production deployment
# Usage: ./scripts/verify-production.sh

set -e

PROD_URL="https://csuitemagazine.global"
ERRORS=0

echo "🔍 Starting production smoke tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Homepage loads
echo "Test 1: Homepage loads"
if curl -sf "$PROD_URL" > /dev/null; then
    echo "✅ PASS - Homepage loads successfully"
else
    echo "❌ FAIL - Homepage failed to load"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Test 2: Search API
echo "Test 2: Search API responds"
SEARCH_RESPONSE=$(curl -s -w "%{http_code}" "$PROD_URL/api/search?q=ceo" -o /tmp/search-response.json)
if [ "$SEARCH_RESPONSE" = "200" ]; then
    echo "✅ PASS - Search API returns 200"
    if jq -e '.results' /tmp/search-response.json > /dev/null 2>&1; then
        echo "✅ PASS - Search API returns valid JSON with results"
    else
        echo "⚠️  WARN - Search API JSON may be malformed"
    fi
else
    echo "❌ FAIL - Search API returned HTTP $SEARCH_RESPONSE"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Test 3: RSS Feed
echo "Test 3: RSS feed generates valid XML"
RSS_CONTENT=$(curl -s "$PROD_URL/rss.xml")
if echo "$RSS_CONTENT" | grep -q '<?xml version="1.0"'; then
    echo "✅ PASS - RSS feed is valid XML"
    ITEM_COUNT=$(echo "$RSS_CONTENT" | grep -c '<item>' || echo "0")
    echo "   └─ Found $ITEM_COUNT articles in feed"
else
    echo "❌ FAIL - RSS feed is not valid XML"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Test 4: Google Analytics Tag
echo "Test 4: Google Analytics tag loads"
HTML=$(curl -s "$PROD_URL")
if echo "$HTML" | grep -q "googletagmanager.com/gtag/js"; then
    echo "✅ PASS - Google Analytics script tag found"
    if echo "$HTML" | grep -q "G-P58LP0EZLL"; then
        echo "✅ PASS - Correct measurement ID (G-P58LP0EZLL) found"
    else
        echo "❌ FAIL - GA tag found but wrong measurement ID"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "❌ FAIL - Google Analytics tag NOT found"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Test 5: Check for JavaScript errors in HTML
echo "Test 5: Check for obvious errors in HTML"
if echo "$HTML" | grep -qi "error.*boundary\|uncaught\|exception"; then
    echo "⚠️  WARN - Potential JavaScript errors detected in HTML"
    echo "$HTML" | grep -i "error\|exception" | head -5
else
    echo "✅ PASS - No obvious errors in HTML"
fi
echo ""

# Test 6: Check critical meta tags
echo "Test 6: SEO meta tags present"
META_CHECKS=0
if echo "$HTML" | grep -q '<meta.*description'; then
    echo "✅ Meta description present"
else
    echo "❌ Meta description MISSING"
    META_CHECKS=$((META_CHECKS + 1))
fi

if echo "$HTML" | grep -q '<meta.*og:'; then
    echo "✅ Open Graph tags present"
else
    echo "⚠️  Open Graph tags missing"
fi

if echo "$HTML" | grep -q 'application/ld+json'; then
    echo "✅ Structured data (JSON-LD) present"
else
    echo "⚠️  Structured data missing"
fi

if [ $META_CHECKS -gt 0 ]; then
    ERRORS=$((ERRORS + META_CHECKS))
fi
echo ""

# Test 7: Vercel deployment status
echo "Test 7: Check latest Vercel deployment"
LATEST_DEPLOY=$(vercel ls --prod 2>/dev/null | head -2 | tail -1 | awk '{print $1}')
if [ -n "$LATEST_DEPLOY" ]; then
    echo "✅ Latest production deployment: $LATEST_DEPLOY"
else
    echo "⚠️  Could not verify Vercel deployment (vercel CLI may not be authenticated)"
fi
echo ""

# Final result
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo "✅ ALL TESTS PASSED"
    echo ""
    echo "Production deployment verified successfully."
    echo "Site is healthy and ready for traffic."
    exit 0
else
    echo "❌ $ERRORS TEST(S) FAILED"
    echo ""
    echo "CRITICAL: Production site has issues!"
    echo "Action required:"
    echo "1. Check Vercel logs: vercel logs"
    echo "2. Consider rollback: vercel rollback"
    echo "3. Investigate and fix issues before proceeding"
    exit 1
fi
