# Comprehensive QA Test Plan - C-Suite Magazine
**Date:** December 31, 2025
**Purpose:** Deep testing before programmatic SEO implementation
**Scope:** Frontend, Backend, Infrastructure, Mobile, SEO readiness

---

## Test Environment

- **Production URL:** https://csuitemagazine.global
- **CMS:** Sanity Studio
- **Database:** Sanity (current), Supabase (to be added for pSEO)
- **Hosting:** Vercel
- **Analytics:** Google Analytics 4

---

## 1. Frontend Testing

### 1.1 Page Load & Performance
- [ ] Homepage loads in <3 seconds (desktop)
- [ ] Homepage loads in <5 seconds (mobile 3G)
- [ ] Article pages load in <3 seconds
- [ ] Category pages load in <3 seconds
- [ ] Core Web Vitals pass (LCP, FID, CLS)
- [ ] Lighthouse Performance score >90
- [ ] No render-blocking resources
- [ ] Images are lazy-loaded
- [ ] Fonts load without FOIT/FOUT

**Tools:** Lighthouse, PageSpeed Insights, WebPageTest

### 1.2 Visual & UI Testing
- [ ] No broken images
- [ ] No broken links (internal)
- [ ] No broken links (external)
- [ ] Typography renders correctly
- [ ] Layout doesn't break on long content
- [ ] No horizontal scrolling issues
- [ ] Interstitial ads display correctly
- [ ] Search UI renders properly
- [ ] Footer displays correctly
- [ ] Header/navigation works

**Tools:** Manual inspection, broken-link-checker

### 1.3 JavaScript Functionality
- [ ] No console errors on homepage
- [ ] No console errors on article pages
- [ ] No console errors on category pages
- [ ] Search autocomplete works
- [ ] Article view counter increments
- [ ] Focus manager works (keyboard navigation)
- [ ] Lazy loading components load properly
- [ ] No unhandled promise rejections

**Tools:** Browser DevTools Console, Manual testing

### 1.4 Interactive Features
- [ ] Search returns relevant results
- [ ] Search handles empty query gracefully
- [ ] Search handles special characters
- [ ] Pagination works (if applicable)
- [ ] Social share buttons work
- [ ] Ad interstitials display and close properly
- [ ] Locale selection popup works

**Tools:** Manual testing

---

## 2. Mobile Responsiveness Testing

### 2.1 Layout & Design
- [ ] Homepage responsive on iPhone (375px)
- [ ] Homepage responsive on iPad (768px)
- [ ] Article pages responsive on mobile
- [ ] Navigation menu works on mobile
- [ ] Images scale properly on mobile
- [ ] Text remains readable (min 16px)
- [ ] Buttons are tappable (min 44px)
- [ ] No elements overflow viewport

**Devices to test:** iPhone 12/13, iPad, Android phone

### 2.2 Mobile Performance
- [ ] Lighthouse Mobile score >80
- [ ] First Contentful Paint <2.5s on 4G
- [ ] Time to Interactive <5s on 4G
- [ ] Total page weight <2MB
- [ ] No layout shifts on mobile (CLS <0.1)

**Tools:** Chrome DevTools Device Mode, real devices

### 2.3 Touch Interactions
- [ ] Tap targets are large enough (44x44px min)
- [ ] No accidental ad clicks
- [ ] Swipe gestures work (if applicable)
- [ ] Zoom works without breaking layout
- [ ] Pinch-to-zoom enabled (no user-scalable=no)

**Tools:** Manual testing on real devices

### 2.4 Mobile-Specific Issues
- [ ] Viewport meta tag configured correctly
- [ ] Touch icons (apple-touch-icon) present
- [ ] No Flash or unsupported plugins
- [ ] Forms work on mobile keyboard
- [ ] Auto-fill works for forms

**Tools:** Mobile device testing

---

## 3. SEO Readiness Testing

