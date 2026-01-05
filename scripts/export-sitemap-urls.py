#!/usr/bin/env python3
"""
Extract all URLs from sitemap and create a prioritized CSV for manual indexing
"""
import requests
import xml.etree.ElementTree as ET
import csv

# Fetch sitemap
print("🔍 Fetching sitemap...")
response = requests.get('https://csuitemagazine.global/sitemap.xml')
response.raise_for_status()

# Parse XML
print("📄 Parsing XML...")
root = ET.fromstring(response.content)

# Extract URLs with namespace
namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls = []

for url_elem in root.findall('ns:url', namespace):
    loc = url_elem.find('ns:loc', namespace)
    if loc is not None:
        url = loc.text

        # Determine priority and category
        if url == 'https://csuitemagazine.global/':
            priority = 'HIGH'
            category = 'Homepage'
        elif '/executive-salaries' in url and url.count('/') == 4:  # Individual salary pages
            priority = 'HIGH'
            category = 'CEO Salary Page'
        elif '/executive-salaries' in url:  # Hub page
            priority = 'HIGH'
            category = 'Salaries Hub'
        elif '/cxo-interview/' in url:
            priority = 'HIGH'
            category = 'CXO Interview'
        elif url.endswith(('/about', '/contact')):
            priority = 'MEDIUM'
            category = 'Static Page'
        elif url.endswith(('/privacy', '/terms')):
            priority = 'LOW'
            category = 'Legal'
        elif '/category/' in url and url.count('/') == 4:  # Category landing pages
            priority = 'MEDIUM'
            category = 'Category Page'
        elif '/category/' in url:  # Articles
            priority = 'MEDIUM'
            category = 'Article'
        else:
            priority = 'LOW'
            category = 'Other'

        urls.append({
            'url': url,
            'priority': priority,
            'category': category
        })

# Sort by priority (HIGH first)
priority_order = {'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
urls.sort(key=lambda x: priority_order[x['priority']])

# Write to CSV
csv_file = 'sitemap-urls-for-indexing.csv'
print(f"💾 Writing {len(urls)} URLs to CSV...")

with open(csv_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['url', 'priority', 'category'])
    writer.writeheader()
    writer.writerows(urls)

# Print summary
print("\n" + "=" * 60)
print("📊 SUMMARY")
print("=" * 60)
high_count = sum(1 for u in urls if u['priority'] == 'HIGH')
medium_count = sum(1 for u in urls if u['priority'] == 'MEDIUM')
low_count = sum(1 for u in urls if u['priority'] == 'LOW')

print(f"Total URLs: {len(urls)}")
print(f"  HIGH priority:   {high_count} (do these first!)")
print(f"  MEDIUM priority: {medium_count}")
print(f"  LOW priority:    {low_count}")
print(f"\n✅ CSV saved to: {csv_file}")
print("\n📋 HOW TO USE:")
print("1. Open CSV file")
print("2. Go to: https://search.google.com/search-console")
print("3. For each URL, paste in search bar → Click 'REQUEST INDEXING'")
print("4. Start with HIGH priority URLs first")
print("=" * 60)
