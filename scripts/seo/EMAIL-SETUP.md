# Email Setup Guide for Automated SEO Reports

**Goal:** Get weekly SEO reports automatically emailed to csuitebrandagency@gmail.com every Monday at 9 AM.

---

## Step 1: Create Gmail App Password (Required!)

### Why?
Google blocks regular password logins from apps for security. You need a special "App Password."

### How to Get It (5 minutes):

1. **Go to Google Account Settings:**
   - Visit: https://myaccount.google.com/apppasswords
   - Sign in with: csuitebrandagency@gmail.com

2. **Enable 2-Factor Authentication (if not already):**
   - If you don't have 2FA: https://myaccount.google.com/signinoptions/two-step-verification
   - Follow the setup (required for app passwords)

3. **Create App Password:**
   - App name: "SEO Reports"
   - Click "Create"
   - **COPY THE 16-CHARACTER PASSWORD** (looks like: `abcd efgh ijkl mnop`)

4. **Save it** - You'll need it in Step 2!

---

## Step 2: Configure Email Credentials

Add these to your `.env.local` file:

```bash
# Open .env.local in editor
open .env.local

# Add these lines (replace with your app password):
EMAIL_USER=csuitebrandagency@gmail.com
EMAIL_PASS=your-16-char-app-password-here
EMAIL_TO=csuitebrandagency@gmail.com
```

**Example:**
```bash
EMAIL_USER=csuitebrandagency@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_TO=csuitebrandagency@gmail.com
```

**⚠️  IMPORTANT:** 
- Remove spaces from the app password
- Don't use quotes around the values
- This file is gitignored for security

---

## Step 3: Test Email Sending

Before setting up automation, test that emails work:

```bash
cd ~/Desktop/Magazine/ceo-magazine
node scripts/seo/weekly-report-email.js
```

**Expected Output:**
```
📊 Generating Weekly SEO Report...
Report Period: 2024-12-15 to 2024-12-22

📧 Sending email to csuitebrandagency@gmail.com...
✅ Email sent successfully!
```

**Check your email!** You should receive a nicely formatted HTML report.

---

## Step 4: Set Up Automated Scheduling

Once email works, set up weekly automation:

```bash
# Run the setup script
./scripts/seo/setup-cron.sh
```

**What it does:**
- Creates cron job to run every Monday at 9 AM
- Sets up logging to `logs/seo-report.log`
- Configures proper environment

**Verification:**
```bash
# Check if cron job was added
crontab -l | grep "weekly-report-email"

# Should show:
# 0 9 * * 1 cd /Users/surajsatyarthi/Desktop/Magazine/ceo-magazine &&...
```

---

## Step 5: Wait for First Report

**Next Monday at 9 AM:**
- Script runs automatically
- Email sent to csuitebrandagency@gmail.com
- Logs saved to `logs/seo-report.log`

**To check logs:**
```bash
tail -f logs/seo-report.log
```

---

## What the Email Looks Like

Your weekly email will include:

### 📊 Performance Overview
- Total Clicks (with week-over-week change)
- Impressions (with trend)
- Click-Through Rate
- Average Position

### 🏆 Top 10 Performing Keywords
- Keyword name
- Clicks, impressions, CTR, position
- Sorted by clicks

### 🚀 Fastest Growing Keywords
- Keywords with biggest growth
- % increase from last week

### 🎯 Action Items
- Automated recommendations based on data
- Alerts for ranking drops
- Optimization opportunities

**All formatted in beautiful HTML with colors and emojis!**

---

## Troubleshooting

### "Email credentials not configured"
- Make sure EMAIL_USER and EMAIL_PASS are in `.env.local`
- No quotes around values
- No spaces in app password

### "Authentication failed"
- App password is wrong - regenerate it
- 2FA not enabled - enable it first
- Using regular password instead of app password

### "No data available"
- Normal for first few weeks
- Script will skip email and retry next week
- No error - just a notice

### Email not arriving
- Check spam folder
- Verify EMAIL_TO is correct
- Check logs: `cat logs/seo-report.log`

---

## Manual Testing Commands

```bash
# Test connection
node scripts/seo/test-search-console.js

# Test email (uses current week's data)
node scripts/seo/weekly-report-email.js

# View cron jobs
crontab -l

# Remove cron job (if needed)
crontab -l | grep -v "weekly-report-email" | crontab -

# View logs
tail -n 50 logs/seo-report.log
```

---

## Schedule Details

**Frequency:** Every Monday at 9:00 AM  
**Timezone:** Your local timezone (Asia/Kolkata)  
**Duration:** ~30 seconds to run  
**Email:** HTML formatted, sent immediately

**Cron Expression:**
```
0 9 * * 1
│ │ │ │ │
│ │ │ │ └─ Monday (1)
│ │ │ └─── Every month (*)
│ │ └───── Every day of month (*)
│ └─────── 9 AM
└───────── 0 minutes
```

---

## Next Steps

1. ✅ Create Gmail app password
2. ✅ Add to `.env.local`
3. ✅ Test email manually
4. ✅ Run `setup-cron.sh`
5. ✅ Wait for Monday 9 AM
6. ✅ Check your email!

**That's it! Fully automated weekly SEO reports!** 📧✨

---

## Optional: Add More Recipients

To send reports to multiple people:

```bash
# In .env.local:
EMAIL_TO=csuitebrandagency@gmail.com,other@example.com,another@example.com
```

Separate emails with commas, no spaces!

---

**Questions?** Test manually first with `node scripts/seo/weekly-report-email.js`
