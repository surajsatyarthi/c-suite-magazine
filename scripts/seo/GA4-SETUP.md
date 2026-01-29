# Google Analytics 4 Integration Setup

**Goal:** Add conversion and user behavior tracking to your SEO reports.

---

## Step 1: Enable Google Analytics Data API

We'll use the same Google Cloud project we already created.

### 1.1 Enable the API

1. Go to: https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com?project=csuite-magazine-seo

2. Click **"Enable"**

3. Done! (Uses same service account credentials)

---

## Step 2: Get Your GA4 Property ID

### 2.1 Find Property ID

1. Go to Google Analytics: https://analytics.google.com

2. Click **Admin** (gear icon, bottom left)

3. In the **Property** column, look for **Property ID**
   - It's a number like: `123456789`
   - **Copy this number!**

### 2.2 Add Property ID to .env.local

```bash
# Add this line:
GA4_PROPERTY_ID=your-property-id-here
```

**Example:**
```bash
GA4_PROPERTY_ID=123456789
```

---

## Step 3: Grant Service Account Access to GA4

The service account needs permission to read GA4 data.

### 3.1 Add User to GA4

1. Still in GA Admin, click **Property Access Management**

2. Click **"Add users"** (+ icon, top right)

3. Enter email:
   ```
   seo-automation@csuite-magazine-seo.iam.gserviceaccount.com
   ```

4. Select role: **"Viewer"**

5. Uncheck "Notify new users by email"

6. Click **"Add"**

---

## Step 4: Test Integration

Once you've completed steps 1-3:

```bash
cd ~/Desktop/Magazine/ceo-magazine
node scripts/seo/test-analytics.js
```

**Expected Output:**
```
✅ Google Analytics connection successful!
📊 Last 7 days:
   Users: 1,234
   Sessions: 2,456
   Pageviews: 5,678
```

---

## What You'll Get

Once configured, analytics data will be included in:

1. **Weekly Email Reports**
   - User engagement metrics
   - Top converting pages
   - Traffic sources

2. **Content Performance Tool**
   - Time on page
   - Bounce rate
   - Conversion rate per article

3. **Keyword Opportunities**
   - Which keywords drive engaged users (not just clicks)

---

## Troubleshooting

### "Property not found"
- Wrong property ID - double check the number
- Service account not added - repeat Step 3

### "403 Forbidden"
- Service account doesn't have Viewer role
- Wait 5 minutes for permissions to propagate

---

**I'll build the integration scripts now. Complete steps 1-3 and we'll test!**
