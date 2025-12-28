#!/usr/bin/env bash
set -euo pipefail

# Local pre-push checks: TypeScript, lint, build (uses dummy env vars)
echo "Running local pre-push checks..."

export NEXT_PUBLIC_SANITY_PROJECT_ID='demo'
export NEXT_PUBLIC_SANITY_DATASET='production'
export NEXT_PUBLIC_SANITY_API_VERSION='2024-10-01'
export NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=''
export NEXT_PUBLIC_BING_SITE_VERIFICATION=''
export NEXT_PUBLIC_YANDEX_SITE_VERIFICATION=''
export NEXT_PUBLIC_SPOTLIGHT_COUNT='5'
export BASE_URL='http://localhost:3000'
export SANITY_WRITE_TOKEN='dummy'
export SANITY_API_TOKEN='dummy'
export SLACK_WEBHOOK_URL='https://example.invalid/webhook'

echo "1/3: TypeScript compile check"
pnpm -s tsc --noEmit

echo "2/3: Lint"
pnpm -s run lint

echo "3/3: Build (fast check)"
pnpm -s run build

echo "All pre-push checks passed."
