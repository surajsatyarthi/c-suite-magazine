# 🎯 C-Suite Magazine - Master Issue List

**Last Updated:** 2026-01-19 15:50 IST  
**Status:** ACTIVE - 2 Critical Issues Resolved (Issues #1, #3), Remaining Issues In Progress

> **Owner:** Suraj Satyarthi  
> **Objective:** Single source of truth for all critical issues, bugs, and tasks. Fix revenue-impacting issues immediately.

---

## 🚨 **TIER 0: REVENUE-BLOCKING** (Fix TODAY - Clients Paid But Not Visible)

### Issue #1: CSA Clients Not Getting Paid Spotlight Visibility

- **Status:** 🔴 CRITICAL - Open
- **Priority:** P0 - HIGHEST (Revenue Loss)
- **Revenue Impact:** **CRITICAL** - Direct revenue loss, client dissatisfaction
- **Date Added:** 2026-01-08
- **Source:** SPOTLIGHT_AUDIT_FINDINGS.md

#### **Description**

Three CSA (Company Sponsored Article) clients paid for homepage spotlight placement but are NOT properly configured. This is a direct breach of contract and revenue loss.

#### **Issues Identified:**

1. **Rich Stinson (CEO, Southwire) - Slug Mismatch**
   - Correct slug in Sanity: `rich-stinson-ceo-southwire`
   - Static file (`public/spotlight.json`) has wrong slug: `rich-stinson-visionary-leader-powering-america-s-electrification-future`
   - Status: ✅ In "Executive in Focus" hero position but **WRONG URL → 404/500 error**
   - Impact: Client paid for premium placement, link is broken

2. **Stella Ambrose (Deputy CEO, Sawit Kinabalu) - Slug Mismatch**
   - Correct slug in Sanity: `stella-ambrose-deputy-ceo-sawit-kinabalu`
   - Static file has wrong slug: `stella-ambrose-visionary-trailblazer-in-sustainable-palm-oil-leadership`
   - Status: ✅ In grid position #7 but **WRONG URL → 404/500 error**
   - Impact: Client paid, link is broken

3. **IndianOil / Shrikant Vaidya (Chairman) - COMPLETELY MISSING**
   - Correct slug: `shrikant-vaidya-chairman-indianoil`
   - Status: ❌ **NOT on homepage at all**
   - Missing from both `spotlight.json` AND Sanity `spotlightConfig`
   - Impact: **CLIENT PAID BUT NOT DISPLAYED** - Severe breach of contract

#### **Business Impact:**

- **Direct Revenue Loss:** Clients paid but not getting service
- **Legal Risk:** Breach of contract, potential refunds required
- **Reputation Damage:** Clients will demand explanations
- **Future Sales Impact:** Word spreads that we don't deliver

#### **Proposed Solution:**

**IMMEDIATE FIX (2-4 hours):**

1. **Fix Rich Stinson slug:**
   - Update `public/spotlight.json` with correct slug
   - OR update Sanity article slug to match static file
   - Test hero section link works

2. **Fix Stella Ambrose slug:**
   - Update `public/spotlight.json` with correct slug
   - OR update Sanity article slug to match
   - Test grid position #7 link works

3. **Add IndianOil article:**
   - Add to `public/spotlight.json`
   - Ensure in top 13 displayed slots
   - Verify homepage shows article
   - Test link works

**STRATEGIC FIX (1 day):** 4. **Consolidate Configuration:**

- Choose single source of truth: Sanity `spotlightConfig` (recommended)
- Migrate `spotlight.json` logic to pull from Sanity
- Remove static file dependency

#### **Testing Protocol:**

- [ ] Rich Stinson hero link loads article correctly
- [ ] Stella Ambrose grid link loads article correctly
- [ ] IndianOil article appears on homepage
- [ ] IndianOil link loads article correctly
- [ ] All 3 CSA clients visible on homepage
- [ ] Slugs match between config and Sanity
- [ ] No 404 or 500 errors
- [ ] Mobile display works

#### **Estimated Effort:** 2-4 hours (immediate) + 1 day (strategic fix)

#### **Dependencies:** None - **FIX RIGHT NOW**

#### **Impact:** CRITICAL - Clients paid but not receiving service

---

### Issue #2: Spotlight Configuration Mismatch

- **Status:** 🔴 CRITICAL - Open
- **Priority:** P0 - HIGHEST
- **Revenue Impact:** **HIGH** - Wrong article count, dual configs cause errors
- **Date Added:** 2026-01-08
- **Source:** SPOTLIGHT_AUDIT_FINDINGS.md

#### **Description**

Homepage spotlight has configuration conflicts: wrong total article count and dual configuration sources causing sync issues.

#### **Issues Identified:**

1. **Wrong Article Count:**
   - Current: 17 articles configured (1 Executive + 16 grid candidates, showing only 12)
   - Required per business model: 13 articles total (1 Executive + 12 grid)
   - Problem: 4 extra articles diluting placement value

2. **Dual Configuration Sources:**
   - `public/spotlight.json` controls homepage (17 articles)
   - Sanity `spotlightConfig` document has 16 articles
   - Result: Manual sync required, prone to errors (see Issue #1)

#### **Current Configuration:**

**Executive in Focus (1 slot):**

- Rich Stinson ✅ (but wrong slug - see Issue #1)

**Spotlight Grid (12 displayed from 16 available):**

1. Olga Denysiuk
2. Stoyana Natseva
3. Brianne Howey
4. Dr. Basma Ghandourah
5. Erin Krueger
6. Bill Faruki
7. Stella Ambrose ✅ CSA (but wrong slug - see Issue #1)
8. Pankaj Bansal
9. Supreet Nagi
10. Swami Aniruddha
11. Bryce Tully
12. Cal Riley

**NOT Displayed (13-16):**

- John Zangardi
- Bryan Smeltzer
- Dean Fealk
- Benjamin Borketey

**COMPLETELY MISSING:**

- IndianOil / Shrikant Vaidya ❌ CSA (see Issue #1)

#### **Business Decisions Needed:**

1. **Which 4 articles to remove?** (Need 13 total, have 17)
   - Option A: Remove the 4 not currently displayed (Zangardi, Smeltzer, Fealk, Borketey)
   - Option B: Remove from displayed 1-12
   - **Recommendation:** Remove Option A (not displayed), keep all CSAs

2. **Confirm Executive in Focus:**
   - Is Rich Stinson the highest-paying client?
   - Should remain in hero position?

3. **Source of Truth:**
   - Migrate to Sanity `spotlightConfig` (recommended - easier management)
   - OR keep `spotlight.json` (requires manual updates)

#### **Proposed Solution:**

**Phase 1: Fix Article Count (2 hours)**

1. Remove 4 non-displayed articles from configuration
2. Add IndianOil (making it 13 total: 1 Executive + 12 grid)
3. Update `lib/spotlight.ts` line 78:

   ```typescript
   // Change from:
   const maxCount = typeof desiredCount === "number" ? desiredCount : 12;

   // To:
   const maxCount = typeof desiredCount === "number" ? desiredCount : 13;
   ```

**Phase 2: Consolidate Configs (1 day)**

1. Make Sanity single source of truth
2. Update `lib/spotlight.ts` to pull from Sanity only
3. Deprecate `spotlight.json`
4. Add CMS workflow for managing spotlight

#### **Testing Protocol:**

- [ ] Exactly 13 articles configured (1 + 12)
- [ ] All 3 CSA clients visible
- [ ] Homepage displays 13 articles correctly
- [ ] No duplicate articles
- [ ] Config sync issues resolved
- [ ] CMS updates reflect on homepage

#### **Estimated Effort:** 2 hours (count) + 1 day (consolidation)

#### **Dependencies:** Should be done WITH Issue #1

#### **Impact:** HIGH - Business model alignment

---

### Issue #3: Spotlight Images Missing Text Overlays

- **Status:** 🔴 CRITICAL - Open
- **Priority:** P0 - HIGHEST
- **Revenue Impact:** **HIGH** - Poor UX, looks unfinished
- **Date Added:** 2026-01-18
- **Source:** User request

#### **Description**

Cover images in spotlight section lack text overlays (article titles, metadata). Images appear plain without context, inconsistent with design specifications.

#### **Current State:**

- Spotlight images show only the image
- No article title overlay
- No category badge
- No gradient for readability
- Looks incomplete/unprofessional

#### **Business Impact:**

- **Poor First Impression:** Homepage looks unfinished to clients paying $2K-9K
- **Low Click-Through:** Users don't know what articles are about
- **Brand Damage:** Doesn't match "premium magazine" positioning

#### **Proposed Solution:**

**Update Spotlight Component (4 hours):**

1. Add text overlay to spotlight images
2. Include:
   - Article title
   - Category badge
   - Gradient overlay for text readability
   - Hover effect (optional)
3. Ensure mobile responsive
4. Match design specifications

#### **Testing Protocol:**

- [ ] Text overlays show on all spotlight images
- [ ] Article titles are readable
- [ ] Category badges display correctly
- [ ] Gradient overlay provides contrast
- [ ] Mobile display works correctly
- [ ] Hover states work (if implemented)
- [ ] Consistent styling across all images

#### **Estimated Effort:** 4 hours

#### **Dependencies:** None

#### **Impact:** HIGH - User experience and brand perception

---

## 🔴 **TIER 1: CRITICAL ISSUES** (Fix This Week)

### Issue #4: Tag Data Quality Problems

- **Status:** 🔴 Critical - Open
- **Priority:** P1 - Very High
- **Revenue Impact:** **HIGH** - Brand damage, SEO loss
- **Date Added:** 2026-01-18
- **Source:** Data analysis

#### **Description**

The tagging system has multiple critical data quality issues that reduce content discoverability, damage brand credibility, and create inconsistent user experiences.

#### **Issues Identified:**

1. **Case Sensitivity Inconsistencies:**
   - "ai" (11 articles) vs "AI" (9 articles)
   - "innovation" (29) vs "Innovation" (6)
   - "leadership" (25) vs "Leadership" (5)
   - "opinion" (85) vs "Opinion" (1)
   - "cxo interview" (62) vs "CxO Interview" (3)

2. **Stopword/Low-Quality Tags:**
   - "his" (6), "her" (5), "not" (2), "but" (1), "was" (2), "where" (2)
   - "than" (1), "how" (1), "while" (1), "she" (1), "---" (1)

3. **Executive Name Tags:** (~25 tags)
   - "moffat", "boland", "mccann", "pinto", "Steve Jobs", "john", "zangardi", etc.
   - Should be in dedicated fields, not tags

4. **Tag/Category Duplication:**
   - Tags mirror categories: "leadership", "innovation", "healthcare", etc.

#### **Current State:**

- 131 unique tags (case-sensitive) / 126 (case-insensitive)
- 494 total tag mentions across 170 articles
- 20-30 stopword tags to remove
- 15-20 case variants to normalize

#### **Business Impact:**

- **Brand Damage:** Executives paying $2K-9K see unprofessional tagging
- **SEO Loss:** Duplicate content, diluted keywords
- **User Experience:** Confusing, low-quality tags

#### **Proposed Solution:**

**Phase 1: Tag Cleanup Script (Days 1-2)**

1. Create `scripts/cleanup-tags.js`:
   - Backup data first
   - Merge case variants (ai + AI → AI)
   - Remove stopword tags (~12)
   - Remove name tags (~25)
   - Normalize to lowercase
   - Generate change log
2. Dry-run mode for review
3. Execute on production

**Phase 2: Prevention (Days 3-4)**

1. Add Sanity validation (see Issue #8)
2. Create curated tag dropdown
3. Document tag guidelines

#### **Testing Protocol:**

- [ ] All case variants merged correctly
- [ ] All stopwords removed
- [ ] All name tags removed
- [ ] No valid tags accidentally deleted
- [ ] Articles updated correctly in Sanity
- [ ] Validation prevents new stopwords
- [ ] Rollback works if needed

#### **Estimated Effort:** 2-3 days

#### **Dependencies:** None

#### **Impact:** HIGH - Brand credibility and SEO

---

### Issue #5: Tag Pages Missing (Non-Functional Tags)

- **Status:** 🔴 Critical - Open
- **Priority:** P1 - Very High
- **Revenue Impact:** **HIGH** - Lost SEO traffic
- **Date Added:** 2026-01-18
- **Source:** TASKS.md, site analysis

#### **Description**

Tags are displayed on articles but completely non-functional (not clickable). No tag landing pages exist, resulting in lost SEO value and poor UX.

#### **Current State:**

- 126 tags displayed but NOT clickable
- No `/app/tag/[slug]/` route exists
- No tag pages in sitemap
- 126 potential SEO landing pages missing

#### **Business Impact:**

- **Lost SEO Traffic:** Missing long-tail keywords ("AI leadership", "energy innovation")
- **Poor UX:** Tags create expectation but don't work
- **Competitive Disadvantage:** Competitors have tag pages

#### **Proposed Solution:**

**Phase 1: Build Tag Pages (Days 1-2)**

1. Create `/app/tag/[slug]/page.tsx` route
2. Article grid layout with pagination
3. SEO metadata generation

**Phase 2: Make Tags Clickable (Day 2)**

1. Update `components/TagChips.tsx`
2. Convert `<span>` to `<Link>`
3. Add hover states

**Phase 3: SEO (Day 2)**

1. Add to sitemap.xml
2. Generate metadata per tag
3. Structured data

#### **Testing Protocol:**

- [ ] Tag pages display correct articles
- [ ] Tags are clickable from articles
- [ ] SEO metadata generates
- [ ] Tag pages in sitemap
- [ ] Mobile responsive
- [ ] 404 for invalid tags

#### **Estimated Effort:** 1-2 days

#### **Dependencies:** Tag cleanup (Issue #4) first

#### **Impact:** HIGH - Major SEO improvement

---

### Issue #6: Writer Details Missing from Article Pages

- **Status:** 🔴 Critical - Open
- **Priority:** P1 - Very High
- **Revenue Impact:** **MEDIUM-HIGH** - SEO loss, poor attribution

## 🎯 **LESSONS LEARNED**

### From CSA 500 Error Incident (2026-01-18)

- **Always check actual production error logs first** before making assumptions
- Environment variables were a red herring - real issue was jsdom dependency
- Local dev works ≠ production works (different module resolution)
- Prevention is cheaper than debugging

---

## 🟢 **TIER 4: INFRASTRUCTURE IMPROVEMENTS** (Prevent Future Issues)

### Issue #10: Production Error Prevention System

- **Status:** 🟢 New - Open
- **Priority:** P3 - Medium
- **Revenue Impact:** **PREVENTATIVE** - Saves future debugging time
- **Date Added:** 2026-01-18
- **Source:** Lessons from jsdom/CSA 500 error incident

#### **Description**

Implement 5-layer defense system to catch production-breaking errors (like the jsdom incident) BEFORE they reach production.

#### **Context:**

The CSA 500 error incident revealed gaps in our deployment process:

- `isomorphic-dompurify` caused jsdom ESM/CommonJS conflict
- Worked locally but failed in Vercel serverless functions
- No automated checks caught it
- Took hours to diagnose
- **Could have been caught in 30 seconds with proper testing**

#### **Proposed 5-Layer Prevention System:**

##### **Layer 1: Local Production Build Testing (CRITICAL)**

**Before every git push, run:**

```bash
npm run build && npm run start
```

**Implementation:**

1. Create `scripts/test-production-readiness.sh`:
   - Check for problematic dependencies (`jsdom`, browser APIs)
   - Run production build
   - Start production server
   - Test critical routes (CSA, categories, homepage)
   - Auto-cleanup on failure

2. Add to developer workflow documentation
3. Consider pre-push git hook (optional)

**Estimated Effort:** 2 hours  
**Impact:** Would have caught jsdom error immediately

---

##### **Layer 2: E2E Tests for Critical Routes**

**Add to `tests/e2e/critical-routes.spec.ts`:**

```typescript
test("All CSA articles return 200 OK", async ({ page }) => {
  const csaRoutes = [
    "/csa/rich-stinson-ceo-southwire",
    "/csa/stella-ambrose-deputy-ceo-sawit-kinabalu",
    "/csa/shrikant-vaidya-chairman-indianoil",
  ];

  for (const route of csaRoutes) {
    const response = await page.goto(`https://preview.url${route}`);
    expect(response?.status()).toBe(200);
  }
});
```

**Implementation:**

1. Add critical route tests
2. Run on Vercel preview deployments
3. Block merges if tests fail

**Estimated Effort:** 4 hours
**Impact:** Automated smoke testing

---

##### **Layer 3: Dependency Audit in CI/CD**

**Add to `.github/workflows/ci.yml`:**

```yaml
- name: Check for problematic serverless dependencies
  run: |
    # Flag packages known to break in serverless
    if pnpm list jsdom 2>/dev/null; then
      echo "❌ jsdom detected - breaks in Vercel!"
      exit 1
    fi

    if pnpm list puppeteer 2>/dev/null; then
      echo "❌ puppeteer detected - use @sparticuz/chromium"
      exit 1
    fi
```

**Problematic packages to flag:**

- `jsdom` → Use server-safe sanitizers
- `puppeteer` → Use `@sparticuz/chromium`
- `canvas` → Use `@napi-rs/canvas`
- `sharp` (in production deps) → Move to devDependencies

**Estimated Effort:** 2 hours
**Impact:** Catches bad dependencies before deployment

---

##### **Layer 4: Vercel Preview Testing Protocol**

**Every PR must include:**

1. Comment with preview URL
2. **Manual checklist**:
   - [ ] Homepage loads
   - [ ] CSA articles tested (click 2-3 from spotlight)
   - [ ] No 500 errors in Vercel logs
   - [ ] Console has no critical errors

**Template for PR description:**

```markdown
## Preview Testing

- Preview URL: https://ceo-magazine-git-[branch]-[user].vercel.app
- [ ] Homepage loads without errors
- [ ] Tested CSA article: [article-slug] → ✅ 200 OK
- [ ] Checked Vercel logs → No 500 errors
```

**Estimated Effort:** 1 hour (create template)
**Impact:** Human verification before merge

---

##### **Layer 5: Production Monitoring & Alerts**

**Set up alerts for:**

1. **500 Error Spike** → Slack/Email immediately
2. **Specific route failures** → Monitor `/csa/*`, `/category/*`
3. **Dependency loading errors** → `ERR_REQUIRE_ESM`, module failures

**Tools:**

- Vercel Analytics (already have)
- Sentry (already configured)
- Custom webhook to Slack

**Alert configuration:**

```javascript
// Sentry filter
if (error.message.includes("ERR_REQUIRE_ESM")) {
  // CRITICAL - serverless module loading issue
  alertLevel = "critical";
  notifySlack();
}
```

**Estimated Effort:** 4 hours
**Impact:** Instant notification of production issues

---

#### **Implementation Priority:**

| Layer   | Description               | Effort | Priority | When    |
| ------- | ------------------------- | ------ | -------- | ------- |
| Layer 1 | Local prod testing script | 2h     | P0       | **NOW** |
| Layer 2 | Critical route E2E tests  | 4h     | P1       | Week 1  |
| Layer 3 | Dependency audit CI/CD    | 2h     | P1       | Week 1  |
| Layer 4 | PR testing protocol       | 1h     | P2       | Week 2  |
| Layer 5 | Production alerts         | 4h     | P2       | Week 2  |

**Total Effort:** ~13 hours (1.5 days)

---

#### **Success Metrics:**

- ✅ No production errors slip through for 30 days
- ✅ All preview deployments tested before merge
- ✅ Dependency issues caught in CI/CD
- ✅ Mean time to detect (MTTD) production errors: < 5 minutes
- ✅ Mean time to resolve (MTTR) production errors: < 1 hour

---

#### **Testing Protocol:**

- [ ] Production readiness script catches bad dependencies
- [ ] Script fails build when jsdom detected
- [ ] E2E tests run on preview deployments
- [ ] CI/CD blocks bad dependency PRs
- [ ] Alerts trigger on test 500 errors
- [ ] Full system tested with dummy error

---

#### **Estimated Effort:** 1.5 days (13 hours)

#### **Dependencies:**

- Issue #9 (E2E tests) partially overlaps with Layer 2

#### **Impact:**

- **HIGH** - Prevents future $6K+ incidents
- **HIGH** - Reduces debugging time from hours to minutes
- **MEDIUM** - Increases developer confidence in deployments

---

## 📋 **UPDATED EXECUTION PLAN**

### **Total Issues: 10**

Add to Week 2 or Week 3:

**Week 2, Day 11-12:**

- ✅ **Issue #10, Layers 1-3:** Local testing + E2E + Dependency audit (8 hours)

**Week 3, Day 13:**

- ✅ **Issue #10, Layers 4-5:** PR protocol + Monitoring (5 hours)

---

**END OF MASTER ISSUE LIST**

- **Date Added:** 2026-01-18
- **Source:** User request

#### **Description**

Writer/author details are not displaying on article pages, resulting in poor attribution and missing authorship signals for SEO.

#### **Current State:**

- Writer information missing from article pages
- No author byline visible
- Affects SEO (E-E-A-T signals)
- Affects credibility

#### **Business Impact:**

- **SEO Loss:** Google values author attribution
- **Credibility Loss:** No author looks less professional
- **Writer Frustration:** No credit for work
- **Legal Risk:** Attribution may be contractually required

#### **Proposed Solution:**

**Phase 1: Verify Data (2 hours)**

1. Check if writer data exists in Sanity
2. Identify root cause (data vs display)

**Phase 2: Fix Display (2-4 hours)**

1. Update article component to show writer
2. Add name, bio, avatar, profile link
3. Add structured data for author

#### **Testing Protocol:**

- [ ] Writer name displays on all articles
- [ ] Writer bio shows (if available)
- [ ] Link to writer profile works
- [ ] Structured data validates
- [ ] Mobile display works

#### **Estimated Effort:** 4-6 hours

#### **Dependencies:** None

#### **Impact:** MEDIUM-HIGH - SEO and credibility

---

## 🟡 **TIER 2: HIGH PRIORITY** (Fix This Week)

### Issue #7: Sanity Validation Rules Missing

- **Status:** 🟡 High - Open
- **Priority:** P2 - High
- **Revenue Impact:** **MEDIUM** - Causes production errors
- **Date Added:** 2026-01-18
- **Source:** ISSUES.md

#### **Description**

Sanity CMS lacks validation rules, allowing bad data that causes 500 errors and poor UX.

#### **Current State:**

- No validation for stopword tags
- No validation for required fields (mainImage, alt text)
- No validation for excerpt length
- Result: Bad data causes frontend errors

#### **Evidence:**

- 500 errors on spotlight articles (invalid image references)
- Stopword tags published
- Missing alt text

#### **Business Impact:**

- **Production Errors:** Downtime → Lost traffic
- **Manual Cleanup:** Time wasted
- **Brand Damage:** Broken pages

#### **Proposed Solution:**

**Add Validation to Schemas:**

1. Tags: min 3, max 5, no stopwords
2. Images: required, alt text required (10-120 chars)
3. Categories: required, min 1
4. Excerpt: max 200 chars

**Code Example:**

```typescript
defineField({
  name: "tags",
  type: "array",
  of: [{ type: "string" }],
  validation: (Rule) =>
    Rule.required()
      .min(3)
      .max(5)
      .custom((tags) => {
        const stopwords = [
          "his",
          "her",
          "not",
          "but",
          "was",
          "where",
          "than",
          "how",
          "while",
          "she",
          "---",
        ];
        const invalidTags = tags?.filter((tag) =>
          stopwords.includes(tag.toLowerCase()),
        );
        if (invalidTags?.length) {
          return `Invalid stopword tags: ${invalidTags.join(", ")}`;
        }
        return true;
      }),
});
```

#### **Testing Protocol:**

- [ ] Cannot save with < 3 tags
- [ ] Cannot save with stopword tags
- [ ] Cannot save without alt text
- [ ] Validation errors display clearly
- [ ] Existing valid articles still save

#### **Estimated Effort:** 1-2 days

#### **Dependencies:** Do WITH tag cleanup (Issue #4)

#### **Impact:** MEDIUM - Prevents future issues

---

### Issue #8: Category Misclassification

- **Status:** 🟡 Medium - Open
- **Priority:** P2 - High
- **Revenue Impact:** **MEDIUM** - Taxonomy confusion
- **Date Added:** 2026-01-18
- **Source:** ISSUES.md

#### **Description**

2 CSA articles are in "Company Sponsored" category instead of topical categories.

#### **Current State:**

- Company Sponsored is a category (should be a field)
- 2 articles miscategorized
- Creates confusion: topic vs payment tier

#### **Business Impact:**

- **Confuses Clients:** "Is Company Sponsored different from CSA?"
- **Poor Organization:** Can't browse by actual topic
- **SEO Loss:** Not categorized by industry

#### **Proposed Solution:**

**Phase 1: Add isSponsored Field**

1. Add boolean field to schemas
2. CSAs automatically marked as sponsored

**Phase 2: Recategorize**

1. Move 2 articles to topical categories
2. Add sponsorship badge to UI

**Phase 3: Deprecate Category (Optional)**

1. Remove from category list
2. Set up redirects

#### **Testing Protocol:**

- [ ] isSponsored field added
- [ ] 2 articles recategorized
- [ ] Sponsorship badge displays
- [ ] No broken links

#### **Estimated Effort:** 1 day

#### **Dependencies:** None

#### **Impact:** MEDIUM - Taxonomy clarity

---

## 🟢 **TIER 3: PREVENTATIVE** (Fix Next Week)

### Issue #9: E2E Tests Not Running in CI/CD

- **Status:** 🟢 Low - Open
- **Priority:** P3 - Medium
- **Revenue Impact:** **LOW** (preventative)
- **Date Added:** 2026-01-18
- **Source:** ISSUES.md

#### **Description**

E2E tests exist but aren't running automatically in CI/CD, missing bug-catching opportunities.

#### **Current State:**

- Tests exist: `test:e2e`, `test:smoke`, `test:critical`
- Unknown if passing
- Not running on Vercel builds
- No deployment blocking

#### **Business Impact:**

- **Future Prevention:** Catches bugs before production
- **No Immediate Loss:** But prevents future $6K incidents
- **Confidence:** Automated testing

#### **Proposed Solution:**

**Phase 1: Verify Tests (Day 1)**

1. Run tests locally
2. Document failures
3. Assess coverage

**Phase 2: Fix Tests (Days 1-2)**

1. Fix broken tests
2. Update selectors
3. Add critical path tests

**Phase 3: CI/CD Integration (Day 3)**

1. Add to Vercel config
2. Block deployments on failures
3. Add status badge

#### **Testing Protocol:**

- [ ] All smoke tests pass
- [ ] All critical tests pass
- [ ] Tests run automatically
- [ ] Failed tests block deployment
- [ ] Team notified of failures

#### **Estimated Effort:** 2-3 days

#### **Dependencies:** None

#### **Impact:** LOW immediate, HIGH long-term

---

## 📊 **Priority Matrix & Execution Plan**

### **Priority Summary**

| Issue               | Revenue Impact | Effort   | Priority | Start   |
| ------------------- | -------------- | -------- | -------- | ------- |
| #1 CSA Visibility   | 🔴 CRITICAL    | 2-4h     | P0       | **NOW** |
| #2 Spotlight Config | 🔴 HIGH        | 2h       | P0       | **NOW** |
| #3 Image Overlays   | 🔴 HIGH        | 4h       | P0       | Day 1   |
| #4 Tag Cleanup      | 🔴 HIGH        | 2-3 days | P1       | Day 2   |
| #5 Tag Pages        | 🔴 HIGH        | 1-2 days | P1       | Day 4   |
| #6 Writer Details   | 🟡 MED-HIGH    | 4-6h     | P1       | Day 3   |
| #7 Validation       | 🟡 MEDIUM      | 1-2 days | P2       | Day 5   |
| #8 Category Fix     | 🟡 MEDIUM      | 1 day    | P2       | Day 6   |
| #9 E2E Tests        | 🟢 LOW         | 2-3 days | P3       | Week 2  |

---

### **3-WEEK EXECUTION PLAN**

#### **WEEK 1: Revenue-Critical Fixes**

**Day 1 (TODAY):**

- ✅ **Issue #1:** Fix CSA spotlight visibility (2-4 hours)
  - Fix Rich Stinson slug
  - Fix Stella Ambrose slug
  - Add IndianOil article
  - Test all links work
- ✅ **Issue #2:** Fix spotlight config (2 hours)
  - Remove 4 extra articles
  - Update count to 13
  - Test display

- ✅ **Issue #3:** Add image overlays (4 hours)
  - Update component
  - Add text overlays
  - Test on all images

**Day 2-3:**

- ✅ **Issue #4:** Tag cleanup script
  - Create script
  - Dry-run
  - Execute cleanup

- ✅ **Issue #6:** Fix writer details
  - Verify data
  - Update display
  - Test all pages

**Day 4-5:**

- ✅ **Issue #7:** Sanity validation
  - Add validation rules
  - Test in Studio

- ✅ **Issue #5 prep:** Tag cleanup (must finish first)

---

#### **WEEK 2: Features & Validation**

**Day 6-7:**

- ✅ **Issue #5:** Build tag pages
  - Create route
  - Make tags clickable
  - Add to sitemap

**Day 8:**

- ✅ **Issue #8:** Category fix
  - Add isSponsored field
  - Recategorize articles
  - Add badge

**Day 9-10:**

- ✅ **Full QA & Deploy**
  - Test all fixes
  - Deploy to production
  - Monitor

---

#### **WEEK 3: Testing Infrastructure**

**Day 11-13:**

- ✅ **Issue #9:** E2E tests
  - Fix tests
  - Add to CI/CD
  - Verify automation

**Day 14-15:**

- ✅ **Production Monitoring**
  - Track metrics
  - Verify fixes working
  - Document lessons learned

---

## 🚨 **IMMEDIATE NEXT ACTIONS** (Right Now)

### **Step 1: Fix CSA Visibility (30 minutes)**

Run these commands to investigate:

```bash
# Check Rich Stinson article
node -e "
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN
});
client.fetch('*[_type == \"csa\" && title match \"Rich Stinson*\"][0]{ title, slug }')
  .then(r => console.log('Rich:', JSON.stringify(r, null, 2)));
"

# Check Stella Ambrose article
node -e "
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN
});
client.fetch('*[_type == \"csa\" && title match \"Stella*\"][0]{ title, slug }')
  .then(r => console.log('Stella:', JSON.stringify(r, null, 2)));
"

# Check IndianOil article
node -e "
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN
});
client.fetch('*[_type == \"csa\" && title match \"*IndianOil*\" || title match \"*Shrikant*\"][0]{ title, slug }')
  .then(r => console.log('IndianOil:', JSON.stringify(r, null, 2)));
"
```

Then check `public/spotlight.json` and fix mismatches.

---

### **Step 2: Review & Approve**

**Confirm to proceed:**

1. Say **"fix CSA visibility now"** and I'll create the fix scripts
2. Or say **"start with tag cleanup"** if you prefer

---

## 📋 **Reference Information**

### **Current Categories (14 total)**

1. Leadership (39 articles)
2. Innovation (19 articles)
3. Healthcare (14 articles)
4. CXO Interview (13 articles)
5. Changemakers And Sustainability (12 articles)
6. Automotive And Logistics (11 articles)
7. Construction And Mining (11 articles)
8. Education (11 articles)
9. Money And Finance (11 articles)
10. Professional Services (11 articles)
11. Opinion (10 articles)
12. Startups (7 articles)
13. Science & Technology (6 articles)
14. **Company Sponsored (2 articles)** ⚠️ Issue #8

### **Files Involved**

- `public/spotlight.json` - Static spotlight config
- `lib/spotlight.ts` - Display logic
- Sanity `spotlightConfig` - CMS config
- `components/TagChips.tsx` - Tag display
- `sanity/schemaTypes/` - Validation rules

---

**This is the single source of truth. All other issue files will be deleted.**
