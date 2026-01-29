#!/usr/bin/env node
/**
 * SEO Keyword Opportunity Finder
 * 
 * Finds keyword opportunities by analyzing Search Console data:
 * - Keywords ranking #11-30 (easy to improve to page 1)
 * - High impression, low click keywords (CTR optimization)
 * - Trending keywords with growing traffic
 * 
 * Usage: node scripts/seo/find-keyword-opportunities.js
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://csuitemagazine.global';
const CREDENTIALS_PATH = path.join(__dirname, '../../.credentials/google-search-console.json');
const DAYS_TO_ANALYZE = 90; // Last 90 days

async function findOpportunities() {
    console.log('🔍 Finding SEO Keyword Opportunities...\n');

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

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - DAYS_TO_ANALYZE);

        console.log(`📊 Analyzing last ${DAYS_TO_ANALYZE} days (${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]})`);
        console.log('Please wait...\n');

        // Fetch keyword data
        const response = await searchconsole.searchanalytics.query({
            siteUrl: SITE_URL,
            requestBody: {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                dimensions: ['query'],
                rowLimit: 5000,
            },
        });

        if (!response.data.rows) {
            console.log('⚠️  No data found yet. This is normal for newly submitted sites.');
            console.log('💡 Check back in 2-3 weeks after Google starts ranking your content!\n');
            return;
        }

        const keywords = response.data.rows;
        console.log(`✅ Found ${keywords.length} keywords\n`);

        // Category 1: Quick Wins (Ranking #11-30 = Page 2-3)
        const quickWins = keywords
            .filter(k => k.position > 10 && k.position <= 30)
            .sort((a, b) => b.impressions - a.impressions)
            .slice(0, 20);

        // Category 2: CTR Optimization (High impressions, low CTR)
        const ctrOpportunities = keywords
            .filter(k => k.impressions > 100 && k.ctr < 0.05 && k.position <= 20)
            .sort((a, b) => (b.impressions * (0.05 - b.ctr)) - (a.impressions * (0.05 - a.ctr)))
            .slice(0, 15);

        // Category 3: High Potential (Good rankings but low clicks)
        const highPotential = keywords
            .filter(k => k.position <= 10 && k.clicks < 50)
            .sort((a, b) => (a.position - b.position))
            .slice(0, 15);

        // Generate report
        console.log('═'.repeat(80));
        console.log('📈 CATEGORY 1: QUICK WINS (Currently Page 2-3)');
        console.log('═'.repeat(80));
        console.log('These keywords are SO CLOSE to page 1! Small improvements = Big traffic boost\n');

        if (quickWins.length > 0) {
            quickWins.forEach((k, i) => {
                const avgPosition = Math.round(k.position);
                const ctr = (k.ctr * 100).toFixed(2);
                console.log(`${i + 1}. "${k.keys[0]}"`);
                console.log(`   Position: #${avgPosition} | Impressions: ${k.impressions} | Clicks: ${k.clicks} | CTR: ${ctr}%`);
                console.log(`   💡 Action: Write 1 new article OR optimize existing content\n`);
            });
        } else {
            console.log('   No keywords found in this range yet. Keep publishing!\n');
        }

        console.log('═'.repeat(80));
        console.log('🎯 CATEGORY 2: CTR OPTIMIZATION (Low click rate)');
        console.log('═'.repeat(80));
        console.log('High impressions but few clicks = Improve titles & meta descriptions\n');

        if (ctrOpportunities.length > 0) {
            ctrOpportunities.forEach((k, i) => {
                const avgPosition = Math.round(k.position);
                const ctr = (k.ctr * 100).toFixed(2);
                const potentialClicks = Math.round(k.impressions * 0.05);
                const gain = potentialClicks - k.clicks;
                console.log(`${i + 1}. "${k.keys[0]}"`);
                console.log(`   Position: #${avgPosition} | Impressions: ${k.impressions} | Clicks: ${k.clicks} | CTR: ${ctr}%`);
                console.log(`   💡 Potential: +${gain} clicks/month with better title/description\n`);
            });
        } else {
            console.log('   Great CTR performance! No major CTR issues found.\n');
        }

        console.log('═'.repeat(80));
        console.log('⭐ CATEGORY 3: HIGH POTENTIAL (Page 1, untapped)');
        console.log('═'.repeat(80));
        console.log('Already on page 1 but underperforming = Update & promote content\n');

        if (highPotential.length > 0) {
            highPotential.forEach((k, i) => {
                const avgPosition = Math.round(k.position);
                const ctr = (k.ctr * 100).toFixed(2);
                console.log(`${i + 1}. "${k.keys[0]}"`);
                console.log(`   Position: #${avgPosition} | Impressions: ${k.impressions} | Clicks: ${k.clicks} | CTR: ${ctr}%`);
                console.log(`   💡 Action: Add internal links, update content, promote on social\n`);
            });
        } else {
            console.log('   No underperforming page 1 rankings found.\n');
        }

        // Export CSV for team
        const csvPath = path.join(__dirname, '../../keyword-opportunities.csv');
        const csvRows = [
            'Category,Keyword,Position,Impressions,Clicks,CTR,Action'
        ];

        quickWins.forEach(k => {
            csvRows.push(`Quick Win,"${k.keys[0]}",${Math.round(k.position)},${k.impressions},${k.clicks},${(k.ctr * 100).toFixed(2)}%,"Write new article"`);
        });

        ctrOpportunities.forEach(k => {
            csvRows.push(`CTR Optimization,"${k.keys[0]}",${Math.round(k.position)},${k.impressions},${k.clicks},${(k.ctr * 100).toFixed(2)}%,"Improve title/meta"`);
        });

        highPotential.forEach(k => {
            csvRows.push(`High Potential,"${k.keys[0]}",${Math.round(k.position)},${k.impressions},${k.clicks},${(k.ctr * 100).toFixed(2)}%,"Update & promote"`);
        });

        fs.writeFileSync(csvPath, csvRows.join('\n'));

        console.log('═'.repeat(80));
        console.log('📊 SUMMARY');
        console.log('═'.repeat(80));
        console.log(`Total opportunities found: ${quickWins.length + ctrOpportunities.length + highPotential.length}`);
        console.log(`  - Quick wins (page 2-3): ${quickWins.length}`);
        console.log(`  - CTR optimization: ${ctrOpportunities.length}`);
        console.log(`  - High potential (page 1): ${highPotential.length}`);
        console.log(`\n✅ Full report exported to: keyword-opportunities.csv\n`);

        // Next steps
        console.log('🎯 RECOMMENDED NEXT STEPS:');
        console.log('1. Pick 3-5 "Quick Win" keywords');
        console.log('2. Create content briefs (run: node scripts/seo/generate-content-brief.js)');
        console.log('3. Have editorial team write articles');
        console.log('4. Track improvements weekly\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

findOpportunities();
