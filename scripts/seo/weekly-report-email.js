#!/usr/bin/env node
/**
 * Email-Enabled Weekly SEO Report
 * 
 * Generates weekly SEO reports and emails them automatically
 * 
 * Setup:
 * 1. Add email credentials to .env.local:
 *    EMAIL_USER=csuitebrandagency@gmail.com
 *    EMAIL_PASS=your-app-password
 *    EMAIL_TO=csuitebrandagency@gmail.com
 * 
 * Usage: node scripts/seo/weekly-report-email.js
 */

const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SITE_URL = 'https://csuitemagazine.global';
const CREDENTIALS_PATH = path.join(__dirname, '../../.credentials/google-search-console.json');

async function generateAndEmailReport() {
    console.log('📊 Generating Weekly SEO Report...\n');

    try {
        // Load credentials (Env Var Priority > Local File Fallback)
        let credentials;
        if (process.env.GOOGLE_SEARCH_CONSOLE_JSON) {
            console.log('🔑 Authenticating via Environment Variable...');
            credentials = JSON.parse(process.env.GOOGLE_SEARCH_CONSOLE_JSON);
        } else if (fs.existsSync(CREDENTIALS_PATH)) {
            console.log('📂 Authenticating via Local File...');
            credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
        } else {
            throw new Error('Missing Credentials: Set GOOGLE_SEARCH_CONSOLE_JSON env var or place file in .credentials/');
        }

        // Create auth client
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
        });

        const authClient = await auth.getClient();
        const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });

        // Get current week data
        const thisWeekEnd = new Date();
        const thisWeekStart = new Date();
        thisWeekStart.setDate(thisWeekStart.getDate() - 7);

        // Get previous week data
        const lastWeekEnd = new Date(thisWeekStart);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        console.log(`Report Period: ${thisWeekStart.toISOString().split('T')[0]} to ${thisWeekEnd.toISOString().split('T')[0]}\n`);

        // Fetch data
        const thisWeek = await fetchWeekData(searchconsole, thisWeekStart, thisWeekEnd);
        const lastWeek = await fetchWeekData(searchconsole, lastWeekStart, lastWeekEnd);

        if (!thisWeek.rows && !lastWeek.rows) {
            console.log('⚠️  No data available yet.');
            console.log('Skipping email. Will retry next week.\n');
            return;
        }

        // Calculate metrics
        const metrics = calculateMetrics(thisWeek, lastWeek);

        // Generate HTML email
        const emailHTML = generateEmailHTML(metrics, thisWeek, lastWeek, thisWeekStart, thisWeekEnd);

        // Send email
        await sendEmail(emailHTML, thisWeekStart, thisWeekEnd);

        console.log('\n✅ Weekly report emailed successfully!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);

        // Send error notification
        try {
            await sendErrorEmail(error);
        } catch (emailError) {
            console.error('Failed to send error email:', emailError.message);
        }

        process.exit(1);
    }
}

async function fetchWeekData(searchconsole, startDate, endDate) {
    const response = await searchconsole.searchanalytics.query({
        siteUrl: SITE_URL,
        requestBody: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            dimensions: ['query'],
            rowLimit: 1000,
        },
    });

    return response.data;
}

function calculateMetrics(thisWeek, lastWeek) {
    const thisTotal = calculateTotals(thisWeek.rows || []);
    const lastTotal = calculateTotals(lastWeek.rows || []);

    return {
        clicks: {
            current: thisTotal.clicks,
            previous: lastTotal.clicks,
            change: thisTotal.clicks - lastTotal.clicks,
            changePercent: lastTotal.clicks > 0
                ? ((thisTotal.clicks - lastTotal.clicks) / lastTotal.clicks * 100).toFixed(1)
                : 0
        },
        impressions: {
            current: thisTotal.impressions,
            previous: lastTotal.impressions,
            change: thisTotal.impressions - lastTotal.impressions,
            changePercent: lastTotal.impressions > 0
                ? ((thisTotal.impressions - lastTotal.impressions) / lastTotal.impressions * 100).toFixed(1)
                : 0
        },
        ctr: {
            current: (thisTotal.ctr * 100).toFixed(2),
            previous: (lastTotal.ctr * 100).toFixed(2),
            change: ((thisTotal.ctr - lastTotal.ctr) * 100).toFixed(2)
        },
        position: {
            current: thisTotal.position.toFixed(1),
            previous: lastTotal.position.toFixed(1),
            change: (thisTotal.position - lastTotal.position).toFixed(1)
        }
    };
}

