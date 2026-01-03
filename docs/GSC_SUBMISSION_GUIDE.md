# Google Search Console Submission Guide
## Executive Salary Pages - Priority Indexing

**Created:** January 3, 2026
**Purpose:** Submit 11 executive salary pages for priority indexing in Google Search

---

## Prerequisites

✅ All changes pushed to production (csuitemagazine.global)
✅ Pages are live and accessible
✅ Sitemap.xml includes all URLs
✅ Google Search Console access

---

## URLs to Submit (11 Total)

### Hub Page (Priority 1)
- https://csuitemagazine.global/executive-salaries

### Individual Executive Pages (Priority 2-11)
1. https://csuitemagazine.global/executive-salaries/satya-nadella
2. https://csuitemagazine.global/executive-salaries/tim-cook
3. https://csuitemagazine.global/executive-salaries/bob-iger
4. https://csuitemagazine.global/executive-salaries/andy-jassy
5. https://csuitemagazine.global/executive-salaries/jamie-dimon
6. https://csuitemagazine.global/executive-salaries/brian-moynihan
7. https://csuitemagazine.global/executive-salaries/jensen-huang
8. https://csuitemagazine.global/executive-salaries/lisa-su
9. https://csuitemagazine.global/executive-salaries/mary-barra
10. https://csuitemagazine.global/executive-salaries/sundar-pichai

---

## METHOD 1: URL Inspection Tool (RECOMMENDED - Fast Indexing)

**Best for:** Priority pages that need immediate indexing

### Steps:

1. **Open Google Search Console**
   - Go to: https://search.google.com/search-console
   - Select property: `csuitemagazine.global`

2. **Use URL Inspection Tool**
   - Click the search bar at the top
   - Paste the first URL: `https://csuitemagazine.global/executive-salaries`
   - Press Enter

3. **Request Indexing**
   - If page is not indexed: Click "REQUEST INDEXING"
   - If page is indexed: Great! Move to next URL
   - Wait for confirmation (takes 1-2 minutes per URL)

4. **Repeat for All 11 URLs**
   - Start with hub page (highest priority)
   - Then submit all 10 individual executive pages
   - Track which URLs have been submitted

### Expected Timeline:
- **Immediate:** Google crawler queued
- **1-24 hours:** Most pages indexed
- **24-48 hours:** All pages should appear in search

---

## METHOD 2: Sitemap Submission (BULK - Slower)

**Best for:** Bulk submission of all pages at once

### Steps:

1. **Verify Sitemap Accessibility**
   - Visit: https://csuitemagazine.global/sitemap.xml
   - Confirm it loads and includes executive-salaries URLs
   - Look for lines like:
     ```xml
     <url>
       <loc>https://csuitemagazine.global/executive-salaries</loc>
       <priority>0.95</priority>
     </url>
     ```

2. **Submit Sitemap to GSC**
   - Open Google Search Console
   - Navigate to: **Sitemaps** (left sidebar)
   - Enter sitemap URL: `sitemap.xml`
   - Click "SUBMIT"

3. **Monitor Status**
   - Check "Sitemaps" section regularly
   - Look for "Success" status
   - View "Discovered" count (should include 11 new URLs)

### Expected Timeline:
- **1-3 days:** Google discovers URLs
- **3-7 days:** Pages start getting indexed
- **1-2 weeks:** Full indexing complete

---

## METHOD 3: Internal Linking (PASSIVE - Slowest)

**Automatic discovery through existing links**

✅ **Already Done:**
- Hub page linked from homepage widget
- Hub page linked from footer navigation
- Individual pages linked from hub page
- Individual pages linked from sitemap.xml

Google will naturally discover these through crawling, but this takes longer (1-4 weeks).

---

## Tracking & Monitoring

### Check Indexing Status

**Option A: Site Command**
```
site:csuitemagazine.global/executive-salaries
```
- Paste into Google search
- See how many salary pages are indexed

**Option B: GSC Coverage Report**
1. Go to: **Coverage** (left sidebar)
2. Filter by: `/executive-salaries`
3. Check "Valid" pages count (should reach 11)

### Monitor Performance

**Location:** Search Console → Performance

**Key Metrics to Track:**
- **Impressions:** How often pages appear in search
- **Clicks:** How many people click through
- **Average Position:** Ranking in search results
- **Top Queries:** What keywords drive traffic

**Expected Keywords:**
- "[Executive name] salary"
- "[Executive name] compensation"
- "[Company] CEO pay"
- "Highest paid CEOs 2024"
- "Executive compensation data"

---

## Post-Submission Checklist

### Week 1:
- [ ] All 11 URLs submitted via URL Inspection
- [ ] Check indexing status daily
- [ ] Verify pages appear in `site:` search
- [ ] Monitor Coverage report

### Week 2-4:
- [ ] Check Performance data starts showing
- [ ] Monitor impressions and clicks
- [ ] Track keyword rankings
- [ ] Analyze which executives get most traffic

### Ongoing:
- [ ] Update content monthly (keeps "lastModified" fresh)
- [ ] Add new executives as data becomes available
- [ ] Monitor for any crawl errors
- [ ] Check mobile usability

---

## Troubleshooting

### "URL is not on Google"
- **Solution:** Click "REQUEST INDEXING" and wait 24-48 hours

### "Crawled - currently not indexed"
- **Reason:** Low priority or duplicate content
- **Solution:** Improve content uniqueness, add more internal links

### "Blocked by robots.txt"
- **Check:** https://csuitemagazine.global/robots.txt
- **Verify:** `/executive-salaries` is not disallowed

### "Page with redirect"
- **Check:** URLs don't have trailing slashes
- **Use:** Exact URLs listed above

---

## Priority Recommendation

**⚡ URGENT - Submit These First:**
1. /executive-salaries (hub page)
2. /executive-salaries/satya-nadella (highest paid)
3. /executive-salaries/tim-cook (Apple CEO, high search volume)

**📊 HIGH PRIORITY:**
4. /executive-salaries/sundar-pichai (Google CEO)
5. /executive-salaries/jensen-huang (NVIDIA CEO, trending)

**✅ STANDARD:**
6-11. Remaining executive pages

---

## Success Metrics (30 Days)

**Target Goals:**
- ✅ All 11 pages indexed
- ✅ 100+ impressions/day from salary-related queries
- ✅ 10+ clicks/day to executive salary pages
- ✅ Top 10 rankings for "[Name] salary" queries

**Tools:**
- Google Search Console (primary)
- Google Analytics (traffic source analysis)
- SEMrush/Ahrefs (keyword tracking - optional)

---

## Notes

- **Do NOT** submit same URL multiple times in 24 hours
- **Wait** at least 1 week before resubmitting
- **Monitor** "Coverage" report for errors
- **Update** content regularly to maintain freshness
- **Internal links** help discovery and ranking

---

**Questions?** Check GSC Help Center: https://support.google.com/webmasters
