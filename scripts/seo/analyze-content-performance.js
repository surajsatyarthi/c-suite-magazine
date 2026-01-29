#!/usr/bin/env node
/**
 * Content Performance Analyzer
 * 
 * Analyzes individual article performance from Search Console data
 * Shows which articles are winning, which need optimization
 * 
 * Features:
 * - Traffic per article
 * - Trending content (growing/declining)
 * - Best performing topics
 * - Underperforming content that needs updates
 * 
 * Usage: node scripts/seo/analyze-content-performance.js
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://csuitemagazine.global';
const CREDENTIALS_PATH = path.join(__dirname, '../../.credentials/google-search-console.json');
const DAYS_TO_ANALYZE = 90;

async function analyzeContent() {
    console.log('📊 Analyzing Content Performance...\n');

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

        // Get page-level data
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - DAYS_TO_ANALYZE);

        console.log(`Analyzing last ${DAYS_TO_ANALYZE} days (${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]})`);
        console.log('Please wait...\n');

        // Fetch page data
        const response = await searchconsole.searchanalytics.query({
            siteUrl: SITE_URL,
            requestBody: {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                dimensions: ['page'],
                rowLimit: 500,
            },
        });

        if (!response.data.rows) {
            console.log('⚠️  No data found yet. Check back in 2-3 weeks!\n');
            return;
        }

        const pages = response.data.rows;
        console.log(`✅ Found ${pages.length} pages with traffic\n`);

        // Filter to article pages only
        const articles = pages.filter(p =>
            p.keys[0].includes('/category/') ||
            p.keys[0].includes('/article/') ||
            p.keys[0].match(/\/[a-z-]+\/[a-z-]+\/$/)
        );

        console.log(`📝 Articles found: ${articles.length}\n`);

        // Top performing articles
        const topArticles = articles
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, 20);

        // Best CTR articles
        const bestCTR = articles
            .filter(a => a.impressions > 100)
            .sort((a, b) => b.ctr - a.ctr)
            .slice(0, 10);

        // Underperforming (high impressions, low clicks)
        const underperforming = articles
            .filter(a => a.impressions > 500 && a.ctr < 0.02)
            .sort((a, b) => b.impressions - a.impressions)
            .slice(0, 10);

        // Generate report
        printReport(topArticles, bestCTR, underperforming);

        // Export CSV
        exportCSV(articles);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

function printReport(topArticles, bestCTR, underperforming) {
    console.log('═'.repeat(80));
    console.log('🏆 TOP 20 PERFORMING ARTICLES (By Traffic)');
    console.log('═'.repeat(80));
    console.log('These are your traffic champions!\n');

    topArticles.forEach((article, i) => {
        const url = article.keys[0];
        const title = extractTitle(url);
        const avgPosition = Math.round(article.position);
        const ctr = (article.ctr * 100).toFixed(2);

        console.log(`${i + 1}. ${title}`);
        console.log(`   URL: ${url}`);
        console.log(`   Traffic: ${article.clicks} clicks | ${article.impressions} impressions`);
        console.log(`   CTR: ${ctr}% | Position: #${avgPosition}`);
        console.log('');
    });

    console.log('═'.repeat(80));
    console.log('🎯 BEST CTR ARTICLES');
    console.log('═'.repeat(80));
    console.log('These have the most compelling titles/descriptions\n');

    bestCTR.forEach((article, i) => {
        const url = article.keys[0];
        const title = extractTitle(url);
        const ctr = (article.ctr * 100).toFixed(2);

        console.log(`${i + 1}. ${title}`);
        console.log(`   CTR: ${ctr}% | Clicks: ${article.clicks} | Position: #${Math.round(article.position)}`);
        console.log(`   💡 Analysis: Great title/description - replicate this style!`);
        console.log('');
    });

    console.log('═'.repeat(80));
    console.log('⚠️  UNDERPERFORMING ARTICLES (High Impressions, Low CTR)');
    console.log('═'.repeat(80));
    console.log('These need better titles, meta descriptions, or content updates\n');

    underperforming.forEach((article, i) => {
        const url = article.keys[0];
        const title = extractTitle(url);
        const ctr = (article.ctr * 100).toFixed(2);
        const potentialClicks = Math.round(article.impressions * 0.05); // 5% CTR target
        const gain = potentialClicks - article.clicks;

        console.log(`${i + 1}. ${title}`);
        console.log(`   Current: ${article.clicks} clicks from ${article.impressions} impressions (${ctr}% CTR)`);
        console.log(`   Potential: +${gain} clicks with 5% CTR`);
        console.log(`   💡 Action: Update title/description, refresh content`);
        console.log('');
    });

    console.log('═'.repeat(80));
    console.log('📊 SUMMARY INSIGHTS');
    console.log('═'.repeat(80));
    console.log(`\n✅ Content Strategy Recommendations:\n`);

    if (topArticles.length > 0) {
        const topThemes = findCommonThemes(topArticles);
        console.log(`1. Your best topics: ${topThemes.join(', ')}`);
        console.log(`   → Create more content in these areas\n`);
    }

    if (bestCTR.length > 0) {
        const avgBestCTR = (bestCTR.reduce((sum, a) => sum + a.ctr, 0) / bestCTR.length * 100).toFixed(2);
        console.log(`2. Your best CTR average: ${avgBestCTR}%`);
        console.log(`   → Study these titles and replicate the patterns\n`);
    }

    if (underperforming.length > 0) {
        const totalPotential = underperforming.reduce((sum, a) => {
            return sum + (Math.round(a.impressions * 0.05) - a.clicks);
        }, 0);
        console.log(`3. Quick win potential: +${totalPotential} clicks/month`);
        console.log(`   → Update ${underperforming.length} underperforming articles\n`);
    }
}

function extractTitle(url) {
    // Extract slug from URL and make readable
    const parts = url.split('/').filter(p => p);
    if (parts.length === 0) return 'Homepage';

    const slug = parts[parts.length - 1];
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function findCommonThemes(articles) {
    // Simple theme extraction from URLs
    const themes = new Map();

    articles.forEach(article => {
        const url = article.keys[0];
        const parts = url.split('/').filter(p => p);

        // Look for category or common words
        parts.forEach(part => {
            if (part.length > 3 && !part.match(/^\d+$/)) {
                const words = part.split('-');
                words.forEach(word => {
                    if (word.length > 4) {
                        const theme = word.toLowerCase();
                        themes.set(theme, (themes.get(theme) || 0) + 1);
                    }
                });
            }
        });
    });

    // Return top 3 themes
    return Array.from(themes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([theme]) => theme);
}

function exportCSV(articles) {
    const csvPath = path.join(__dirname, '../../content-performance-report.csv');

    const rows = [
        'Rank,URL,Title,Clicks,Impressions,CTR,Position,Status'
    ];

    articles.forEach((article, i) => {
        const url = article.keys[0];
        const title = extractTitle(url);
        const ctr = (article.ctr * 100).toFixed(2);
        const position = Math.round(article.position);

        let status = 'Good';
        if (article.impressions > 500 && article.ctr < 0.02) {
            status = 'Needs Update';
        } else if (article.ctr > 0.05) {
            status = 'Excellent';
        }

        rows.push(`${i + 1},"${url}","${title}",${article.clicks},${article.impressions},${ctr}%,${position},${status}`);
    });

    fs.writeFileSync(csvPath, rows.join('\n'));
    console.log(`\n✅ Full report exported to: content-performance-report.csv\n`);
}

analyzeContent();