function calculateTotals(rows) {
    if (!rows || rows.length === 0) {
        return { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    }

    const totals = rows.reduce((acc, row) => ({
        clicks: acc.clicks + row.clicks,
        impressions: acc.impressions + row.impressions,
        ctr: acc.ctr + (row.ctr * row.impressions),
        position: acc.position + (row.position * row.impressions)
    }), { clicks: 0, impressions: 0, ctr: 0, position: 0 });

    return {
        clicks: totals.clicks,
        impressions: totals.impressions,
        ctr: totals.impressions > 0 ? totals.ctr / totals.impressions : 0,
        position: totals.impressions > 0 ? totals.position / totals.impressions : 0
    };
}

function generateEmailHTML(metrics, thisWeek, lastWeek, startDate, endDate) {
    const topKeywords = thisWeek.rows
        ? thisWeek.rows.sort((a, b) => b.clicks - a.clicks).slice(0, 10)
        : [];

    const growing = thisWeek.rows && lastWeek.rows
        ? findGrowingKeywords(thisWeek.rows, lastWeek.rows).slice(0, 5)
        : [];

    const actions = generateActionItems(metrics, thisWeek);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #1a73e8; margin-bottom: 5px; font-size: 28px; }
    .period { color: #666; font-size: 14px; margin-bottom: 30px; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .metric-card { background: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #1a73e8; }
    .metric-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .metric-value { font-size: 32px; font-weight: bold; color: #333; margin: 10px 0; }
    .metric-change { font-size: 14px; }
    .positive { color: #0f9d58; }
    .negative { color: #ea4335; }
    .neutral { color: #666; }
    .section { margin: 30px 0; }
    .section-title { font-size: 18px; color: #333; margin-bottom: 15px; border-bottom: 2px solid #1a73e8; padding-bottom: 8px; }
    .keyword-list { list-style: none; padding: 0; }
    .keyword-item { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 6px; }
    .keyword-name { font-weight: bold; color: #1a73e8; }
    .keyword-stats { font-size: 14px; color: #666; margin-top: 5px; }
    .action-item { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 10px 0; border-radius: 4px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Weekly SEO Report</h1>
    <div class="period">C-Suite Magazine | ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</div>

    <div class="metrics">
      <div class="metric-card">
        <div class="metric-label">Total Clicks</div>
        <div class="metric-value">${metrics.clicks.current.toLocaleString()}</div>
        <div class="metric-change ${getChangeClass(metrics.clicks.change)}">
          ${metrics.clicks.change >= 0 ? '↑' : '↓'} ${Math.abs(metrics.clicks.change)} (${metrics.clicks.changePercent}%)
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Impressions</div>
        <div class="metric-value">${metrics.impressions.current.toLocaleString()}</div>
        <div class="metric-change ${getChangeClass(metrics.impressions.change)}">
          ${metrics.impressions.change >= 0 ? '↑' : '↓'} ${Math.abs(metrics.impressions.change)} (${metrics.impressions.changePercent}%)
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Click-Through Rate</div>
        <div class="metric-value">${metrics.ctr.current}%</div>
        <div class="metric-change ${getChangeClass(parseFloat(metrics.ctr.change))}">
          ${parseFloat(metrics.ctr.change) >= 0 ? '↑' : '↓'} ${Math.abs(parseFloat(metrics.ctr.change)).toFixed(2)}%
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Average Position</div>
        <div class="metric-value">#${metrics.position.current}</div>
        <div class="metric-change ${getChangeClass(-parseFloat(metrics.position.change))}">
          ${parseFloat(metrics.position.change) <= 0 ? '↑' : '↓'} ${Math.abs(parseFloat(metrics.position.change)).toFixed(1)}
        </div>
      </div>
    </div>

    ${topKeywords.length > 0 ? `
    <div class="section">
      <div class="section-title">🏆 Top 10 Performing Keywords</div>
      <ul class="keyword-list">
        ${topKeywords.map((k, i) => `
          <li class="keyword-item">
            <div class="keyword-name">${i + 1}. "${k.keys[0]}"</div>
            <div class="keyword-stats">
              ${k.clicks} clicks • ${k.impressions} impressions • ${(k.ctr * 100).toFixed(2)}% CTR • Position #${Math.round(k.position)}
            </div>
          </li>
        `).join('')}
      </ul>
    </div>
    ` : ''}

    ${growing.length > 0 ? `
    <div class="section">
      <div class="section-title">🚀 Fastest Growing Keywords</div>
      <ul class="keyword-list">
        ${growing.map((k, i) => `
          <li class="keyword-item">
            <div class="keyword-name">${i + 1}. "${k.keyword}"</div>
            <div class="keyword-stats">
              ${k.thisWeek} clicks (was ${k.lastWeek}) • <span class="positive">+${k.growth}% growth</span>
            </div>
          </li>
        `).join('')}
      </ul>
    </div>
    ` : ''}

    <div class="section">
      <div class="section-title">🎯 Action Items</div>
      ${actions.map(action => `<div class="action-item">${action}</div>`).join('')}
    </div>

    <div class="footer">
      Automated SEO Report • C-Suite Magazine<br>
      Generated on ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>
`;
}

function getChangeClass(change) {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
}

function findGrowingKeywords(thisWeek, lastWeek) {
    const lastWeekMap = new Map();
    lastWeek.forEach(k => lastWeekMap.set(k.keys[0], k.clicks));

    return thisWeek
        .filter(k => {
            const lastClicks = lastWeekMap.get(k.keys[0]) || 0;
            return k.clicks > lastClicks && k.clicks >= 5;
        })
        .map(k => {
            const lastClicks = lastWeekMap.get(k.keys[0]) || 0;
            const growth = lastClicks > 0 ? ((k.clicks - lastClicks) / lastClicks * 100).toFixed(0) : 100;
            return {
                keyword: k.keys[0],
                thisWeek: k.clicks,
                lastWeek: lastClicks,
                growth: growth
            };
        })
        .sort((a, b) => b.growth - a.growth);
}

function generateActionItems(metrics, thisWeek) {
    const actions = [];

    if (metrics.clicks.changePercent < -10) {
        actions.push(`⚠️ Traffic down ${Math.abs(metrics.clicks.changePercent)}% - Review recent content changes`);
    } else if (metrics.clicks.changePercent > 20) {
        actions.push(`✅ Traffic up ${metrics.clicks.changePercent}% - Document and replicate success!`);
    }

    if (metrics.ctr.current < 2) {
        actions.push(`🎯 Low CTR (${metrics.ctr.current}%) - Optimize titles and meta descriptions`);
    }

    if (parseFloat(metrics.position.current) > 20) {
        actions.push(`📍 Average position is ${metrics.position.current} - Focus on quick wins (#11-30)`);
    }

    if (thisWeek.rows && thisWeek.rows.length > 0) {
        const highImpressionLowClick = thisWeek.rows.filter(k => k.impressions > 100 && k.ctr < 0.03).length;
        if (highImpressionLowClick > 5) {
            actions.push(`💡 ${highImpressionLowClick} keywords have high impressions but low CTR`);
        }
    }

    if (actions.length === 0) {
        actions.push('✅ No critical issues - Continue publishing quality content regularly');
    }

    return actions;
}

async function sendEmail(htmlContent, startDate, endDate) {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailTo = process.env.EMAIL_TO || emailUser;

    if (!emailUser || !emailPass) {
        console.error('\n❌ Email credentials not configured!');
        console.error('Add to .env.local:');
        console.error('  EMAIL_USER=csuitebrandagency@gmail.com');
        console.error('  EMAIL_PASS=your-gmail-app-password');
        console.error('  EMAIL_TO=csuitebrandagency@gmail.com\n');
        throw new Error('Missing email credentials');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });

    const mailOptions = {
        from: `"C-Suite Magazine SEO" <${emailUser}>`,
        to: emailTo,
        subject: `📊 Weekly SEO Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
        html: htmlContent
    };

    console.log(`\n📧 Sending email to ${emailTo}...`);
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
}

async function sendErrorEmail(error) {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailTo = process.env.EMAIL_TO || emailUser;

    if (!emailUser || !emailPass) return;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: emailUser, pass: emailPass }
    });

    const mailOptions = {
        from: `"C-Suite Magazine SEO" <${emailUser}>`,
        to: emailTo,
        subject: '⚠️ SEO Report Generation Failed',
        html: `
      <h2>Weekly SEO Report Failed</h2>
      <p>The automated weekly SEO report encountered an error:</p>
      <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${error.message}</pre>
      <p>Please check the server logs for more details.</p>
    `
    };

    await transporter.sendMail(mailOptions);
}

generateAndEmailReport();
