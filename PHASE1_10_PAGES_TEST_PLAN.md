# Phase 1: 10-Page Test Strategy

**Goal**: Create 10 executive salary pages, submit to Google, verify no penalties before scaling.

---

## 🎯 Test Strategy Overview

**Why 10 pages first?**
- Test Google's response to programmatic content
- Verify no duplicate content penalties
- Check indexing speed and quality
- Validate SEO metadata is working correctly
- Ensure no manual actions or penalties

---

## 📋 10 Executives to Import

### Selection Criteria:
1. **High search volume** - CEOs people actually search for
2. **Fortune 100 companies** - Well-known brands
3. **Recent compensation data** - 2023 fiscal year available
4. **Diverse industries** - Avoid appearing spammy in one sector

### Recommended 10 Executives:

| # | Executive | Company | Ticker | Industry | Why Selected |
|---|-----------|---------|--------|----------|--------------|
| 1 | **Tim Cook** | Apple Inc. | AAPL | Technology | ✅ Already imported |
| 2 | Satya Nadella | Microsoft | MSFT | Technology | High search volume |
| 3 | Andy Jassy | Amazon | AMZN | E-commerce | AWS CEO, major brand |
| 4 | Sundar Pichai | Alphabet (Google) | GOOGL | Technology | Google CEO, massive searches |
| 5 | Mary Barra | General Motors | GM | Automotive | Female CEO, ESG interest |
| 6 | Brian Moynihan | Bank of America | BAC | Financial Services | Banking sector |
| 7 | David Solomon | Goldman Sachs | GS | Financial Services | Investment banking |
| 8 | James Gorman | Morgan Stanley | MS | Financial Services | Another finance perspective |
| 9 | Doug McMillon | Walmart | WMT | Retail | Largest US employer |
| 10 | Jensen Huang | NVIDIA | NVDA | Technology/AI | AI hype, high interest |

**Industry Distribution**:
- Technology: 4 (Tim Cook, Satya, Sundar, Jensen)
- Financial Services: 3 (Brian, David, James)
- Retail: 1 (Doug)
- E-commerce: 1 (Andy)
- Automotive: 1 (Mary)

---

## 📊 Data Collection Process

### For Each Executive:

#### 1. SEC EDGAR Compensation Data
**Source**: https://www.sec.gov/cgi-bin/browse-edgar

**How to Find**:
1. Search company ticker (e.g., "MSFT")
2. Filter by "DEF 14A" (Proxy Statement)
3. Find most recent filing (2024 for FY2023 data)
4. Locate "Summary Compensation Table"

**Data to Extract**:
- Fiscal year (2023, 2022, 2021, 2020, 2019)
- Base salary
- Bonus
- Stock awards
- Option awards
- Non-equity incentive plan compensation
- Change in pension value
- All other compensation
- **Total compensation**
- Filing date
- Source URL

#### 2. Executive Bio Data
**Source**: Wikipedia + Wikidata

**Wikidata API**:
```
https://www.wikidata.org/wiki/Special:EntityData/{WIKIDATA_ID}.json
```

**Example Wikidata IDs**:
- Tim Cook: Q312129
- Satya Nadella: Q1305129
- Sundar Pichai: Q3068263

**Data to Extract**:
- Full name
- Birth year
- Education
- Current title
- Bio (200-300 words)
- Profile image URL

#### 3. Company Data
**Sources**: Yahoo Finance, Company websites

**Data to Extract**:
- Company name
- Ticker symbol
- Industry
- Sector
- Market cap (approximate, updated quarterly)
- Founded year
- Headquarters location
- Website URL
- Logo URL (use Clearbit: `https://logo.clearbit.com/{domain}`)

---

## 🛠️ Import Process

### Step 1: Prepare Data

Edit `scripts/data-import/import-executives.ts`:

