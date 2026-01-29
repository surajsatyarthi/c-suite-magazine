#!/bin/bash
# Automatic cleanup of old Antigravity browser artifacts
# Removes screenshots and recordings older than 7 days

BRAIN_DIR="/Users/surajsatyarthi/.gemini/antigravity/brain"
DAYS_TO_KEEP=7

echo "🧹 Cleaning up old Antigravity test artifacts..."
echo "Location: $BRAIN_DIR"
echo "Keeping files from last $DAYS_TO_KEEP days"

# Count files before cleanup
BEFORE=$(find "$BRAIN_DIR" -type f \( -name "*.webp" -o -name "*.png" -o -name "*.jpg" \) | wc -l)
echo "Files before cleanup: $BEFORE"

# Delete old artifacts
find "$BRAIN_DIR" -type f \( -name "*.webp" -o -name "*.png" -o -name "*.jpg" \) -mtime +$DAYS_TO_KEEP -delete

# Count files after cleanup
AFTER=$(find "$BRAIN_DIR" -type f \( -name "*.webp" -o -name "*.png" -o -name "*.jpg" \) | wc -l)
echo "Files after cleanup: $AFTER"
echo "Removed: $((BEFORE - AFTER)) files"

# Show current disk usage
echo ""
echo "Current disk usage:"
du -sh "$BRAIN_DIR"

echo ""
echo "✅ Cleanup complete"
