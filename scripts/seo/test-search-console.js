#!/usr/bin/env node
/**
 * Test Google Search Console API Connection
 * 
 * This script verifies that the service account has proper access
 * to Search Console data and can retrieve basic metrics.
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://csuitemagazine.global';
const CREDENTIALS_PATH = path.join(__dirname, '../../.credentials/google-search-console.json');

async function testConnection() {
    console.log('🔍 Testing Google Search Console API connection...\n');

    try {
        // Load credentials
        if (!fs.existsSync(CREDENTIALS_PATH)) {
            throw new Error(`Credentials file not found at: ${CREDENTIALS_PATH}`);
        }

        const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
        console.log('✅ Credentials loaded');

        // Create auth client
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
        });

        const authClient = await auth.getClient();
        const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });
        console.log('✅ Auth client created');

        // List sites
        console.log('\n📊 Fetching Search Console sites...');
        const sites = await searchconsole.sites.list();

        if (sites.data.siteEntry) {
            console.log('✅ Sites found:');
            sites.data.siteEntry.forEach(site => {
                console.log(`   - ${site.siteUrl} (${site.permissionLevel})`);
            });
        }

        // Test query for last 7 days
        console.log('\n📈 Testing data retrieval (last 7 days)...');
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const response = await searchconsole.searchanalytics.query({
            siteUrl: SITE_URL,
            requestBody: {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                dimensions: ['query'],
                rowLimit: 5,
            },
        });

        if (response.data.rows) {
            console.log('✅ Data retrieved successfully!');
            console.log(`\nTop 5 queries (last 7 days):`);
            response.data.rows.forEach((row, i) => {
                console.log(`   ${i + 1}. "${row.keys[0]}" - ${row.clicks} clicks, ${row.impressions} impressions`);
            });
        } else {
            console.log('⚠️  No data found (this is normal for new sites)');
        }

        console.log('\n🎉 Connection test SUCCESSFUL!');
        console.log('\n✅ Your Google Search Console API is ready to use!');

    } catch (error) {
        console.error('\n❌ Connection test FAILED!');
        console.error('Error:', error.message);

        if (error.message.includes('403')) {
            console.error('\n💡 Tip: Make sure you added the service account to Search Console with Full permissions.');
        }

        process.exit(1);
    }
}

testConnection();
