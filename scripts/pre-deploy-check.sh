#!/bin/bash

# Pre-deployment schema integrity check
# Run this before deploying schema changes or running data migration scripts

set -e

echo "🔍 Running Pre-Deployment Schema Integrity Checks..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Validate schema
echo "1️⃣  Validating Sanity Schema..."
if pnpm exec sanity schema validate; then
    echo -e "${GREEN}✓ Schema validation passed${NC}"
else
    echo -e "${RED}✗ Schema validation failed${NC}"
    exit 1
fi
echo ""

# 2. Run data audit
echo "2️⃣  Running Data Structure Audit..."
if npx tsx scripts/audit-schema-mismatch.ts; then
    echo -e "${GREEN}✓ Data audit completed${NC}"
else
    echo -e "${RED}✗ Data audit failed${NC}"
    exit 1
fi
echo ""

# 3. Run integrity tests (if they exist)
if [ -f "tests/sanity-schema-integrity.test.ts" ]; then
    echo "3️⃣  Running Schema Integrity Tests..."
    if pnpm test tests/sanity-schema-integrity.test.ts; then
        echo -e "${GREEN}✓ Integrity tests passed${NC}"
    else
        echo -e "${RED}✗ Integrity tests failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Integrity tests not found (skipping)${NC}"
fi
echo ""

echo -e "${GREEN}🎉 All pre-deployment checks passed!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review audit output above"
echo "  2. If deploying schema: pnpm exec sanity schema deploy"
echo "  3. If running migrations: npx tsx scripts/[migration-script].ts --dry-run"
echo ""
