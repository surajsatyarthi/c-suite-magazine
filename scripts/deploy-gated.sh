#!/usr/bin/env bash
set -euo pipefail

echo "Building preview artifacts..."
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
npx vercel deploy --prebuilt --prod --yes --archive=tgz || npx vercel --prod --yes --archive=tgz
echo "Production deploy complete."
