#!/usr/bin/env node
/**
 * Competitor Keyword Gap Analyzer
 * 
 * Finds keywords your competitors rank for but you don't
 * Identifies content opportunities by analyzing Search Console data
 * 
 * Strategy:
 * - Looks at keywords where you appear on page 2-10
 * - Assumes top-ranking sites are your competitors
 * - Finds patterns in keywords you're missing
 * 
 * Usage: node scripts/seo/competitor-gap-analysis.js
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://csuitemagazine.global';
const CREDENTIALS_PATH = path.join(__dirname, '../../.credentials/google-search-console.json');

async function analyzeGaps() {
    console.log('🎯 Analyzing Competitor Keyword Gaps...\n');

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

        // Get keyword data
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);

        console.log('Fetching keyword data...\n');

        const response = await searchconsole.searchanalytics.query({
            siteUrl: SITE_URL,
            requestBody: {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                dimensions: ['query'],
                rowLimit: 2000,
            },
        });

        if (!response.data.rows) {
            console.log('⚠️  No data available yet. Check back in 2-3 weeks!\n');
            return;
        }

        const keywords = response.data.rows;
        console.log(`✅ Analyzing ${keywords.length} keywords\n`);

        // Analyze keyword gaps
        const gaps = analyzeKeywordGaps(keywords);

        // Generate report
        printGapReport(gaps);

        // Export CSV
        exportGapCSV(gaps);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

function analyzeKeywordGaps(keywords) {
    // Categorize keywords by performance
    const categories = {
        almostRanking: [], // Position 11-20 (page 2)
        farBehind: [], // Position 21-50 (page 3-5)
        longTail: [], // 4+ words, high opportunity
        branded: [], // Contains your brand/company terms
        commercial: [], // Contains buying intent keywords
    };

    keywords.forEach(k => {
        const keyword = k.keys[0].toLowerCase();
        const position = k.position;
        const wordCount = keyword.split(' ').length;

        // Almost ranking - easy competitors to beat
        if (position > 10 && position <= 20 && k.impressions > 50) {
            categories.almostRanking.push({
                keyword: k.keys[0],
                position: Math.round(position),
                impressions: k.impressions,
                clicks: k.clicks,
                ctr: k.ctr,
                gap: 'Page 2 - One push to page 1'
            });
        }

        // Far behind - bigger gap, but high volume
        if (position > 20 && position <= 50 && k.impressions > 100) {
            categories.farBehind.push({
                keyword: k.keys[0],
                position: Math.round(position),
                impressions: k.impressions,
                clicks: k.clicks,
                gap: 'Pages 3-5 - Need comprehensive content'
            });
        }

        // Long-tail keywords - easier to rank
        if (wordCount >= 4 && position > 10 && k.impressions > 20) {
            categories.longTail.push({
                keyword: k.keys[0],
                position: Math.round(position),
                impressions: k.impressions,
                clicks: k.clicks,
                gap: 'Long-tail - Lower competition'
            });
        }

        // Commercial intent keywords
        const commercialTerms = ['how to', 'best', 'top', 'guide', 'tips', 'strategies', 'tools', 'software'];
        if (commercialTerms.some(term => keyword.includes(term)) && position > 10) {
            categories.commercial.push({
                keyword: k.keys[0],
                position: Math.round(position),
                impressions: k.impressions,
                clicks: k.clicks,
                gap: 'Commercial intent - High value'
            });
        }
    });

    // Sort each category by impressions (highest opportunity first)
    Object.keys(categories).forEach(cat => {
        categories[cat].sort((a, b) => b.impressions - a.impressions);
    });

    return categories;
}

function printGapReport(gaps) {
    console.log('═'.repeat(80));
    console.log('🎯 COMPETITOR KEYWORD GAP ANALYSIS');
    console.log('═'.repeat(80));
    console.log('\nThese are keywords where competitors rank higher than you.\n');

    // Category 1: Almost Ranking
    console.log('─'.repeat(80));
    console.log('🥈 ALMOST RANKING (Page 2 - Positions 11-20)');
    console.log('─'.repeat(80));
    console.log('You\'re SO CLOSE! One good article can push these to page 1.\n');

    const topAlmost = gaps.almostRanking.slice(0, 15);
    if (topAlmost.length > 0) {
        topAlmost.forEach((item, i) => {
            console.log(`${i + 1}. "${item.keyword}"`);
            console.log(`   Current Position: #${item.position} | Impressions: ${item.impressions}`);
            console.log(`   Gap: ${item.gap}`);
            console.log(`   💡 Action: Create focused, comprehensive article`);
            console.log('');
        });
    } else {
        console.log('   No keywords found in this range.\n');
    }

    // Category 2: Far Behind
    console.log('─'.repeat(80));
    console.log('📊 FAR BEHIND (Pages 3-5 - Positions 21-50)');
    console.log('─'.repeat(80));
    console.log('High search volume but competitors dominate. Requires major content effort.\n');

    const topFar = gaps.farBehind.slice(0, 10);
    if (topFar.length > 0) {
        topFar.forEach((item, i) => {
            console.log(`${i + 1}. "${item.keyword}"`);
            console.log(`   Current Position: #${item.position} | Impressions: ${item.impressions}`);
            console.log(`   Gap: ${item.gap}`);
            console.log(`   💡 Action: Create pillar content + supporting articles`);
            console.log('');
        });
    } else {
        console.log('   No keywords found in this range.\n');
    }

    // Category 3: Long-Tail  
    console.log('─'.repeat(80));
    console.log('🎯 LONG-TAIL OPPORTUNITIES (4+ Words)');
    console.log('─'.repeat(80));
    console.log('Easier to rank, more specific user intent, great for quick wins.\n');

    const topLongTail = gaps.longTail.slice(0, 15);
    if (topLongTail.length > 0) {
        topLongTail.forEach((item, i) => {
            console.log(`${i + 1}. "${item.keyword}"`);
            console.log(`   Current Position: #${item.position} | Impressions: ${item.impressions}`);
            console.log(`   Gap: ${item.gap}`);
            console.log(`   💡 Action: Write targeted article addressing specific question`);
            console.log('');
        });
    } else {
        console.log('   No long-tail opportunities found.\n');
    }

    // Category 4: Commercial Intent
    console.log('─'.repeat(80));
    console.log('💰 COMMERCIAL INTENT KEYWORDS');
    console.log('─'.repeat(80));
    console.log('High-value keywords with buying/learning intent. Great for conversions.\n');

    const topCommercial = gaps.commercial.slice(0, 10);
    if (topCommercial.length > 0) {
        topCommercial.forEach((item, i) => {
            console.log(`${i + 1}. "${item.keyword}"`);
            console.log(`   Current Position: #${item.position} | Impressions: ${item.impressions}`);
            console.log(`   Gap: ${item.gap}`);
            console.log(`   💡 Action: Create comprehensive guide with clear CTAs`);
            console.log('');
        });
    } else {
        console.log('   No commercial keywords found.\n');
    }

    // Summary
    console.log('═'.repeat(80));
    console.log('📊 SUMMARY & RECOMMENDATIONS');
    console.log('═'.repeat(80));
    console.log('');
    console.log(`Total Gap Opportunities: ${gaps.almostRanking.length +
        gaps.farBehind.length +
        gaps.longTail.length +
        gaps.commercial.length
        }`);
    console.log('');
    console.log('🎯 PRIORITY ACTION PLAN:');
    console.log('');
    console.log('Week 1-2: Target "Almost Ranking" keywords');
    console.log(`  - Pick top 5 from positions 11-20`);
    console.log(`  - Create focused, SEO-optimized articles`);
    console.log(`  - Expected: Move to page 1 within month`);
    console.log('');
    console.log('Week 3-4: Target "Long-Tail" keywords');
    console.log(`  - Pick top 10 specific, 4+ word keywords`);
    console.log(`  - Easier to rank, lower competition`);
    console.log(`  - Expected: Page 1 positions quickly`);
    console.log('');
    console.log('Month 2: Target "Commercial Intent" keywords');
    console.log(`  - High-value for conversions`);
    console.log(`  - Comprehensive guides`);
    console.log(`  - Expected: Quality traffic + leads`);
    console.log('');
    console.log('Month 3+: Target "Far Behind" keywords');
    console.log(`  - Create pillar content`);
    console.log(`  - Multiple supporting articles`);
    console.log(`  - Expected: 3-6 months to rank`);
    console.log('');
}

function exportGapCSV(gaps) {
    const csvPath = path.join(__dirname, '../../competitor-gap-analysis.csv');

    const rows = [
        'Category,Keyword,Current Position,Impressions,Clicks,Gap Analysis,Priority'
    ];

    // Export all categories
    const addRows = (category, categoryName, priority) => {
        category.forEach(item => {
            rows.push(`"${categoryName}","${item.keyword}",${item.position},${item.impressions},${item.clicks},"${item.gap}",${priority}`);
        });
    };

    addRows(gaps.almostRanking, 'Almost Ranking', 'High');
    addRows(gaps.longTail, 'Long-Tail', 'High');
    addRows(gaps.commercial, 'Commercial Intent', 'Medium');
    addRows(gaps.farBehind, 'Far Behind', 'Low');

    fs.writeFileSync(csvPath, rows.join('\n'));
    console.log(`✅ Full gap analysis exported to: competitor-gap-analysis.csv\n`);
}

analyzeGaps();
