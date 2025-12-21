#!/usr/bin/env node
/**
 * SEO Weekly Performance Report Generator
 * 
 * Generates comprehensive weekly SEO performance reports including:
 * - Traffic trends (clicks, impressions, CTR)
 * - Top performing keywords
 * - Ranking changes
 * - Action items and alerts
 * 
 * Can be scheduled to run automatically via cron
 * 
 * Usage: node scripts/seo/weekly-report.js
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://csuitemagazine.global';
const CREDENTIALS_PATH = path.join(__dirname, '../../.credentials/google-search-console.json');

async function generateWeeklyReport() {
    console.log('📊 Generating Weekly SEO Performance Report...\n');

    try {
        // Load credentials
        const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));

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

        // Get previous week data (for comparison)
        const lastWeekEnd = new Date(thisWeekStart);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        console.log(`Report Period: ${thisWeekStart.toISOString().split('T')[0]} to ${thisWeekEnd.toISOString().split('T')[0]}\n`);

        // Fetch this week's data
        const thisWeek = await fetchWeekData(searchconsole, thisWeekStart, thisWeekEnd);

        // Fetch last week's data
        const lastWeek = await fetchWeekData(searchconsole, lastWeekStart, lastWeekEnd);

        if (!thisWeek.rows && !lastWeek.rows) {
            console.log('⚠️  No data available yet. This is normal for newly submitted sites.');
            console.log('💡 Check back in 2-3 weeks after Google starts indexing your content!\n');
            return;
        }

        // Calculate metrics
        const metrics = calculateMetrics(thisWeek, lastWeek);

        // Generate report
        printReport(metrics, thisWeek, lastWeek, thisWeekStart, thisWeekEnd);

        // Export to file
        const reportPath = path.join(__dirname, `../../weekly-seo-report-${thisWeekEnd.toISOString().split('T')[0]}.md`);
        const reportContent = generateMarkdownReport(metrics, thisWeek, lastWeek, thisWeekStart, thisWeekEnd);
        fs.writeFileSync(reportPath, reportContent);

        console.log(`\n✅ Report saved to: ${path.basename(reportPath)}\n`);

    } catch (error) {
        console.error('❌ Error generating report:', error.message);
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

function printReport(metrics, thisWeek, lastWeek, startDate, endDate) {
    console.log('═'.repeat(80));
    console.log('📊 WEEKLY SEO PERFORMANCE REPORT');
    console.log('═'.repeat(80));
    console.log(`Period: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}\n`);

    // Overview
    console.log('─'.repeat(80));
    console.log('📈 PERFORMANCE OVERVIEW');
    console.log('─'.repeat(80));

    printMetric('Total Clicks', metrics.clicks.current, metrics.clicks.change, metrics.clicks.changePercent);
    printMetric('Total Impressions', metrics.impressions.current, metrics.impressions.change, metrics.impressions.changePercent);
    printMetric('Average CTR', `${metrics.ctr.current}%`, metrics.ctr.change + '%', null);
    printMetric('Average Position', metrics.position.current, metrics.position.change, null, true);

    // Top performing keywords
    if (thisWeek.rows && thisWeek.rows.length > 0) {
        console.log('\n' + '─'.repeat(80));
        console.log('🏆 TOP 10 PERFORMING KEYWORDS');
        console.log('─'.repeat(80));

        const topKeywords = thisWeek.rows
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, 10);

        topKeywords.forEach((k, i) => {
            console.log(`\n${i + 1}. "${k.keys[0]}"`);
            console.log(`   Clicks: ${k.clicks} | Impressions: ${k.impressions} | CTR: ${(k.ctr * 100).toFixed(2)}% | Position: #${Math.round(k.position)}`);
        });
    }

    // Growing keywords
    if (thisWeek.rows && lastWeek.rows) {
        console.log('\n' + '─'.repeat(80));
        console.log('🚀 FASTEST GROWING KEYWORDS');
        console.log('─'.repeat(80));

        const growing = findGrowingKeywords(thisWeek.rows, lastWeek.rows).slice(0, 10);

        if (growing.length > 0) {
            growing.forEach((k, i) => {
                console.log(`\n${i + 1}. "${k.keyword}"`);
                console.log(`   Clicks: ${k.thisWeek} (was ${k.lastWeek}) | Growth: +${k.growth}%`);
            });
        } else {
            console.log('\n   No significant growth detected this week.');
        }
    }

    // Action items
    console.log('\n' + '─'.repeat(80));
    console.log('🎯 ACTION ITEMS');
    console.log('─'.repeat(80));

    const actions = generateActionItems(metrics, thisWeek);
    actions.forEach((action, i) => {
        console.log(`\n${i + 1}. ${action}`);
    });

    console.log('\n' + '═'.repeat(80));
}

function printMetric(label, current, change, changePercent, lowerIsBetter = false) {
    const direction = (lowerIsBetter ? change < 0 : change > 0) ? '📈' : (change === 0 ? '➡️' : '📉');
    const sign = change > 0 ? '+' : '';
    const percentStr = changePercent !== null ? ` (${sign}${changePercent}%)` : '';

    console.log(`${direction} ${label}: ${current} | Change: ${sign}${change}${percentStr}`);
}

function findGrowingKeywords(thisWeek, lastWeek) {
    const lastWeekMap = new Map();
    lastWeek.forEach(k => {
        lastWeekMap.set(k.keys[0], k.clicks);
    });

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

    // Traffic changes
    if (metrics.clicks.changePercent < -10) {
        actions.push(`⚠️  Traffic down ${Math.abs(metrics.clicks.changePercent)}% - Review recent content changes and ranking drops`);
    } else if (metrics.clicks.changePercent > 20) {
        actions.push(`✅ Traffic up ${metrics.clicks.changePercent}% - Document what's working and replicate success`);
    }

    // CTR optimization
    if (metrics.ctr.current < 2) {
        actions.push(`🎯 Low CTR (${metrics.ctr.current}%) - Optimize titles and meta descriptions for top 10 keywords`);
    }

    // Position tracking
    if (parseFloat(metrics.position.current) > 20) {
        actions.push(`📍 Average position is ${metrics.position.current} - Focus on quick wins (keywords ranking #11-30)`);
    }

    // Content suggestions
    if (thisWeek.rows && thisWeek.rows.length > 0) {
        const highImpressionLowClick = thisWeek.rows.filter(k => k.impressions > 100 && k.ctr < 0.03).length;
        if (highImpressionLowClick > 5) {
            actions.push(`💡 ${highImpressionLowClick} keywords have high impressions but low CTR - Potential for quick traffic gains`);
        }
    }

    if (actions.length === 0) {
        actions.push('✅ No critical issues detected - Continue publishing quality content regularly');
    }

    return actions;
}

function generateMarkdownReport(metrics, thisWeek, lastWeek, startDate, endDate) {
    const md = `# Weekly SEO Report

**Period:** ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}  
**Generated:** ${new Date().toISOString()}

---

## Performance Overview

| Metric | This Week | Last Week | Change |
|--------|-----------|-----------|--------|
| Clicks | ${metrics.clicks.current} | ${metrics.clicks.previous} | ${metrics.clicks.change >= 0 ? '+' : ''}${metrics.clicks.change} (${metrics.clicks.changePercent}%) |
| Impressions | ${metrics.impressions.current} | ${metrics.impressions.previous} | ${metrics.impressions.change >= 0 ? '+' : ''}${metrics.impressions.change} (${metrics.impressions.changePercent}%) |
| CTR | ${metrics.ctr.current}% | ${metrics.ctr.previous}% | ${metrics.ctr.change >= 0 ? '+' : ''}${metrics.ctr.change}% |
| Avg Position | ${metrics.position.current} | ${metrics.position.previous} | ${metrics.position.change >= 0 ? '+' : ''}${metrics.position.change} |

---

## Top 10 Performing Keywords

${thisWeek.rows ? thisWeek.rows.sort((a, b) => b.clicks - a.clicks).slice(0, 10).map((k, i) =>
        `${i + 1}. **"${k.keys[0]}"**\n   - Clicks: ${k.clicks} | Impressions: ${k.impressions} | CTR: ${(k.ctr * 100).toFixed(2)}% | Position: #${Math.round(k.position)}`
    ).join('\n\n') : 'No data available'}

---

## Action Items

${generateActionItems(metrics, thisWeek).map((action, i) => `${i + 1}. ${action}`).join('\n')}

---

**Next Steps:** Review action items and prioritize content creation for high-opportunity keywords.
`;

    return md;
}

generateWeeklyReport();