```typescript
const EXECUTIVES_DATA = [
  {
    company: {
      name: 'Apple Inc.',
      ticker_symbol: 'AAPL',
      // ... (Tim Cook - already done)
    },
    executive: {
      full_name: 'Tim Cook',
      slug: 'tim-cook',
      // ... (already done)
    },
    compensation: [
      // 2023, 2022 data (already done)
    ]
  },
  {
    company: {
      name: 'Microsoft Corporation',
      ticker_symbol: 'MSFT',
      industry: 'Technology',
      sector: 'Information Technology',
      market_cap: 3100000000000, // $3.1T
      founded_year: 1975,
      headquarters: 'Redmond, Washington',
      website_url: 'https://www.microsoft.com',
      logo_url: 'https://logo.clearbit.com/microsoft.com'
    },
    executive: {
      full_name: 'Satya Nadella',
      slug: 'satya-nadella',
      current_title: 'Chairman and Chief Executive Officer',
      bio: 'Satya Narayana Nadella is an Indian-American business executive...',
      wikidata_id: 'Q1305129',
      linkedin_url: 'https://www.linkedin.com/in/satyanadella',
      birth_year: 1967,
      education: 'MBA from University of Chicago, MS in Computer Science from University of Wisconsin',
      profile_image_url: 'https://upload.wikimedia.org/wikipedia/commons/...'
    },
    compensation: [
      {
        fiscal_year: 2023,
        base_salary: 2500000,
        bonus: 0,
        stock_awards: 42000000,
        option_awards: 0,
        non_equity_incentive: 5200000,
        change_in_pension: 0,
        all_other_compensation: 300000,
        total_compensation: 48300000, // Example - get real data
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000789019&type=DEF%2014A',
        filing_date: '2023-10-18'
      },
      {
        fiscal_year: 2022,
        // ... get 2022 data
      }
    ]
  },
  // ... Add remaining 8 executives
]
```

### Step 2: Run Import

```bash
cd /Users/surajsatyarthi/Desktop/Magazine/ceo-magazine

POSTGRES_URL="postgresql://neondb_owner:npg_z7TghmwI6oyV@ep-polished-sound-a4yq82lt-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require" \
npx tsx scripts/data-import/import-executives.ts
```

**Expected Output**:
```
🚀 Starting executive data import...

📊 Processing: Tim Cook (Apple Inc.)
   ℹ️  Company already exists: Apple Inc.
   ℹ️  Executive already exists: Tim Cook
   ⚠️  Compensation record exists: 2023
   ⚠️  Compensation record exists: 2022

📊 Processing: Satya Nadella (Microsoft Corporation)
   ✅ Company created: Microsoft Corporation
   ✅ Executive created: Satya Nadella
   ✅ Compensation added: 2023 ($48.3M)
   ✅ Compensation added: 2022 ($XX.XM)

... (repeat for all 10)

═══════════════════════════════════════════════
📈 Import Summary:
═══════════════════════════════════════════════
✅ Companies created:         9
✅ Executives created:        9
✅ Compensation records:      18
❌ Errors encountered:        0
═══════════════════════════════════════════════
```

### Step 3: Verify Data

```bash
# Check database
curl http://localhost:3000/api/test-supabase

# Test each page locally
curl http://localhost:3000/executives/tim-cook
curl http://localhost:3000/executives/satya-nadella
curl http://localhost:3000/executives/sundar-pichai
# ... etc
```

### Step 4: Deploy to Production

```bash
git add scripts/data-import/import-executives.ts
git commit -m "Add 9 executives for Phase 1 testing (10 total with Tim Cook)"
git push
```

---

## 🔍 Google Submission & Monitoring

### Step 1: Submit to Google Search Console

**Method 1: Submit Sitemap** (Preferred)

First, update sitemap to include executive pages:

Create `app/executives/sitemap.ts`:
```typescript
import { MetadataRoute } from 'next'
import { getExecutiveSlugs } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getExecutiveSlugs(1000)

  return slugs.map((slug) => ({
    url: `https://csuitemagazine.global/executives/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))
}
```

Then submit sitemap:
1. Go to: https://search.google.com/search-console
2. Select property: csuitemagazine.global
3. **Sitemaps** → Add new sitemap
4. Enter: `executives/sitemap.xml`
5. Click **Submit**

**Method 2: Request Indexing** (Manual, for urgent pages)

For each page:
1. Go to Google Search Console
2. Enter URL: `https://csuitemagazine.global/executives/tim-cook`
3. Click **Request Indexing**
4. Repeat for all 10 pages

### Step 2: Monitor Indexing Status

**Week 1-2**: Check daily
```
site:csuitemagazine.global/executives/
```

Track:
- How many pages indexed (0 → 10)
- How fast (days to index)
- Snippets shown in search results

### Step 3: Check for Penalties

**Manual Actions**:
1. Google Search Console → **Security & Manual Actions**
2. Check for:
   - Thin content warnings
   - Duplicate content issues
   - Spammy structured data

**Organic Traffic Drop**:
- Monitor overall site traffic in Google Analytics
- If traffic drops >20% after executive pages go live → **STOP SCALING**

