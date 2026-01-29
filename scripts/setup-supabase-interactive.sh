#!/bin/bash

# Interactive Supabase Setup Script
# This script guides you through setting up Supabase for the executive compensation feature

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Supabase Setup - Executive Compensation Programmatic SEO     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Installing..."
    if command -v brew &> /dev/null; then
        brew install supabase/tap/supabase
    else
        echo "❌ Homebrew not found. Please install Supabase CLI manually:"
        echo "   https://supabase.com/docs/guides/cli"
        exit 1
    fi
fi

echo "✅ Supabase CLI found"
echo ""

# Step 1: Login to Supabase
echo "📝 Step 1: Supabase Login"
echo "────────────────────────────────────────────────────────────────"
echo "Opening browser for Supabase authentication..."
echo "Please log in or sign up at https://supabase.com"
echo ""

supabase login

echo ""
echo "✅ Successfully logged in to Supabase"
echo ""

# Step 2: Create project
echo "📝 Step 2: Create Supabase Project"
echo "────────────────────────────────────────────────────────────────"
echo ""
read -p "Enter project name (default: csuite-magazine-prod): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-csuite-magazine-prod}

echo ""
read -sp "Enter database password (min 8 characters): " DB_PASSWORD
echo ""

if [ ${#DB_PASSWORD} -lt 8 ]; then
    echo "❌ Password must be at least 8 characters"
    exit 1
fi

echo ""
echo "Choose region:"
echo "1) us-east-1 (N. Virginia) - Recommended for US"
echo "2) us-west-1 (N. California)"
echo "3) eu-central-1 (Frankfurt)"
echo "4) ap-southeast-1 (Singapore)"
read -p "Select region (1-4, default: 1): " REGION_CHOICE
REGION_CHOICE=${REGION_CHOICE:-1}

case $REGION_CHOICE in
    1) REGION="us-east-1" ;;
    2) REGION="us-west-1" ;;
    3) REGION="eu-central-1" ;;
    4) REGION="ap-southeast-1" ;;
    *) REGION="us-east-1" ;;
esac

echo ""
echo "Creating project: $PROJECT_NAME in $REGION..."
echo ""

# Note: Supabase CLI doesn't have direct project creation
# User needs to create via dashboard
echo "⚠️  Please create the project manually:"
echo ""
echo "1. Go to: https://app.supabase.com/new"
echo "2. Project name: $PROJECT_NAME"
echo "3. Database password: [your password]"
echo "4. Region: $REGION"
echo "5. Click 'Create new project'"
echo ""
read -p "Press Enter once you've created the project..."

# Step 3: Get project credentials
echo ""
echo "📝 Step 3: Get Project Credentials"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "1. Go to: https://app.supabase.com/project/_/settings/api"
echo "2. Copy the Project URL (looks like: https://xxxxx.supabase.co)"
echo ""
read -p "Paste Project URL: " SUPABASE_URL

echo ""
echo "3. Copy the Service Role Key (under 'Project API keys')"
echo "   ⚠️  This is a secret key - keep it secure!"
echo ""
read -sp "Paste Service Role Key: " SUPABASE_KEY
echo ""

# Validate inputs
if [[ ! $SUPABASE_URL =~ ^https://.*\.supabase\.co$ ]]; then
    echo "❌ Invalid Supabase URL format"
    exit 1
fi

if [ ${#SUPABASE_KEY} -lt 100 ]; then
    echo "❌ Service role key seems too short. Please verify."
    exit 1
fi

echo ""
echo "✅ Credentials validated"

# Step 4: Create .env.local
echo ""
echo "📝 Step 4: Creating .env.local"
echo "────────────────────────────────────────────────────────────────"

cat > .env.local << EOF
# Supabase Configuration (Programmatic SEO - Executive Compensation Data)
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_KEY

# Copy other required variables from .env.example if needed
EOF

echo "✅ .env.local created"
echo ""

# Step 5: Run schema migration
echo "📝 Step 5: Running Database Schema Migration"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "Opening Supabase SQL Editor..."
echo ""
echo "1. Go to: https://app.supabase.com/project/_/sql"
echo "2. Click 'New Query'"
echo "3. Copy the contents of db/schema.sql"
echo "4. Paste into the SQL editor"
echo "5. Click 'Run' to execute"
echo ""
read -p "Press Enter once you've run the schema migration..."

echo ""
echo "✅ Schema migration should be complete"

# Step 6: Test connection
echo ""
echo "📝 Step 6: Testing Connection"
echo "────────────────────────────────────────────────────────────────"
echo ""

# Create a quick test script
cat > /tmp/test-supabase.mjs << 'EOF'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(url, key, {
  db: { schema: 'public' },
  global: {
    headers: { 'x-connection-pooler': 'supavisor' }
  }
})

const { data, error } = await supabase.from('executives').select('*').limit(1)

if (error) {
  console.error('❌ Connection test failed:', error.message)
  process.exit(1)
}

console.log('✅ Connection successful!')
console.log('   Tables accessible:', data !== null)
EOF

echo "Running connection test..."
node /tmp/test-supabase.mjs

echo ""

# Step 7: Add to Vercel
echo "📝 Step 7: Add Environment Variables to Vercel"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "Adding to Vercel production environment..."

echo -n "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo -n "$SUPABASE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

echo ""
echo "Adding to Vercel preview environment..."

echo -n "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL preview
echo -n "$SUPABASE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY preview

echo ""
echo "✅ Vercel environment variables configured"

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                     Setup Complete! 🎉                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Supabase project created"
echo "✅ Database schema migrated"
echo "✅ .env.local configured"
echo "✅ Vercel environment variables set"
echo ""
echo "Next steps:"
echo "1. Import sample data: npx tsx scripts/data-import/import-executives.ts"
echo "2. Test locally: pnpm dev"
echo "3. Visit: http://localhost:3000/executives/tim-cook"
echo "4. Deploy: git push"
echo ""
echo "Documentation:"
echo "- SETUP_SUPABASE.md - Full setup guide"
echo "- PROGRAMMATIC_SEO_WEEK1_COMPLETE.md - Week 1 summary"
echo ""
