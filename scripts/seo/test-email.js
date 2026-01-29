#!/usr/bin/env node
/**
 * Test Email with Sample Data
 * Shows what the weekly SEO report email will look like
 */

const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

async function sendTestEmail() {
    console.log('📧 Sending test email with sample data...\n');

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailTo = process.env.EMAIL_TO || emailUser;

    if (!emailUser || !emailPass) {
        console.error('❌ Email credentials not configured!');
        console.error('Please add EMAIL_USER and EMAIL_PASS to .env.local\n');
        process.exit(1);
    }

    // Sample data to show what report looks like
    const sampleHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #1a73e8; margin-bottom: 5px; font-size: 28px; }
    .period { color: #666; font-size: 14px; margin-bottom: 20px; }
    .test-badge { background: #ffc107; color: #000; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; font-size: 12px; margin-bottom: 20px; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .metric-card { background: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #1a73e8; }
    .metric-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .metric-value { font-size: 32px; font-weight: bold; color: #333; margin: 10px 0; }
    .metric-change { font-size: 14px; }
    .positive { color: #0f9d58; }
    .negative { color: #ea4335; }
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
    <div class="period">C-Suite Magazine | Dec 15, 2025 - Dec 22, 2025</div>
    <div class="test-badge">🧪 TEST DATA - DEMO PREVIEW</div>

    <div class="metrics">
      <div class="metric-card">
        <div class="metric-label">Total Clicks</div>
        <div class="metric-value">1,234</div>
        <div class="metric-change positive">
          ↑ 156 (+14.5%)
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Impressions</div>
        <div class="metric-value">45,678</div>
        <div class="metric-change positive">
          ↑ 2,345 (+5.4%)
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Click-Through Rate</div>
        <div class="metric-value">2.70%</div>
        <div class="metric-change positive">
          ↑ 0.21%
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Average Position</div>
        <div class="metric-value">#12.3</div>
        <div class="metric-change positive">
          ↑ 2.1
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">🏆 Top 10 Performing Keywords</div>
      <ul class="keyword-list">
        <li class="keyword-item">
          <div class="keyword-name">1. "CEO interview tips"</div>
          <div class="keyword-stats">
            45 clicks • 1,234 impressions • 3.65% CTR • Position #5
          </div>
        </li>
        <li class="keyword-item">
          <div class="keyword-name">2. "C-suite leadership strategies"</div>
          <div class="keyword-stats">
            38 clicks • 2,156 impressions • 1.76% CTR • Position #8
          </div>
        </li>
        <li class="keyword-item">
          <div class="keyword-name">3. "executive decision making"</div>
          <div class="keyword-stats">
            32 clicks • 987 impressions • 3.24% CTR • Position #6
          </div>
        </li>
        <li class="keyword-item">
          <div class="keyword-name">4. "how to prepare for CEO interview"</div>
          <div class="keyword-stats">
            28 clicks • 1,543 impressions • 1.81% CTR • Position #11
          </div>
        </li>
        <li class="keyword-item">
          <div class="keyword-name">5. "CEO magazine articles"</div>
          <div class="keyword-stats">
            24 clicks • 876 impressions • 2.74% CTR • Position #7
          </div>
        </li>
      </ul>
    </div>

    <div class="section">
      <div class="section-title">🚀 Fastest Growing Keywords</div>
      <ul class="keyword-list">
        <li class="keyword-item">
          <div class="keyword-name">1. "executive leadership 2025"</div>
          <div class="keyword-stats">
            18 clicks (was 5) • <span class="positive">+260% growth</span>
          </div>
        </li>
        <li class="keyword-item">
          <div class="keyword-name">2. "CEO interview questions"</div>
          <div class="keyword-stats">
            22 clicks (was 8) • <span class="positive">+175% growth</span>
          </div>
        </li>
        <li class="keyword-item">
          <div class="keyword-name">3. "C-suite magazine subscription"</div>
          <div class="keyword-stats">
            12 clicks (was 5) • <span class="positive">+140% growth</span>
          </div>
        </li>
      </ul>
    </div>

    <div class="section">
      <div class="section-title">🎯 Action Items</div>
      <div class="action-item">✅ Traffic up 14.5% - Document and replicate success!</div>
      <div class="action-item">💡 12 keywords have high impressions but low CTR - Optimize titles and descriptions</div>
      <div class="action-item">📍 Average position is 12.3 - Focus on quick wins (#11-30)</div>
    </div>

    <div class="footer">
      <strong>🧪 This is a TEST email with sample data</strong><br>
      Real reports will show your actual Google Search Console metrics<br><br>
      Automated SEO Report • C-Suite Magazine<br>
      Generated on ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>
`;

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
        subject: '🧪 TEST: Weekly SEO Report Preview (Sample Data)',
        html: sampleHTML
    };

    console.log(`Sending test email to ${emailTo}...`);
    await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('\n📬 Check your inbox at:', emailTo);
    console.log('\nℹ️  This email contains SAMPLE data to show format.');
    console.log('   Real weekly reports will have your actual metrics.\n');
}

sendTestEmail().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
});
