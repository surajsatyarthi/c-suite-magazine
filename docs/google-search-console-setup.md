# Google Search Console Setup Guide

**Time:** 10 minutes | **Result:** Your site indexed by Google

---

## Step 1: Access Search Console

1. Go to https://search.google.com/search-console
2. Sign in with your Google account
3. Click **"Add Property"**
4. Choose **"URL prefix"** (not Domain)
5. Enter: `https://csuitemagazine.global`
6. Click **"Continue"**

---

## Step 2: Verify Ownership

**Method: HTML Meta Tag** (Easiest)

1. Google shows you a meta tag like:
   ```html
   <meta name="google-site-verification" content="abc123..." />
   ```

2. Copy the `content` value (just `abc123...`)

3. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=abc123...
   ```

4. Deploy:
   ```bash
   git add .env.local
   git commit -m "Add Google verification"
   git push
   ```

5. Wait 2 minutes for Vercel deployment

6. Return to Search Console → Click **"Verify"**

✅ **Done!** Your site is verified.

---

## Step 3: Submit Sitemap

1. In Search Console, click **"Sitemaps"** (left menu)
2. Enter: `sitemap.xml`
3. Click **"Submit"**

✅ Google will start indexing your 163 original articles!

---

## Step 4: Request Indexing (Optional but Recommended)

1. Click **"URL Inspection"** (left menu)
2. Enter your homepage URL
3. Click **"Request Indexing"**
4. Repeat for your top 5-10 CEO interview articles

**Pro Tip:** Prioritize your best spotlight articles first!

---

## What to Monitor

**Weekly Check:**
- **Coverage:** See how many pages are indexed
- **Performance:** Track which keywords are ranking
- **Core Web Vitals:** Monitor page speed

**Expected Results:**
- Week 1: Sitemap submitted, Google starts crawling
- Week 2-3: First articles appear in search
- Month 1: 50-100 articles indexed

---

## Troubleshooting

**"Couldn't verify"**
- Wait 5 minutes after deployment
- Clear browser cache and try again

**"Sitemap couldn't be read"**
- Check https://csuitemagazine.global/sitemap.xml loads correctly
- Should show XML, not an error page

**"Pages not indexed"**
- Give it time (2-4 weeks is normal)
- Check robots.txt isn't blocking pages

---

**Next:** Set up Bing Webmaster Tools (see `bing-webmaster-setup.md`)
