#!/usr/bin/env python3
"""
Test Google Search Console API connection and fetch basic data
"""
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from datetime import datetime, timedelta

# Load credentials
CREDENTIALS_FILE = 'gsc-credentials.json'
SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']
SITE_URL = 'sc-domain:csuitemagazine.global'

print("🔐 Loading credentials...")
credentials = service_account.Credentials.from_service_account_file(
    CREDENTIALS_FILE, scopes=SCOPES)

print("🔗 Connecting to Google Search Console API...")
service = build('searchconsole', 'v1', credentials=credentials)

print("✅ Connection successful!\n")

# Test 1: List all sites
print("=" * 60)
print("TEST 1: Sites accessible by this service account")
print("=" * 60)
try:
    sites_list = service.sites().list().execute()
    if 'siteEntry' in sites_list:
        for site in sites_list['siteEntry']:
            print(f"✅ {site['siteUrl']} - Permission: {site['permissionLevel']}")
    else:
        print("⚠️  No sites found. Make sure service account is added to GSC.")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n")

# Test 2: Get sitemaps
print("=" * 60)
print("TEST 2: Sitemaps Status")
print("=" * 60)
try:
    sitemaps = service.sitemaps().list(siteUrl=SITE_URL).execute()
    if 'sitemap' in sitemaps:
        for sitemap in sitemaps['sitemap']:
            print(f"📄 {sitemap['path']}")
            print(f"   Last submitted: {sitemap.get('lastSubmitted', 'N/A')}")
            print(f"   Status: {sitemap.get('warnings', 0)} warnings, {sitemap.get('errors', 0)} errors")
            print(f"   Indexed: {sitemap.get('contents', [{}])[0].get('indexed', 'N/A') if sitemap.get('contents') else 'N/A'}")
    else:
        print("⚠️  No sitemaps found")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n")

# Test 3: Get search analytics (last 7 days)
print("=" * 60)
print("TEST 3: Search Performance (Last 7 Days)")
print("=" * 60)
try:
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=7)

    request = {
        'startDate': str(start_date),
        'endDate': str(end_date),
        'dimensions': ['page'],
        'rowLimit': 10
    }

    response = service.searchanalytics().query(
        siteUrl=SITE_URL, body=request).execute()

    if 'rows' in response:
        print(f"📊 Top 10 pages by clicks:\n")
        print(f"{'Clicks':<8} {'Impr.':<10} {'CTR':<8} {'Position':<10} Page")
        print("-" * 80)
        for row in response['rows']:
            page = row['keys'][0]
            clicks = row.get('clicks', 0)
            impressions = row.get('impressions', 0)
            ctr = row.get('ctr', 0) * 100
            position = row.get('position', 0)

            # Shorten URL for display
            page_short = page.replace('https://csuitemagazine.global', '')[:50]
            print(f"{clicks:<8} {impressions:<10} {ctr:<7.2f}% {position:<10.1f} {page_short}")

        # Summary
        total_clicks = sum(row.get('clicks', 0) for row in response['rows'])
        total_impr = sum(row.get('impressions', 0) for row in response['rows'])
        avg_ctr = (total_clicks / total_impr * 100) if total_impr > 0 else 0

        print("\n📈 Summary:")
        print(f"   Total clicks: {total_clicks}")
        print(f"   Total impressions: {total_impr}")
        print(f"   Average CTR: {avg_ctr:.2f}%")
    else:
        print("⚠️  No search analytics data available yet")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 60)
print("✅ GSC API TEST COMPLETE!")
print("=" * 60)