### 3.1 Technical SEO
- [ ] Robots.txt accessible and correct
- [ ] XML sitemap accessible (/sitemap.xml or dynamic)
- [ ] Canonical URLs set correctly
- [ ] No duplicate content issues
- [ ] HTTPS enabled site-wide
- [ ] WWW/non-WWW redirect configured
- [ ] 404 pages return proper status code
- [ ] No redirect chains (301 → 301 → 200)
- [ ] Page load speed <3s (ranking factor)

**Tools:** Google Search Console, Screaming Frog, SEO site audit

### 3.2 On-Page SEO
- [ ] Every page has unique title tag (50-60 chars)
- [ ] Every page has unique meta description (150-160 chars)
- [ ] H1 tag present and unique on each page
- [ ] Heading hierarchy correct (H1 → H2 → H3)
- [ ] Images have alt text
- [ ] Internal linking structure exists
- [ ] URLs are clean and descriptive
- [ ] No keyword stuffing

**Tools:** Manual inspection, Lighthouse SEO audit

### 3.3 Structured Data
- [ ] Organization schema present
- [ ] Article schema on article pages
- [ ] BreadcrumbList schema (if applicable)
- [ ] Structured data validates (no errors)
- [ ] Rich results eligible (test with Google tool)

**Tools:** Google Rich Results Test, Schema.org validator

### 3.4 Content Quality
- [ ] No thin content (<300 words on important pages)
- [ ] Unique content (not duplicated elsewhere)
- [ ] Grammar and spelling correct
- [ ] Readability appropriate for audience
- [ ] No Lorem Ipsum or placeholder text

**Tools:** Manual review, Grammarly, Hemingway Editor

### 3.5 Social Sharing
- [ ] Open Graph tags present
- [ ] Twitter Card tags present
- [ ] Social images display correctly (1200x630px)
- [ ] Social share preview works (Facebook debugger)

**Tools:** Facebook Sharing Debugger, Twitter Card Validator

---

## 4. Backend & API Testing

### 4.1 API Endpoints
- [ ] `/api/search?q=test` returns 200
- [ ] `/api/search` returns valid JSON
- [ ] `/api/search` handles empty query
- [ ] `/api/search` handles special characters
- [ ] `/api/views` increments view count
- [ ] `/api/views` handles invalid slug
- [ ] `/api/vercel-webhook` validates signature
- [ ] `/rss.xml` returns valid XML
- [ ] `/rss.xml` returns 200 status
- [ ] All APIs have error handling

**Tools:** curl, Postman, Insomnia

### 4.2 Error Handling
- [ ] 404 pages display custom error page
- [ ] 500 errors display custom error page
- [ ] API errors return proper status codes
- [ ] API errors return helpful error messages
- [ ] Failed requests are logged
- [ ] No sensitive data in error messages

**Tools:** Manual testing, Vercel logs

### 4.3 Security
- [ ] No exposed API keys in client code
- [ ] CORS configured correctly
- [ ] Rate limiting on write endpoints
- [ ] CSRF protection where needed
- [ ] SQL injection prevention (N/A for Sanity)
- [ ] XSS prevention in user-generated content
- [ ] Content Security Policy headers set

**Tools:** Browser DevTools, security headers checker

---

## 5. Sanity CMS Testing

### 5.1 Content Management
- [ ] Can create new article in Sanity Studio
- [ ] Can edit existing article
- [ ] Can delete article (with confirmation)
- [ ] Can upload images
- [ ] Can set featured image
- [ ] Can assign categories
- [ ] Can set publish date
- [ ] Can hide articles (isHidden flag)
- [ ] Rich text editor works
- [ ] Preview works in Sanity Studio

**Tools:** Sanity Studio interface

### 5.2 Data Integrity
- [ ] Published articles appear on site
- [ ] Hidden articles don't appear on site
- [ ] Category filtering works
- [ ] Article slugs are unique
- [ ] Images load from Sanity CDN
- [ ] Image transformations work (resize, crop)
- [ ] No orphaned content (articles without categories)
- [ ] Author attribution displays correctly

**Tools:** Manual testing, Sanity Vision (GROQ queries)

### 5.3 Sanity Performance
- [ ] Queries execute in <500ms
- [ ] Image CDN responds quickly
- [ ] No GROQ query errors in logs
- [ ] Rate limits not exceeded
- [ ] Webhook delivers updates to site

