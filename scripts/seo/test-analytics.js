#!/usr/bin/env node
/**
 * Google Analytics 4 Connection Tester
 * 
 * Tests connection to Google Analytics Data API
 * Shows sample metrics to verify everything works
 * 
 * Setup required:
 * 1. Enable Analytics Data API in Google Cloud
 * 2. Add GA4_PROPERTY_ID to .env.local
 * 3. Grant service account Viewer access to GA4
 * 
 * Usage: node scripts/seo/test-analytics.js
 */

const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const CREDENTIALS_PATH = path.join(__dirname, '../../.credentials/google-search-console.json');

async function testAnalytics() {
    console.log('🔍 Testing Google Analytics 4 API connection...\n');

    try {
        // Check for property ID
        const propertyId = process.env.GA4_PROPERTY_ID;
        if (!propertyId) {
            console.error('❌ GA4_PROPERTY_ID not found in .env.local');
            console.error('\nAdd this line to .env.local:');
            console.error('  GA4_PROPERTY_ID=your-property-id\n');
            console.error('Find your property ID in GA4 Admin > Property Settings\n');
            process.exit(1);
        }

        console.log(`✅ Property ID found: ${propertyId}`);

        // Load credentials
        if (!fs.existsSync(CREDENTIALS_PATH)) {
            throw new Error(`Credentials file not found at: ${CREDENTIALS_PATH}`);
        }

        const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
        console.log('✅ Credentials loaded');

        // Create analytics client
        const analyticsDataClient = new BetaAnalyticsDataClient({
            credentials,
        });
        console.log('✅ Analytics client created');

        // Test query: Last 7 days summary
        console.log('\n📊 Fetching last 7 days data...');

        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [
                {
                    startDate: '7daysAgo',
                    endDate: 'yesterday',
                },
            ],
            dimensions: [
                {
                    name: 'date',
                },
            ],
            metrics: [
                {
                    name: 'activeUsers',
                },
                {
                    name: 'sessions',
                },
                {
                    name: 'screenPageViews',
                },
                {
                    name: 'averageSessionDuration',
                },
            ],
        });

        if (response.rows && response.rows.length > 0) {
            console.log('✅ Data retrieved successfully!\n');

            // Calculate totals
            let totalUsers = 0;
            let totalSessions = 0;
            let totalPageviews = 0;
            let totalDuration = 0;

            response.rows.forEach(row => {
                totalUsers += parseInt(row.metricValues[0].value);
                totalSessions += parseInt(row.metricValues[1].value);
                totalPageviews += parseInt(row.metricValues[2].value);
                totalDuration += parseFloat(row.metricValues[3].value);
            });

            const avgDuration = totalDuration / response.rows.length;

            console.log('📈 Last 7 Days Summary:');
            console.log(`   Users: ${totalUsers.toLocaleString()}`);
            console.log(`   Sessions: ${totalSessions.toLocaleString()}`);
            console.log(`   Pageviews: ${totalPageviews.toLocaleString()}`);
            console.log(`   Avg Session Duration: ${Math.round(avgDuration)}s`);
            console.log();

            console.log('📅 Daily Breakdown:');
            response.rows.forEach(row => {
                const date = row.dimensionValues[0].value;
                const users = parseInt(row.metricValues[0].value);
                const sessions = parseInt(row.metricValues[1].value);
                console.log(`   ${date}: ${users} users, ${sessions} sessions`);
            });

        } else {
            console.log('⚠️  No data found. This could mean:');
            console.log('   - GA4 property is new (needs a few days)');
            console.log('   - Wrong property ID');
            console.log('   - Site has no traffic yet\n');
        }

        console.log('\n🎉 Connection test SUCCESSFUL!');
        console.log('\n✅ Your Google Analytics API is ready to use!\n');

    } catch (error) {
        console.error('\n❌ Connection test FAILED!');
        console.error('Error:', error.message);

        if (error.message.includes('403') || error.message.includes('PERMISSION_DENIED')) {
            console.error('\n💡 Tip: Grant the service account Viewer access in GA4:');
            console.error('   seo-automation@csuite-magazine-seo.iam.gserviceaccount.com\n');
        }

        if (error.message.includes('NOT_FOUND')) {
            console.error('\n💡 Tip: Check your GA4_PROPERTY_ID in .env.local');
            console.error('   Make sure it matches your GA4 property\n');
        }

        process.exit(1);
    }
}

testAnalytics();
