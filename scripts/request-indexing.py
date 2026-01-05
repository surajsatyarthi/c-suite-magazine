#!/usr/bin/env python3
"""
Request Google indexing for top priority pages
"""
import json
import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build
import time

# Configuration
CREDENTIALS_FILE = 'gsc-credentials.json'
SCOPES = [
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/indexing'
]

# Load credentials
print("🔐 Loading credentials...")
credentials = service_account.Credentials.from_service_account_file(
    CREDENTIALS_FILE, scopes=SCOPES)

# Priority pages to index
PRIORITY_PAGES = [
    'https://csuitemagazine.global/',
    'https://csuitemagazine.global/executive-salaries',
    'https://csuitemagazine.global/about',

    # CEO Salary pages (high traffic potential)
    'https://csuitemagazine.global/executive-salaries/tim-cook',
    'https://csuitemagazine.global/executive-salaries/elon-musk',
    'https://csuitemagazine.global/executive-salaries/satya-nadella',
    'https://csuitemagazine.global/executive-salaries/sundar-pichai',
    'https://csuitemagazine.global/executive-salaries/jensen-huang',
    'https://csuitemagazine.global/executive-salaries/mark-zuckerberg',
    'https://csuitemagazine.global/executive-salaries/andy-jassy',

    # Top CXO interviews (from sitemap)
    'https://csuitemagazine.global/category/cxo-interview/rich-stinson-visionary-leader-powering-america-s-electrification-future',
    'https://csuitemagazine.global/category/cxo-interview/olga-denysiuk',
    'https://csuitemagazine.global/category/cxo-interview/pankaj-bansal',
    'https://csuitemagazine.global/category/cxo-interview/dean-fealk',
    'https://csuitemagazine.global/category/cxo-interview/erin-krueger',
]

print(f"📋 Requesting indexing for {len(PRIORITY_PAGES)} priority pages...\n")

# Build Indexing API service
indexing_service = build('indexing', 'v3', credentials=credentials)

success_count = 0
failed_count = 0
failed_pages = []

for i, url in enumerate(PRIORITY_PAGES, 1):
    print(f"[{i}/{len(PRIORITY_PAGES)}] Requesting: {url}")

    try:
        request_body = {
            'url': url,
            'type': 'URL_UPDATED'
        }

        response = indexing_service.urlNotifications().publish(
            body=request_body).execute()

        print(f"    ✅ Success - Notification sent")
        success_count += 1

        # Rate limiting - be nice to Google
        time.sleep(0.5)

    except Exception as e:
        error_msg = str(e)
        print(f"    ❌ Failed - {error_msg}")
        failed_count += 1
        failed_pages.append((url, error_msg))

print("\n" + "=" * 60)
print("📊 SUMMARY")
print("=" * 60)
print(f"✅ Success: {success_count}")
print(f"❌ Failed: {failed_count}")

if failed_pages:
    print("\n⚠️  Failed pages:")
    for url, error in failed_pages:
        # Shorten URL for display
        short_url = url.replace('https://csuitemagazine.global', '')
        print(f"   {short_url}")
        print(f"   Error: {error[:100]}")

if success_count > 0:
    print("\n✨ Indexing requests submitted!")
    print("📅 Google typically processes these within 1-3 days")
    print("🔍 Check GSC URL Inspection tool to monitor progress")

print("=" * 60)