**Tools:** Sanity Studio, Vercel logs

---

## 6. Infrastructure Testing (Vercel)

### 6.1 Deployment
- [ ] Latest deployment succeeded
- [ ] Build completes in reasonable time (<10 min)
- [ ] No build errors or warnings
- [ ] Environment variables set correctly
- [ ] No environment variable leaks to client

**Tools:** Vercel Dashboard

### 6.2 Edge Network
- [ ] Pages cached correctly (ISR/SSG)
- [ ] Cache headers set appropriately
- [ ] CDN serves assets quickly
- [ ] Global latency acceptable (<200ms TTFB)
- [ ] No cold start issues on serverless functions

**Tools:** Vercel Analytics, WebPageTest (multiple locations)

### 6.3 Monitoring & Logs
- [ ] Real-time logs accessible
- [ ] Error logs show actionable information
- [ ] No excessive errors in logs
- [ ] Deployment notifications work (if configured)
- [ ] Analytics tracking requests

**Tools:** Vercel Dashboard, Logs panel

### 6.4 Resource Limits
- [ ] Not approaching bandwidth limits
- [ ] Not approaching build minute limits
- [ ] Serverless function execution time acceptable
- [ ] No function timeout errors

**Tools:** Vercel Usage tab

---

## 7. Analytics & Tracking

### 7.1 Google Analytics
- [ ] GA tag loads on all pages
- [ ] Measurement ID correct (G-P58LP0EZLL)
- [ ] Page views tracked
- [ ] Events tracked (if configured)
- [ ] No duplicate tracking codes
- [ ] Data appears in GA dashboard (24-48hr delay expected)

**Tools:** Google Tag Assistant, GA4 DebugView

### 7.2 Search Console
- [ ] Property verified
- [ ] Sitemap submitted
- [ ] No coverage errors
- [ ] No manual actions
- [ ] Core Web Vitals pass
- [ ] Mobile usability issues addressed

**Tools:** Google Search Console

---

## 8. Accessibility Testing

### 8.1 Keyboard Navigation
- [ ] Can navigate entire site with keyboard
- [ ] Focus indicators visible
- [ ] Skip to main content link works
- [ ] No keyboard traps
- [ ] Tab order is logical

**Tools:** Manual testing (Tab key)

### 8.2 Screen Reader Compatibility
- [ ] Semantic HTML used (nav, main, article, etc.)
- [ ] ARIA labels present where needed
- [ ] Images have alt text
- [ ] Form inputs have labels
- [ ] Headings create logical document outline

**Tools:** NVDA, VoiceOver, Lighthouse Accessibility audit

### 8.3 Visual Accessibility
- [ ] Color contrast meets WCAG AA (4.5:1 min)
- [ ] Text resizable to 200% without breaking
- [ ] No information conveyed by color alone
- [ ] Focus states visible for interactive elements

**Tools:** WAVE, axe DevTools, Contrast Checker

---

## 9. Cross-Browser Testing

### 9.1 Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### 9.2 Mobile Browsers
- [ ] Safari iOS (latest)
- [ ] Chrome Android (latest)
- [ ] Samsung Internet (if applicable)

### 9.3 Compatibility Checks
- [ ] CSS Grid/Flexbox support
- [ ] ES6 JavaScript features
- [ ] Image formats (WebP fallback)
- [ ] Font loading

**Tools:** BrowserStack, real devices

---

## 10. Pre-SEO Infrastructure Readiness

### 10.1 Supabase Setup (For Programmatic SEO)
- [ ] Supabase project created (or ready to create)
- [ ] Database schema designed (executives, companies, compensation)
- [ ] Connection pooling configured (Supavisor)
- [ ] Row-level security policies set
- [ ] API endpoint /api/executives/[slug] planned

**Status:** NOT YET IMPLEMENTED - To be built for pSEO

### 10.2 Scalability Assessment
- [ ] Current architecture can handle 10x traffic
- [ ] Database queries optimized
- [ ] No N+1 query problems
- [ ] Caching strategy in place
- [ ] Image optimization pipeline ready

