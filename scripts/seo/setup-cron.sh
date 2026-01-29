#!/bin/bash
#
# SEO Automation Cron Setup Script
# 
# This script sets up automated scheduling for weekly SEO reports
#
# What it does:
# - Adds cron job to run weekly-report-email.js every Monday at 9 AM
# - Ensures proper environment and logging
#

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔧 Setting up SEO Automation Cron Jobs..."
echo

# Get the project directory (use script's actual location)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Create logs directory
mkdir -p "$PROJECT_DIR/logs"

# Cron job command
CRON_CMD="0 9 * * 1 cd $PROJECT_DIR && /usr/bin/env node scripts/seo/weekly-report-email.js >> logs/seo-report.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "weekly-report-email.js"; then
    echo -e "${YELLOW}⚠️  Cron job already exists!${NC}"
    echo
    echo "Current cron jobs:"
    crontab -l | grep "weekly-report-email.js"
    echo
    read -p "Do you want to replace it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    
    # Remove existing cron job
    crontab -l | grep -v "weekly-report-email.js" | crontab -
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -

echo -e "${GREEN}✅ Cron job added successfully!${NC}"
echo
echo "📅 Schedule: Every Monday at 9:00 AM"
echo "📧 Reports will be emailed to: csuitebrandagency@gmail.com"
echo "📝 Logs will be saved to: logs/seo-report.log"
echo
echo "Current cron jobs:"
crontab -l | grep "weekly-report-email.js"
echo
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo
echo "Next steps:"
echo "1. Configure email credentials in .env.local"
echo "2. Test manually: node scripts/seo/weekly-report-email.js"
echo "3. Wait for Monday at 9 AM for first automated report"
echo
