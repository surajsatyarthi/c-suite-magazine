#!/bin/bash

# Script to download latest CI snapshots to local repo
# Usage: ./scripts/download-snapshots.sh [workflow-name]

WORKFLOW_NAME="${1:-playwright.yml}"   # Default to standard Playwright workflow
REPO_OWNER="surajsatyarthi"
REPO_NAME="c-suite-magazine"
FULL_REPO="$REPO_OWNER/$REPO_NAME"

echo "🦅 The Eagle: Syncing Snapshots from CI ($FULL_REPO)..."

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed."
    echo "Install via: brew install gh"
    exit 1
fi

# Get the latest successful run ID
echo "🔍 Searching for latest successful run of $WORKFLOW_NAME..."
RUN_ID=$(gh run list --repo "$FULL_REPO" --workflow "$WORKFLOW_NAME" --status success --limit 1 --json databaseId | jq '.[0].databaseId')

if [ -z "$RUN_ID" ]; then
  echo "❌ Error: No successful runs found for workflow $WORKFLOW_NAME."
  exit 1
fi

echo "✅ Found Run ID: $RUN_ID"

# Download the artifact
echo "⬇️ Downloading 'playwright-snapshots'..."
rm -rf temp-snapshots
gh run download "$RUN_ID" --repo "$FULL_REPO" --name playwright-snapshots --dir temp-snapshots

if [ $? -ne 0 ]; then
    echo "⚠️ Warning: Could not download 'playwright-snapshots'. Use --update-snapshots in CI first?"
    exit 1
fi

# Copy to local snapshot directory (overwrite existing)
echo "📂 Installing snapshots to tests/e2e/__snapshots__..."
mkdir -p tests/e2e/__snapshots__
cp -r temp-snapshots/* tests/e2e/__snapshots__/

# Clean up temp dir
rm -rf temp-snapshots

echo "🎉 Success! Snapshots updated from Run $RUN_ID."