**Tools:** Load testing (K6, Artillery)

### 10.3 Content Pipeline Ready
- [ ] Editorial workflow documented
- [ ] Freelance journalist process defined
- [ ] Content templates created
- [ ] SEO guidelines documented

**Status:** Documented in PROGRAMMATIC_SEO_STRATEGY_FINAL.md

---

## 11. Backup & Recovery

### 11.1 Backup Systems
- [ ] Daily Sanity backups running
- [ ] Backups stored in Google Drive
- [ ] Backup restoration tested
- [ ] GitHub repo has recent commits
- [ ] Environment variables documented

**Tools:** GitHub Actions (sanity-backup.yml)

### 11.2 Disaster Recovery
- [ ] Can rollback Vercel deployment
- [ ] Can restore Sanity data from backup
- [ ] Know how to restore env vars
- [ ] Incident response plan documented

**Tools:** DEVELOPMENT_WORKFLOW.md

---

## 12. Legal & Compliance

### 12.1 Privacy & Policies
- [ ] Privacy Policy page exists
- [ ] Terms of Service page exists
- [ ] Cookie consent (if required by jurisdiction)
- [ ] GDPR compliance (if serving EU users)
- [ ] No data collection without consent

**Status:** TO BE VERIFIED

### 12.2 Copyright & Attribution
- [ ] All images properly licensed
- [ ] No copyright violations
- [ ] Attribution for third-party content
- [ ] API usage within license terms (Sanity, Wikidata, SEC)

**Status:** TO BE VERIFIED

---

## Test Execution Plan

### Phase 1: Automated Testing (30 minutes)
1. Run production smoke test script
2. Run Lighthouse audits (desktop + mobile)
3. Run PageSpeed Insights
4. Check Google Search Console for errors
5. Validate structured data with Google tool

### Phase 2: Manual Frontend Testing (1 hour)
1. Test homepage on desktop + mobile
2. Test 5 random article pages
3. Test category pages
4. Test search functionality
5. Check for console errors
6. Test on real mobile device (iPhone/Android)

### Phase 3: Backend & API Testing (30 minutes)
1. Test all API endpoints with curl
2. Review Vercel logs for errors
3. Test Sanity Studio functionality
4. Verify backups running

### Phase 4: SEO & Accessibility (45 minutes)
1. Check robots.txt and sitemaps
2. Verify meta tags on 10 pages
3. Test keyboard navigation
4. Run WAVE accessibility scan
5. Test social sharing previews

### Phase 5: Cross-Browser Testing (30 minutes)
1. Test on Chrome, Firefox, Safari (desktop)
2. Test on iPhone Safari
3. Test on Android Chrome

### Phase 6: Report & Recommendations (30 minutes)
1. Document all issues found
2. Prioritize fixes (critical, high, medium, low)
3. Create action items
4. Update this document with results

**Total estimated time: 3.5-4 hours**

---

## Success Criteria

Site is ready for programmatic SEO work if:
- ✅ Zero critical issues
- ✅ <5 high-priority issues
- ✅ Lighthouse Performance >85 (mobile)
- ✅ Lighthouse SEO = 100
- ✅ Lighthouse Accessibility >90
- ✅ All API endpoints functioning
- ✅ Mobile-responsive on all tested devices
- ✅ No console errors on key pages
- ✅ Google Analytics tracking correctly
- ✅ Core Web Vitals pass

---

## Test Results Documentation

### Test Run #1 - [DATE]

**Tester:** [NAME]

**Results Summary:**
- Critical Issues: [NUMBER]
- High Priority: [NUMBER]
- Medium Priority: [NUMBER]
- Low Priority: [NUMBER]

**Pass/Fail:** [PASS/FAIL]

**Detailed findings:** [Link to issues or inline documentation]

---

## Next Steps After Testing

1. Fix all critical issues immediately
2. Schedule high-priority fixes within 1 week
3. Track medium/low-priority issues in backlog
4. Re-test after fixes applied
5. Proceed with programmatic SEO implementation once all critical/high issues resolved
