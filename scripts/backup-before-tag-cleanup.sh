#!/bin/bash
# Pre-flight backup before tag cleanup
# Creates timestamped Sanity dataset backup

set -e  # Exit on error

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/tag-cleanup-backup-${TIMESTAMP}.tar.gz"

echo "🔄 Creating Sanity backup before tag cleanup..."
echo "📁 Backup location: ${BACKUP_FILE}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Export Sanity dataset
npx sanity dataset export production "${BACKUP_FILE}"

# Verify backup was created
if [ -f "${BACKUP_FILE}" ]; then
    FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "✅ Backup created successfully!"
    echo "   Size: ${FILE_SIZE}"
    echo "   Path: ${BACKUP_FILE}"
    echo ""
    echo "⚠️  IMPORTANT: Keep this backup for 90 days minimum"
    echo "   To restore: npx sanity dataset import ${BACKUP_FILE} production --replace"
else
    echo "❌ Backup failed!"
    exit 1
fi