**Search Result Quality**:
```
# Search for one of your pages
"Tim Cook salary"

# Check:
- Does your page appear?
- What position? (Ideally top 10)
- Is the snippet good?
- Any "duplicate content" warnings?
```

---

## ✅ Success Criteria (Before Scaling to 50-100)

### Green Lights (Proceed to Scale):
- ✅ All 10 pages indexed within 7 days
- ✅ No manual actions or penalties
- ✅ Pages appear in search for "{name} salary" queries
- ✅ No overall traffic drop (site-wide)
- ✅ Good snippet quality (title + description showing correctly)
- ✅ At least 1 page ranking in top 20 for target keyword

### Yellow Lights (Investigate Before Scaling):
- ⚠️ Slow indexing (>14 days for all 10 pages)
- ⚠️ Poor snippets (Google rewriting titles)
- ⚠️ No rankings after 30 days
- ⚠️ Pages indexed but "noindexed" or showing warnings

### Red Lights (STOP - Do Not Scale):
- 🛑 Manual action received
- 🛑 Site-wide traffic drop >20%
- 🛑 Pages indexed but marked as "duplicate content"
- 🛑 "Thin content" warnings
- 🛑 Penalty or deindexing

---

## 📈 What to Track (Days 1-30)

### Google Search Console:
1. **Coverage** → Check "Valid" pages count increases by 10
2. **Performance** → Filter by URL contains "/executives/"
   - Impressions (how often shown in search)
   - Clicks
   - Average position
   - CTR (click-through rate)

### Google Analytics:
1. **Behavior** → Site Content → All Pages
   - Filter: `/executives/`
   - Track pageviews, bounce rate, avg. time on page

2. **Acquisition** → All Traffic → Channels
   - Filter: Landing Page contains `/executives/`
   - Check "Organic Search" traffic specifically

### Manual Checks:
```
Week 1: Check indexing status
Week 2: Check for any warnings/penalties
Week 3: Check rankings for target keywords
Week 4: Analyze traffic data, decide on scaling
```

---

## 🚀 If All Green Lights → Scale to 50-100

**Phase 2 Plan** (After 30-day test):
- Add 40 more executives (total 50)
- Monitor for another 14 days
- If still no issues → scale to 100
- Then 250, 500, 1000 (gradual rollout)

**Gradual Rollout Schedule**:
- Week 1-4: 10 pages (testing)
- Week 5-6: +40 pages (50 total)
- Week 7-8: +50 pages (100 total)
- Week 9-12: +150 pages (250 total)
- Month 4-6: +250 pages (500 total)
- Month 7-12: +500 pages (1000 total)

---

## 🎯 Expected Results (Optimistic Scenario)

### After 30 Days:
- **Indexed**: 10/10 pages
- **Impressions**: 500-2,000/month (combined)
- **Clicks**: 20-100/month
- **Rankings**: 3-5 pages in top 20 for long-tail keywords

### After 90 Days (if scaled to 100):
- **Indexed**: 95-100/100 pages
- **Impressions**: 10,000-50,000/month
- **Clicks**: 500-2,000/month
- **Rankings**: 20-30 pages in top 10

### After 6 Months (if scaled to 500):
- **Indexed**: 450-500/500 pages
- **Impressions**: 100,000-300,000/month
- **Clicks**: 5,000-15,000/month
- **Revenue Impact**: Significant traffic growth

---

## 📝 Current Status

- ✅ Tim Cook page created and imported
- ⏳ Production deployment in progress
- 📋 Next: Collect data for 9 more executives
- 🎯 Target: Complete 10-page import by end of week

**Live Page** (once deployment completes):
https://csuitemagazine.global/executives/tim-cook

**Test API**:
https://csuitemagazine.global/api/test-supabase

---

## 💡 Pro Tips

1. **Diversify anchor text** - Don't make all titles exactly "{Name} Salary"
   - Variations: "compensation", "pay", "earnings", "income"

2. **Add unique content** - Consider adding:
   - Executive career timeline
   - Notable achievements section
   - Comparison to industry peers

3. **Internal linking** - Link between executive pages:
   - "See also: Other Technology CEOs"
   - "Compare: Apple vs Microsoft CEO compensation"

4. **Monitor competitors** - Check who else ranks for these keywords
   - Salary.com, Payscale, Equilar, etc.
   - Study their content structure

5. **Quality over quantity** - Better to have 10 perfect pages than 100 mediocre ones

---

## 🎉 Ready to Begin!

**Next Action**: Collect SEC compensation data for 9 executives and add to import script.

Would you like me to start collecting this data now, or do you want to review/modify the 10-executive list first?
