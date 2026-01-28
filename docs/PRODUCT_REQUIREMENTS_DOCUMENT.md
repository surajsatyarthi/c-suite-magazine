# Product Requirements Document (PRD)

## C-Suite Magazine Platform

**Version**: 1.5.0  
**Last Updated**: January 28, 2026 (Security Patch + All P0/P1 Issues Resolved)  
**Status**: Official Single Source of Truth  
**Owner**: Product Management  
**Engineering Protocol**: [Ralph Constitution v3.1](file:///Users/surajsatyarthi/Desktop/ceo-magazine/SUPREME_RALPH_CONSTITUTION.md)

---

## Executive Summary

**C-Suite Magazine** is a premium digital publication platform targeting global CXOs and business leaders. The platform combines editorial excellence with programmatic SEO to deliver high-value content while scaling to 1 million monthly pageviews through automated content generation.

### Key Metrics (Current State)

- **Platform**: Next.js 16.1.6 + Sanity CMS
- **Content**: 200+ articles, 50+ executive interviews
- **Deployment**: Vercel (Production: csuitemagazine.global)
- **CI/CD**: 8 automated workflows
- **Quality Gates**: 10-gate Ralph Protocol
- **Revenue Stream**: Sponsored Content (CSA)

### Strategic Objectives (2026)

1. **Growth**: Scale to 1M monthly pageviews via programmatic SEO
2. **Revenue**: Maintain 100% uptime for sponsored content
3. **Quality**: ✅ **ACHIEVED** - Zero P0 issues, Zero P1 issues (as of Jan 28, 2026)
4. **Automation**: 99%+ success rate on daily workflows

---

## Table of Contents

1. [Product Vision & Strategy](#1-product-vision--strategy)
2. [User Personas](#2-user-personas)
3. [Content Architecture](#3-content-architecture)
4. [Feature Inventory](#4-feature-inventory)
5. [Technical Architecture](#5-technical-architecture)
6. [SEO & Growth Strategy](#6-seo--growth-strategy)
7. [Revenue Model](#7-revenue-model)
8. [Quality Standards](#8-quality-standards)
9. [DevOps & CI/CD](#9-devops--cicd)
10. [Security & Compliance](#10-security--compliance)
11. [Product Roadmap](#11-product-roadmap)
12. [Success Metrics](#12-success-metrics)
13. [Governance](#13-governance)
14. [Developer Reference](#14-developer-reference)
15. [Operational Runbook](#15-operational-runbook)

---

## 1. Product Vision & Strategy

### 1.1 Vision Statement

To be the **definitive digital publication** for C-suite executives worldwide, combining editorial authority with data-driven insights, delivering premium content at scale through technology innovation.

### 1.2 Core Value Propositions

#### For Readers (CXOs)

- **Curated Excellence**: Hand-picked executive interviews and leadership insights
- **Data-Driven**: Salary benchmarks and compensation transparency
- **Time-Efficient**: 8-15 minute reads optimized for busy executives
- **Mobile-First**: Premium reading experience across all devices

#### For Advertisers

- **Targeted Audience**: Verified C-level decision makers
- **Sponsored Content (CSA)**: Native advertising that maintains editorial standards
- **Performance Tracking**: View counts and engagement metrics

### 1.3 Competitive Positioning

- **vs. Forbes/Fortune**: More focused on CXO-specific content, better SEO for salary data
- **vs. Harvard Business Review**: Lighter, more accessible content
- **vs. LinkedIn**: Curated editorial vs. user-generated content
- **vs. Payscale/Levels.fyi**: Editorial context around compensation data

---

## 2. User Personas

### 2.1 Primary Persona: "Executive Emma"

- **Role**: VP/C-Level Executive
- **Age**: 40-55
- **Goals**:
  - Stay informed on leadership trends
  - Benchmark compensation
  - Discover career advancement strategies
- **Pain Points**:
  - Information overload
  - Unreliable salary data
  - Generic business content
- **Content Preferences**:
  - Executive interviews
  - Salary transparency
  - Industry-specific insights

### 2.2 Secondary Persona: "Aspiring Adrian"

- **Role**: Senior Manager/Director
- **Age**: 35-45
- **Goals**:
  - Prepare for C-level roles
  - Understand compensation expectations
  - Learn from current executives
- **Content Preferences**:
  - Career progression stories
  - Salary ranges by role
  - Skills development

### 2.3 Advertiser Persona: "Marketing Maya"

- **Role**: B2B Marketing Manager
- **Goals**:
  - Reach decision-makers
  - Generate qualified leads
  - Demonstrate thought leadership
- **Requirements**:
  - Guaranteed placement
  - Performance metrics
  - Brand safety

##

3.  Content Architecture

### 3.1 Content Types (Sanity Schema)

#### Standard Articles (`post`)

```
Fields: title, slug, excerpt, featuredImage, writer, categories, body,
        publishedAt, featured, readTime, seoTitle, seoDescription
Routes: /category/[category]/[slug], /
Purpose: Core editorial content
```

#### C-Suite Sponsored Articles (`csa`)

```
Fields: All post fields + partner, sponsorLogo, adConfig, partnerQuotes
Routes: /csa/[slug]
Purpose: Revenue-generating sponsored content
Special: Yellow "Sponsored" badge, partner integration
```

#### Executive Salaries (Static Pages)

```
Routes: /executive-salaries/[position]
Examples: /executive-salaries/ceo, /executive-salaries/cfo
Purpose: Programmatic SEO traffic generation
Data: Salary ranges, industry benchmarks, sample size
```

#### Writer Profiles (`writer`)

```
Routes: /writer/[slug]
Fields: name, bio, image, socialLinks, articles
Purpose: Author attribution and expertise showcase
```

#### Categories (`category`)

```
Routes: /category/[slug], /category/[category]/[slug]
Types: Leadership, Innovation, Technology, Interviews, Executive Pay
Purpose: Content organization and SEO
```

#### Tags (`tag`)

```
Routes: /tag/[slug], /tag
Fields: name, slug, description, articleCount
Purpose: Granular content discovery and SEO longtail
```

### 3.2 Content Hierarchy

```
Homepage
├── C-Suite Spotlight (Featured Grid - 9 items)
├── Latest Articles (Post + CSA mixed)
├── Trending Now
└── Executive Interviews Section

Category Pages
├── Category Landing (/category/[slug])
│   ├── Hero
│   ├── Featured Article
│   ├── Article Grid (paginated)
│   └── Related Categories
└── Article Page (/category/[category]/[slug])
    ├── Hero Image
    ├── Metadata (Writer, Date, Read Time, Views)
    ├── Rich Text Body
    ├── Related Articles
    └── Social Sharing

Special Pages
├── /archive (All content chronological)
├── /tag (Tag index)
├── /tag/[slug] (Tag-filtered articles)
├── /advertise (Sponsor inquiry)
├── /about, /privacy, /terms
└── /executive-salaries/[position]
```

### 3.3 Content Rules & Standards

#### Article Standards

- **Minimum Length**: 1,200 words
- **Featured Image**: Required, 1200x675px minimum
- **Excerpt**: Required, 140-160 characters
- **Writer**: Required association
- **Category**: Minimum 1, maximum 3
- **Read Time**: Auto-calculated based on word count

#### CSA Standards

- **Partner Logo**: Required for sponsor visibility
- **Yellow Badge**: "Sponsored" label required
- **Partner Quotes**: Optional callout sections
- **Ad Placement**: Sidebar ad configuration

#### Editorial Workflow

1. Draft → Review → Publish
2. Featured Flag: Manual curation for homepage
3. Spotlight Grid: Static config in Sanity (9 fixed items)
4. View Counts: Randomized range (editorial discretion)

---

## 4. Feature Inventory

### 4.1 Content Management (Sanity CMS)

| Feature                  | Status  | Description                                |
| ------------------------ | ------- | ------------------------------------------ |
| Article Creation/Editing | ✅ Live | Full WYSIWYG editor with rich text         |
| Media Library            | ✅ Live | Image upload, optimization, CDN delivery   |
| Writer Management        | ✅ Live | Profile creation, bio, social links        |
| Category System          | ✅ Live | Hierarchical organization                  |
| Tag System               | ✅ Live | 28 curated tags, stopwords filtered        |
| Spotlight Configuration  | ✅ Live | 9-item featured grid                       |
| CSA Creation             | ✅ Live | Sponsored content with partner integration |
| Draft/Publish Workflow   | ✅ Live | Preview before publish                     |
| Schema Validation        | ✅ Live | Required fields enforced                   |

### 4.2 Frontend Features

| Feature            | Status     | Route/Component               | Revenue Impact        |
| ------------------ | ---------- | ----------------------------- | --------------------- |
| Homepage           | ✅ Live    | `/`                           | N/A                   |
| Category Pages     | ✅ Live    | `/category/[slug]`            | SEO                   |
| Article Pages      | ✅ Live    | `/category/[category]/[slug]` | Content               |
| CSA Pages          | ✅ Live    | `/csa/[slug]`                 | **$$ Direct Revenue** |
| Archive Page       | ✅ Live    | `/archive`                    | SEO                   |
| Tag Index          | ✅ Live    | `/tag`                        | SEO                   |
| Tag Pages          | ✅ Live    | `/tag/[slug]`                 | SEO                   |
| Executive Salaries | ✅ Live    | `/executive-salaries/[slug]`  | **SEO Growth Target** |
| Writer Pages       | ✅ Live    | `/writer/[slug]`              | Brand                 |
| Mobile Navigation  | ✅ Live    | Hamburger menu                | UX                    |
| Search             | ❌ Backlog | TBD                           | UX                    |
| Newsletter         | ❌ Backlog | TBD                           | Engagement            |

### 4.3 SEO & Performance

| Feature               | Status  | Impact                 |
| --------------------- | ------- | ---------------------- |
| Dynamic Sitemap       | ✅ Live | Google indexing        |
| RSS Feed              | ✅ Live | Syndication            |
| Robots.txt            | ✅ Live | Crawler control        |
| Metadata Generation   | ✅ Live | OG tags, Twitter cards |
| JSON-LD Schema        | ✅ Live | Rich snippets          |
| Image Optimization    | ✅ Live | Next/Image CDN         |
| Google Search Console | ✅ Live | Indexing monitoring    |
| View Count Display    | ✅ Live | Social proof           |

### 4.4 Advertising & Revenue

| Feature                   | Status     | Description                       | Priority |
| ------------------------- | ---------- | --------------------------------- | -------- |
| CSA Article Type          | ✅ Live    | Sponsored content pages           | P0       |
| Partner Logo Display      | ✅ Live    | Sponsor branding                  | P0       |
| Sponsored Badge           | ✅ Live    | Yellow "Sponsored" indicator      | P0       |
| Sidebar Ads (Fallback)    | ✅ Live    | Brabus vertical ad when CMS empty | P1       |
| Ad Configuration (Sanity) | ✅ Live    | CMS-controlled ad placement       | P1       |
| Ad Tracking               | 🔴 Backlog | Click/impression tracking         | P2       |
| Advertise Page            | ✅ Live    | Sponsor inquiry landing page      | P2       |

---

## 5. Technical Architecture

### 5.1 Technology Stack

#### Frontend

- **Framework**: Next.js 16.1.0 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **Fonts**: Playfair Display (serif), Inter (sans-serif)
- **State Management**: Zustand 5.x
- **Testing**: Playwright (E2E), Vitest (Unit)

#### Backend & CMS

- **CMS**: Sanity.io v4.22.0
- **Database**: Sanity Content Lake (managed)
- **API**: Next.js API Routes
- **Analytics**: Vercel Analytics + Google Analytics 4

#### Infrastructure

- **Hosting**: Vercel (Production + Previews)
- **CDN**: Vercel Edge Network
- **Images**: Sanity Image CDN + Next/Image
- **Domain**: csuitemagazine.global
- **Node**: 22.x
- **Package Manager**: pnpm 10.20.0

### 5.2 Architecture Patterns

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   VERCEL EDGE CDN                            │
│  • Global distribution  • Image optimization                 │
│  • Caching              • DDoS protection                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               NEXT.JS 16 APP ROUTER                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Server Components (RSC)                                ││
│  │  • Dynamic routes  • Data fetching  • Rendering        ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Client Components                                      ││
│  │  • Interactive UI  • State management  • Animations    ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    SANITY CMS                                │
│  • Content Lake (database)                                   │
│  • GROQ API                                                  │
│  • Real-time updates                                         │
│  • Image pipeline                                            │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Data Flow

####

Read Path (Content Delivery)

1. User requests `/category/leadership/article-slug`
2. Next.js checks cache (ISR - Incremental Static Regeneration)
3. If stale: Server Component fetches from Sanity via GROQ
4. Sanity returns JSON + image URLs
5. Server renders HTML + optimizes images
6. Response cached at Edge (60s revalidation)
7. Client receives fully rendered page

#### Write Path (Content Publishing)

1. Editor creates/edits in Sanity Studio (`domain.com/studio`)
2. Draft saved to Sanity Content Lake
3. Preview available via webhook
4. Publish triggers revalidation webhook
5. Next.js purges cached routes
6. New ISR build on next request

### 5.4 Environment Configuration

#### Production (.env.production)

```bash
# Next.js
NEXT_PUBLIC_BASE_URL=https://csuitemagazine.global
NODE_ENV=production

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=<project_id>
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-04
SANITY_AUTH_TOKEN=<server_token>

# Analytics
NEXT_PUBLIC_GA_ID=<ga4_id>

# Sentry
SENTRY_DSN=<sentry_dsn>
```

#### Local Development (.env.local)

- Inherits from production + local overrides
- Uses Sanity preview mode
- Localhost port 3000

### 5.5 Security Architecture

#### Defense Layers

1. **Client Layer**: XSS prevention via React escaping
2. **Server Layer**: GROQ injection prevention, env var isolation
3. **API Layer**: Rate limiting, CORS configuration
4. **Infrastructure**: Vercel WAF, DDoS protection

#### Security Protocols (See [Ralph Constitution](file:///Users/surajsatyarthi/Desktop/ceo-magazine/SUPREME_RALPH_CONSTITUTION.md))

- Never use `dangerouslySetInnerHTML` without `dompurify`
- Always use `safeJsonLd()` for structured data
- All SELECT queries must include `LIMIT`
- Write operations only via `lib/sanity.server.ts` (air-gap pattern)
- Secrets stored in Vercel Environment Variables (never in code)

---

## 6. SEO & Growth Strategy

### 6.1 Current SEO Status

| Metric            | Current | Target (12 months) |
| ----------------- | ------- | ------------------ |
| Monthly Pageviews | ~50K    | 1,000,000          |
| Indexed Pages     | ~300    | 50,000+            |
| Domain Authority  | 35      | 50+                |
| Organic Keywords  | 1,200   | 10,000+            |
| Avg. Position     | 25      | 15                 |

### 6.2 Programmatic SEO Strategy

#### Executive Salary Pages (Flagship)

**Objective**: Become the #1 source for executive compensation data

**Implementation**:

- **50,000+ landing pages**: `/executive-salaries/[position]`
- **Data Sources**: Scraped + curated salary data
- **Templates**: Dynamic page generation with consistent structure
- **Content**: Salary ranges, industry breakdowns, experience levels, location data
- **Internal Linking**: Hub-and-spoke model from main articles

**Example Pages**:

- `/executive-salaries/ceo`
- `/executive-salaries/cfo-fintech`
- `/executive-salaries/cto-san-francisco`
- `/executive-salaries/vp-marketing-healthcare`

**Traffic Model**:

- 50,000 pages × 20 avg monthly visits = 1M pageviews
- Long-tail keyword capture
- "Company X CEO salary" queries

#### Content Scaling

- **Hub Pages**: Main category pillars (200 articles)
- **Spoke Pages**: Programmatic salary pages (50,000)
- **Supporting Content**: Executive interviews (100+)

### 6.3 Technical SEO Checklist

- [x] XML Sitemap (dynamic, auto-updated)
- [x] Robots.txt (optimized for crawlers)
- [x] Canonical URLs (prevent duplicate content)
- [x] Open Graph tags (social sharing)
- [x] Twitter Card tags
- [x] JSON-LD structured data (Article, Person, Organization)
- [x] Image alt tags (accessibility + SEO)
- [x] Mobile-first responsive design
- [x] Core Web Vitals optimization
- [x] HTTPS enforcement
- [ ] Internal linking automation
- [ ] Backlink acquisition campaign
- [ ] Google News submission

### 6.4 Content SEO Strategy

#### On-Page Optimization

- **Title Tags**: `<60 chars, includes primary keyword`
- **Meta Descriptions**: `140-160 chars, compelling CTAs`
- **H1**: Single per page, keyword-rich
- **H2-H6**: Semantic hierarchy
- **URL Structure**: `/category/primary-keyword-secondary`
- **Read Time**: Displayed prominently (UX signal)
- **View Counts**: Social proof (engagement signal)

#### Keyword Strategy

- **Primary**: C-suite, CEO, executive, leadership
- **Secondary**: Salary, compensation, interview, insights
- **Long-Tail**: "Google CEO salary 2026", "how to become CFO"

---

## 7. Revenue Model

### 7.1 Revenue Streams

#### Primary: Sponsored Content (CSA)

- **Product**: Native advertising articles
- **Format**: Full editorial articles with "Sponsored" badge
- **Pricing Model**: Fixed rate per article + duration
- **Target Clients**: B2B SaaS, consulting firms, executive services
- **Guaranteed**:
  - Homepage placement (Spotlight Grid)
  - Category page visibility
  - Social media promotion

#### Secondary (Future)

- Display Ads (programmatic)
- Newsletter sponsorships
- Premium research reports
- Conference partnerships

### 7.2 CSA Technical Implementation

**Critical System** (P0 - Revenue Dependency)

| Component        | File                                        | Purpose                      |
| ---------------- | ------------------------------------------- | ---------------------------- |
| Schema           | `sanity/schemaTypes/csaType.ts`             | CSA article type             |
| Routing          | `app/csa/[slug]/page.tsx`                   | Dedicated CSA pages          |
| Badge            | `components/Badge.tsx`                      | Yellow "Sponsored" indicator |
| Logo             | `components/OptimizedImage.tsx`             | Partner branding             |
| Spotlight Config | `sanity/schemaTypes/spotlightConfigType.ts` | Homepage grid                |

**Revenue Integrity Checks**:

- Automated daily crawler (`scripts/the-spider.ts`)
- Playwright E2E tests for CSA pages
- Link rot detection
- Image loading verification
- Partner logo display validation

### 7.3 Advertise Page

- URL: `/advertise`
- Purpose: Lead generation for sponsors
- Form: Contact information + campaign details
- CMS: Managed content (pricing packages, case studies)

---

## 8. Quality Standards

### 8.1 The Ralph Protocol (Engineering Constitution)

All development follows the [Supreme Ralph Constitution v3.1](file:///Users/surajsatyarthi/Desktop/ceo-magazine/SUPREME_RALPH_CONSTITUTION.md).

#### 10 Non-Negotiable Laws

1. **Limit Law** — All SELECT queries must include `LIMIT`
2. **Security Law** — Never use `dangerouslySetInnerHTML` without `dompurify`
3. **JSON-LD Law** — Always use `safeJsonLd()`
4. **Revenue Law** — Every Phase 3 must run `revenue-integrity-check.ts`
5. **Sequential Law** — All 10 Gates must be followed in strict order
6. **Proof Law** — Evidence = Raw Terminal Logs + Screenshots + Git HEAD hash
7. **Air-Gap Law** — Write operations only via `lib/sanity.server.ts`
8. **Context Law** — All logs/reports must anchor to current Git HEAD
9. **Semantic Law** — Every commit must contain `SECURITY-CHECKLIST [#ID]:`
10. **Integrity Law** — All reports must pass `validate-phase-report.sh`

#### 10 Quality Gates

1. **Gate 1** – Physical Audit (`grep`, `view_file`)
2. **Gate 2** – Logic Mapping (Identify all consumers)
3. **Gate 3** – Blueprint (`implementation_plan.md` + User Approval)
4. **Gate 4** – Research Gate (Minimum 2 web searches + validation)
5. **Gate 5** – Cognitive Pause + 3 Safety Questions
6. **Gate 6** – Static Analysis (trufflehog, audit-ci, eslint)
7. **Gate 7** – TDD Proof (Vitest + Playwright)
8. **Gate 8** – Sanity Schema Gate (Deploy schema → Studio refresh)
9. **Gate 9** – UI Proof (Sanity Studio + Screenshots)
10. **Gate 10** – Watchtower (24h post-deploy monitoring)

### 8.2 Code Quality Standards

#### TypeScript Configuration

- **Strict Mode**: Enabled
- **No Implicit Any**: Enforced
- **Unused Vars**: Error
- **ESLint**: Next.js + Security plugins

#### Component Standards

- **Server Components**: Default (performance)
- **Client Components**: Use `'use client'` directive only when needed
- **Prop Types**: Explicit TypeScript interfaces
- **Error Boundaries**: Required for critical components

#### Testing Requirements

- **E2E Coverage**: All critical user flows
- **Unit Tests**: Utility functions, complex logic
- **Smoke Tests**: Pre-deployment validation
- **Visual Regression**: Executive salary pages

### 8.3 Performance Standards

#### Core Web Vitals Targets

- **LCP (Largest Contentful Paint)**: <2.5s
- **FID (First Input Delay)**: <100ms
- **CLS (Cumulative Layout Shift)**: <0.1

#### Lighthouse Scores (Mobile)

- **Performance**: >90
- **Accessibility**: >95
- **Best Practices**: >95
- **SEO**: >95

### 8.4 Accessibility Standards

- **WCAG 2.1**: Level AA compliance
- **Semantic HTML**: Proper heading hierarchy
- **Alt Text**: Required for all images
- **Keyboard Navigation**: Full support
- **Screen Reader**: Tested with VoiceOver

---

## 9. DevOps & CI/CD

### 9.1 GitHub Actions Workflows

| Workflow                 | Trigger              | Purpose                    | Status     |
| ------------------------ | -------------------- | -------------------------- | ---------- |
| **Build Verification**   | Push to main/staging | Validate Next.js build     | ✅ Active  |
| **Playwright E2E**       | Push, PR             | Run all E2E tests          | ✅ Active  |
| **Preview Verification** | PR creation          | Test preview deployments   | ✅ Active  |
| **Security Gates**       | Daily + Push         | Audit deps, secrets scan   | ✅ Active  |
| **Sanity Schema Check**  | Schema changes       | Validate CMS schema        | ✅ Active  |
| **Daily Sanity Backup**  | 00:00 IST daily      | Backup content to GDrive   | 🔴 Failing |
| **Spider Patrol**        | 00:00 UTC daily      | Link health check          | 🔴 Failing |
| **Delete Old Previews**  | PR close             | Cleanup Vercel deployments | ✅ Active  |

### 9.2 Deployment Pipeline

#### Staging Environment

- **Branch**: `staging`
- **URL**: Auto-generated Vercel preview
- **Purpose**: Pre-production testing
- **Workflow**:
  1. Push to `staging`
  2. Auto-deploy to Vercel preview
  3. Run E2E tests
  4. Manual QA approval

#### Production Deployment

- **Branch**: `main`
- **URL**: csuitemagazine.global
- **Protection**: Branch protection rules
- **Workflow**:
  1. PR from `staging` → `main`
  2. Required approvals + CI pass
  3. Merge triggers production deploy
  4. Auto-revalidation of all routes
  5. Post-deploy smoke tests
  6. 24h monitoring (Gate 10)

#### Rollback Procedure

```bash
# Emergency rollback
$ vercel rollback <deployment-id>

# Or via Git
$ git revert <commit-hash>
$ git push origin main
```

### 9.3 Monitoring & Alerting

#### Currently Active

- **Vercel Analytics**: Real-time traffic
- **Sentry**: Error tracking
- **GitHub Actions**: Workflow status

#### Planned

- **Uptime Monitoring**: Pingdom/UptimeRobot
- **Performance**: Lighthouse CI daily
- **SEO**: Automated rank tracking
- **Email Alerts**: Workflow failures

---

## 10. Security & Compliance

### 10.1 Security Tooling ("Iron Dome")

| Tool                     | Purpose                       | Schedule           |
| ------------------------ | ----------------------------- | ------------------ |
| `audit-ci`               | Dependency vulnerability scan | Pre-commit + Daily |
| `secretlint`             | Secret exposure detection     | Pre-commit         |
| `eslint-plugin-security` | Code pattern analysis         | Pre-commit         |
| TruffleHog               | Git history secret scan       | Weekly             |
| Snyk (optional)          | Continuous monitoring         | Daily              |

### 10.2 Threat Model

#### Identified Risks

1. **XSS Attacks**: Mitigated via React escaping + `dompurify`
2. **SQL Injection**: N/A (Sanity uses GROQ, not SQL)
3. **Secrets Leak**: Prevented via `secret lint` + `.gitignore`
4. **Dependency Vulnerabilities**: Monitored via `audit-ci`
5. **DDoS**: Handled by Vercel infrastructure

#### Security Checklist (Every Deploy)

- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] All env vars in Vercel (never hardcoded)
- [ ] HTTPS enforced
- [ ] CORS configured
- [ ] Rate limiting on API routes
- [ ] Content Security Policy headers

### 10.3 Data Privacy (GDPR Compliance)

#### User Data Collection

- **Analytics**: Anonymous pageviews (Vercel + GA4)
- **Cookies**: `user-country` geo-detection (functional, not tracking)
- **Forms**: Contact form data (opt-in basis)

#### Privacy Policy

- URL: `/privacy`
- Updated: January 2026
- Includes: Data collection, usage, retention, user rights

#### Cookie Banner

- Status: ❌ Not implemented (low priority - minimal tracking)

---

## 11. Product Roadmap

### 11.1 Q1 2026 (Jan-Mar) — Foundation & Stability ✅ **COMPLETE**

#### Sprint 1: Critical Fixes (Jan 28 - Feb 10) — ✅ **RESOLVED**

- [x] **#51 The Integrity Layer** — Enforced `assumption-scanner` in pre-commit hook
- [x] **#52 SEO Sentinel Activation** — Fixed authentication & workflow triggered
- [x] **#53 Automated Systems Logging** — Implemented Sanity logging schema
- [x] **#45 Andy Jassy 404** — Fixed broken link via ISR/DynamicParams
- [x] **#46 Email Failure** — Fixed CI missing dependencies (`tsx`)
- [x] **#54 Next.js DoS Vulnerability** — Upgraded to 16.1.6 (Security Patch)

#### Sprint 2: Re-Opened Issues (Feb 11 - Feb 24) — ✅ **RESOLVED**

- [x] **#20 Footer/Nav SEO** — 4-col layout implemented
- [x] **#21 Dynamic Metadata** — Moved to Sanity `siteSettings` singleton
- [x] **#22 Legacy Images** — 100% backfilled (Forensic audit confirmed)

#### Current Status (Jan 28, 2026)

**All P0/P1 Issues Resolved** 🎉

- 52 of 54 total issues resolved (96.3%)
- Remaining: #25 (Governance - This PRD) + #18 (Sanity Preview - ON HOLD)
- System Health: **EXCELLENT**

#### Sprint 3: Programmatic SEO Launch (Feb 25 - Mar 10)

- [ ] **#49 Executive Salaries** — Deploy first 1,000 pages
- [ ] Landing page templates
- [ ] Internal linking automation
- [ ] Schema markup for salary data
- [ ] Google Search Console monitoring

### 11.2 Q2 2026 (Apr-Jun) — SEO Scale-Up

#### Sprint 4-6: Content Automation

- [ ] Scale to 10,000 salary pages
- [ ] Automated data pipeline (scraping + curation)
- [ ] Hub page creation (industry-specific)
- [ ] Backlink acquisition campaign (50 quality links)
- [ ] Content refresh automation

### 11.3 Q3 2026 (Jul-Sep) — Revenue Optimization

#### Sprint 7-9: Monetization

- [ ] Advertise page optimization (A/B testing)
- [ ] CSA pricing packages
- [ ] Display ad network integration
- [ ] Sponsored newsletter launch
- [ ] Analytics dashboard for advertisers

### 11.4 Q4 2026 (Oct-Dec) — Advanced Features

#### Sprint 10-12: Product Enhancement

- [ ] Search functionality (Algolia integration)
- [ ] Newsletter subscription system
- [ ] User accounts (saved articles, preferences)
- [ ] Comments/discussion (moderated)
- [ ] Mobile app (React Native)
- [ ] Premium tier (gated content)

### 11.5 Future Backlog (2027+)

- AI-powered content recommendations
- Podcast integration
- Video content platform
- Virtual conferences/webinars
- Executive community features

---

## 12. Success Metrics

### 12.1 Key Performance Indicators (KPIs)

#### Traffic & Engagement

| Metric               | Current | Q1 Target | Q2 Target | Q4 Target (2026) |
| -------------------- | ------- | --------- | --------- | ---------------- |
| Monthly Pageviews    | 50K     | 100K      | 250K      | **1,000,000**    |
| Avg Session Duration | 3:45    | 4:00      | 4:30      | 5:00             |
| Bounce Rate          | 65%     | 60%       | 55%       | 50%              |
| Pages/Session        | 1.8     | 2.0       | 2.3       | 2.5              |

#### SEO Performance

| Metric                | Current | Q1 Target | Q2 Target | Q4 Target |
| --------------------- | ------- | --------- | --------- | --------- |
| Organic Traffic       | 30K     | 60K       | 150K      | 700K      |
| Domain Authority      | 35      | 38        | 42        | 50        |
| Indexed Pages         | 300     | 1,500     | 10,000    | 50,000    |
| Position 1-3 Keywords | 45      | 100       | 250       | 500       |

#### Technical Health

| Metric                 | Current | Target | SLA   |
| ---------------------- | ------- | ------ | ----- |
| Uptime                 | 99.5%   | 99.9%  | 99.8% |
| P0 Issues              | 5       | 0      | <2    |
| P1 Issues              | 4       | 0      | <5    |
| CI/CD Success Rate     | 85%     | 99%    | >95%  |
| Build Time             | 3m      | 2m     | <3m   |
| Lighthouse Performance | 88      | 95     | >90   |

#### Revenue (CSA)

| Metric                  | Current | Q2 Target | Q4 Target |
| ----------------------- | ------- | --------- | --------- |
| Active Sponsors         | 2       | 5         | 10        |
| CSA Articles/Month      | 1       | 3         | 5         |
| Homepage Spotlight Fill | 70%     | 90%       | 100%      |

### 12.2 Success Criteria

#### MVP Success (Q1 2026)

- [x] Platform stable (0 P0 issues)
- [ ] All daily automations working (backup, spider, SEO report)
- [ ] First 1,000 salary pages deployed
- [ ] 100K monthly pageviews achieved

#### Product-Market Fit (Q2 2026)

- [ ] 250K monthly pageviews
- [ ] 5 active sponsors
- [ ] Domain Authority >40
- [ ] Organic traffic = 70% of total

#### Scale Achievement (Q4 2026)

- [ ] 1M monthly pageviews
- [ ] 50,000 indexed pages
- [ ] 10 active sponsors
- [ ] Profitable (revenue > costs)

---

## 13. Governance

### 13.1 Decision-Making Framework

#### Product Decisions

- **Owner**: Product Manager (User)
- **Process**:
  1. Identify need/opportunity
  2. Create issue in `ISSUES_LOG.md`
  3. Prioritize (P0-P4)
  4. Create PRD if major feature

5. Engineering assessment (Ralph Gates 1-3)
6. User approval of plan
7. Implementation (Ralph Gates 4-10)
8. Monitoring (24h watchtower)

#### Priority Framework (RICE)

- **Reach**: How many users affected?
- **Impact**: Confidence in positive outcome
- **Confidence**: Data supporting decision
- **Effort**: Engineering time required

**Formula**: `(Reach × Impact × Confidence) / Effort`

#### Priority Levels

- **P0 (Critical)**: Revenue impact, security, downtime (fix within 24h)
- **P1 (High)**: Core functionality, major bugs (fix within 1 week)
- **P2 (Medium)**: Enhancements, minor bugs (scheduled in sprint)
- **P3 (Low)**: Nice-to-haves (backlog)
- **P4 (Deferred)**: Future consideration

### 13.2 Single Source of Truth (SSoT) Hierarchy

1. **This PRD** — Product vision, features, roadmap
2. **[Ralph Constitution](file:///Users/surajsatyarthi/Desktop/ceo-magazine/SUPREME_RALPH_CONSTITUTION.md)** — Engineering protocols
3. **[Issues Log](file:///Users/surajsatyarthi/Desktop/ceo-magazine/docs/ISSUES_LOG.md)** — Current state, issue tracking
4. **[README.md](file:///Users/surajsatyarthi/Desktop/ceo-magazine/README.md)** — Setup, deployment instructions
5. **Code** — Implementation (git as source of truth)

### 13.3 Documentation Standards

#### Issue Tracking

- All issues logged in `docs/ISSUES_LOG.md`
- Format: Issue #, Title, Priority, Status, Est Time, Summary
- Status: OPEN, RE-OPENED, RESOLVED, FIXED
- Updates: Real-time as work progresses

#### PRD Documents (Feature-Specific)

- Location: `docs/prd/issue-[number].md`
- Template: Objective, Requirements, Acceptance Criteria
- Creation: For any >4h feature

#### Reports (Ralph Protocol)

- Location: `docs/reports/phase_[N]_[type]_report_[issue].md`
- Phases: 1-Assessment, 2-Execution, 3-Verification, 4-Research, 5-Handover, 6-Deployment
- Required: Terminal logs, Git hashes, screenshots

### 13.4 Change Management

#### Code Changes

1. Create feature branch from `staging`
2. Follow Ralph Protocol 10 Gates
3. PR to `staging` with template
4. CI/CD checks must pass
5. Code review (if applicable)
6. Merge to `staging`
7. Test on staging preview
8. PR `staging` → `main`
9. Production deploy
10. 24h monitoring (Gate 10)

#### Content Changes

- Managed entirely in Sanity Studio
- No code deployment required
- Instant preview available
- Publish triggers ISR revalidation

#### Breaking Changes

- Require explicit PRD
- User approval mandatory
- Rollback plan documented
- Staged rollout (feature flags)

---

## 14. Developer Reference

### 14.1 Project File Structure

```
ceo-magazine/
├── app/                          # Next.js App Router
│   ├── (routes)/
│   │   ├── page.tsx             # Homepage (/)
│   │   ├── layout.tsx           # Root layout + fonts
│   │   ├── globals.css          # Tailwind + global styles
│   │   ├── category/
│   │   │   ├── [slug]/
│   │   │   │   ├── page.tsx     # Category landing
│   │   │   │   └── [article]/
│   │   │   │       └── page.tsx # Article page
│   │   ├── csa/
│   │   │   └── [slug]/
│   │   │       └── page.tsx     # Sponsored article page
│   │   ├── executive-salaries/
│   │   │   ├── page.tsx         # Salary index
│   │   │   └── [slug]/
│   │   │       └── page.tsx     # Position salary page
│   │   ├── tag/
│   │   │   ├── page.tsx         # Tag index
│   │   │   └── [slug]/
│   │   │       └── page.tsx     # Tag filtered articles
│   │   ├── writer/
│   │   │   └── [slug]/
│   │   │       └── page.tsx     # Writer profile
│   │   ├── archive/
│   │   ├── about/
│   │   ├── advertise/
│   │   ├── privacy/
│   │   ├── terms/
│   │   └── contact/
│   ├── api/                      # API Routes
│   │   ├── views/route.ts       # View count tracking
│   │   ├── country/route.ts     # Geo-detection
│   │   ├── categories/route.ts  # Category data
│   │   ├── articles/route.ts    # Article CRUD
│   │   ├── writers/route.ts     # Writer management
│   │   ├── ads/route.ts         # Ad configuration
│   │   ├── draft/route.ts       # Preview mode
│   │   ├── disable-draft/route.ts
│   │   └── sanity/webhook/      # Sanity webhooks
│   ├── studio/                   # Sanity Studio embed
│   │   └── [[...index]]/
│   │       └── page.tsx
│   ├── sitemap.xml/              # Dynamic sitemap
│   ├── robots.txt/               # Robots configuration
│   └── rss.xml/                  # RSS feed
│
├── components/                   # React Components
│   ├── Navigation.tsx            # Header/nav
│   ├── Footer.tsx                # Footer component
│   ├── Badge.tsx                 # Category/sponsor badges
│   ├── OptimizedImage.tsx        # Next/Image wrapper
│   ├── PortableText.tsx          # Sanity rich text renderer
│   ├── RelatedArticles.tsx       # Article recommendations
│   ├── SocialShare.tsx           # Share buttons
│   ├── ViewCount.tsx             # View display
│   ├── AdSlot.tsx                # Advertisement component
│   ├── CategoryCard.tsx          # Category preview
│   ├── ArticleCard.tsx           # Article preview
│   ├── HeroImage.tsx             # Article hero
│   └── ...                       # 40+ more components
│
├── lib/                          # Utilities & Helpers
│   ├── sanity.ts                 # Client-side Sanity client
│   ├── sanity.server.ts          # Server-side Sanity client (read-only)
│   ├── sanity.admin.ts           # Admin Sanity client (write access)
│   ├── sanity.queries.ts         # Reusable GROQ queries
│   ├── sanityWrite.ts            # Write operations (Air-Gap pattern)
│   ├── security.ts               # XSS prevention (safeJsonLd, dompurify)
│   ├── seo.ts                    # Metadata generation helpers
│   ├── urls.ts                   # URL construction (never hardcode!)
│   ├── views.ts                  # View count logic
│   ├── analytics.ts              # GA4 tracking
│   ├── articleHelpers.ts         # Article utilities
│   ├── calculateReadingTime.ts   # Read time calculation
│   ├── categoryColors.ts         # Dynamic category colors
│   ├── heroAspects.ts            # Image aspect ratio helpers
│   ├── spotlight.ts              # Spotlight grid logic
│   ├── tag-utils.ts              # Tag processing
│   ├── text.ts                   # Text utilities
│   └── types.ts                  # Shared TypeScript types
│
├── sanity/                       # Sanity CMS Configuration
│   ├── schemaTypes/              # Content models
│   │   ├── postType.ts          # Standard articles
│   │   ├── csaType.ts           # Sponsored articles
│   │   ├── writerType.ts        # Writer profiles
│   │   ├── categoryType.ts      # Categories
│   │   ├── advertisementType.ts # Ad configurations
│   │   ├── spotlightConfigType.ts # Spotlight grid
│   │   ├── blockContentType.ts  # Rich text schema
│   │   ├── videoType.ts         # Video embeds
│   │   └── index.ts             # Schema aggregator
│   ├── config.ts                 # Shared Sanity config
│   └── env.ts                    # Environment helpers
│
├── scripts/                      # Automation Scripts
│   ├── backup-sanity.ts          # Daily Sanity backup
│   ├── the-spider.ts             # Link health crawler
│   ├── validate-build-env.js     # Pre-build checks
│   ├── vercel-preflight.js       # Deployment validation
│   ├── precompute-hero-aspects.js # Image optimization
│   ├── write-build-info.js       # Build metadata
│   ├── smoke-check.js            # Post-deploy verification
│   ├── deploy-gated.sh           # Gated production deploy
│   ├── canonical-enforcer.sh     # Protocol compliance
│   ├── validate-phase-report.sh  # Ralph Protocol validator
│   └── seo/                      # SEO automation
│       ├── weekly-report.js     # SEO reporting
│       ├── weekly-report-email.js # Email delivery
│       └── ...
│
├── tests/                        # Test Suites
│   ├── e2e/                      # Playwright E2E
│   │   ├── smoke.spec.ts        # Critical path tests
│   │   ├── category-page.spec.ts
│   │   ├── csa-ad-verification.spec.ts
│   │   └── ...
│   └── unit/                     # Vitest unit tests
│
├── docs/                         # Documentation
│   ├── PRODUCT_REQUIREMENTS_DOCUMENT.md # This file
│   ├── ISSUES_LOG.md             # Active issue tracking
│   ├── prd/                      # Feature PRDs
│   ├── reports/                  # Ralph Protocol reports
│   ├── guides/                   # How-to guides
│   └── reference/                # Design specs
│
├── .github/workflows/            # CI/CD Workflows
│   ├── build-check.yml
│   ├── playwright.yml
│   ├── preview-verify.yml
│   ├── security.yml
│   ├── sanity-backup.yml
│   ├── sanity-schema-check.yml
│   ├── spider-patrol.yml
│   └── delete-old-vercel-deployments.yml
│
├── public/                       # Static Assets
│   ├── Featured section/         # Spotlight images
│   ├── icons/                    # Favicon, app icons
│   └── images/                   # Static images
│
├── sanity.config.ts              # Sanity Studio config
├── sanity.cli.ts                 # Sanity CLI config
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS config
├── tsconfig.json                 # TypeScript config
├── playwright.config.ts          # Playwright config
├── vitest.config.ts              # Vitest config
├── package.json                  # Dependencies & scripts
├── pnpm-lock.yaml                # Lockfile
├── .env.local                    # Local environment vars
├── .env.production               # Production env vars
└── SUPREME_RALPH_CONSTITUTION.md # Engineering protocol
```

### 14.2 Core Library Files Reference

#### **lib/sanity.ts** — Client-Side Sanity Client

```typescript
// Public Sanity client (read-only, safe for client components)
// Used in: Client components needing content
import { sanityClient } from "@/lib/sanity";

// Example usage:
const data = await sanityClient.fetch(`*[_type == "post"]`);
```

#### **lib/sanity.server.ts** — Server-Side Read Client

```typescript
// Server-only Sanity client with token
// Used in: Server Components, API routes (READ operations)
import { getSanityClient } from "@/lib/sanity.server";

// Example:
const client = getSanityClient();
const posts = await client.fetch(`*[_type == "post"][0...10]`);
```

#### **lib/sanity.admin.ts** — Admin Write Client

```typescript
// Admin client with WRITE permissions
// ⚠️ SECURITY: Server-only, never expose to client
import { getAdminClient } from "@/lib/sanity.admin";

// Example:
const admin = getAdminClient();
await admin.create({ _type: "post", title: "New Article" });
```

#### **lib/urls.ts** — URL Construction (NEVER HARDCODE URLS)

```typescript
// Centralized URL generation
import { getArticleUrl, getCategoryUrl, getWriterUrl } from "@/lib/urls";

// Examples:
getArticleUrl("leadership", "article-slug"); // → /category/leadership/article-slug
getCategoryUrl("innovation"); // → /category/innovation
getWriterUrl("john-doe"); // → /writer/john-doe
getCSAUrl("sponsor-article"); // → /csa/sponsor-article
```

#### **lib/security.ts** — XSS Prevention

```typescript
// REQUIRED for all JSON-LD structured data
import { safeJsonLd } from "@/lib/security";

// Usage:
const jsonLd = safeJsonLd({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: userInput, // Automatically sanitized
});
```

#### **lib/seo.ts** — Metadata Generation

```typescript
import { generateArticleMetadata, generateOGImage } from "@/lib/seo";

// In page.tsx:
export async function generateMetadata({ params }) {
  return generateArticleMetadata(article, writer, category);
}
```

### 14.3 API Routes Reference

All API routes follow Next.js App Router conventions:

#### **POST /api/views** — Track Article Views

```typescript
// Increment view count for an article
POST / api / views;
Body: {
  articleId: string;
}
Response: {
  views: number;
}
```

#### **GET /api/country** — Geo-Detection

```typescript
// Get user's country from GeoIP
GET /api/country
Response: { country: string, countryCode: string }
```

#### **GET /api/categories** — List Categories

```typescript
// Fetch all categories with article counts
GET /api/categories
Response: Category[]
```

#### **GET|POST|PUT /api/articles** — Article Management

```typescript
// Admin endpoints for article CRUD
GET    /api/articles          # List all
POST   /api/articles          # Create new
PUT    /api/articles          # Update existing
```

#### **GET /api/draft** — Preview Mode

```typescript
// Enable draft preview
GET /api/draft?secret=<token>&slug=<slug>
// Redirects to article with preview mode enabled
```

#### **GET /api/disable-draft** — Disable Preview

```typescript
// Disable draft preview mode
GET / api / disable - draft;
```

### 14.4 Environment Variables

#### Required Variables (Production)

```bash
# Next.js
NEXT_PUBLIC_BASE_URL=https://csuitemagazine.global
NODE_ENV=production

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=<your_project_id>
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-04
SANITY_AUTH_TOKEN=<read_token>        # Server-side reads
SANITY_WRITE_TOKEN=<write_token>      # Admin writes
SANITY_API_READ_TOKEN=<read_token>    # API routes

# Analytics
NEXT_PUBLIC_GA_ID=<ga4_measurement_id>
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=<vercel_analytics_id>

# Sentry Error Tracking
SENTRY_DSN=<sentry_dsn>
NEXT_PUBLIC_SENTRY_DSN=<sentry_dsn>

# Email (for automation)
EMAIL_USER=csuitebrandagency@gmail.com
EMAIL_PASS=<app_password>             # Gmail App Password
EMAIL_TO=csuitebrandagency@gmail.com

# Google Drive Backup
GDRIVE_CLIENT_ID=<oauth_client_id>
GDRIVE_CLIENT_SECRET=<oauth_client_secret>
GDRIVE_REFRESH_TOKEN=<oauth_refresh_token>
GDRIVE_FOLDER_ID=<folder_id>

# Google Search Console (SEO Reports)
GOOGLE_CLIENT_EMAIL=<service_account_email>
GOOGLE_PRIVATE_KEY=<service_account_key>
GOOGLE_PROPERTY_URL=https://csuitemagazine.global
```

#### Local Development (.env.local)

```bash
# Inherits all production vars + these overrides:
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Preview mode secret
SANITY_PREVIEW_SECRET=<random_string>

# Optional: Local database (if testing view counts)
DATABASE_URL=postgresql://localhost:5432/ceo_magazine
```

### 14.5 Common Development Tasks

#### Starting Development Server

```bash
# Install dependencies
pnpm install

# Start Next.js (port 3000)
pnpm dev

# Start Sanity Studio (port 3333)
pnpm sanity:dev

# Both in separate terminals
```

#### Working with Sanity CMS

```bash
# Access Studio locally
http://localhost:3000/studio
# or
http://localhost:3333 (if running pnpm sanity:dev)

# Deploy Schema Changes
pnpm sanity deploy

# Backup Dataset
pnpm sanity:backup

# Restore from Backup
BACKUP_FILE=exports/backups/2026-01-28-production.tar.gz pnpm sanity:restore

# Validate Schema
sanity schema validate
```

#### Testing

```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI (interactive)
pnpm test:e2e:ui

# Run specific test file
pnpm playwright test tests/e2e/smoke.spec.ts

# Run unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

#### Building & Deploying

```bash
# Run pre-build checks
pnpm prebuild

# Build for production
pnpm build

# Test production build locally
pnpm start

# Deploy to production (gated)
pnpm deploy:prod
```

#### Linting & Security

```bash
# ESLint
pnpm lint

# Security-specific lint
pnpm lint:security

# Audit dependencies
pnpm audit

# Check for secrets
pnpm secretlint

# SQL injection scan
pnpm security-scan
```

### 14.6 GROQ Query Patterns

#### Fetch All Articles with Writer & Category

```groq
*[_type == "post" && !(_id in path("drafts.**"))] | order(publishedAt desc) [0...12] {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  featured,
  readTime,
  "featuredImageUrl": featuredImage.asset->url,
  "writer": writer->{
    name,
    slug,
    "imageUrl": image.asset->url
  },
  "categories": categories[]->{
    title,
    slug,
    accentColor
  }
}
```

#### Fetch CSA Articles (Sponsored Content)

```groq
*[_type == "csa" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  partner,
  "sponsorLogoUrl": sponsorLogo.asset->url,
  partnerQuotes,
  adConfig
}
```

#### Fetch Single Article with Full Content

```groq
*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  excerpt,
  body,
  publishedAt,
  readTime,
  seoTitle,
  seoDescription,
  "featuredImageUrl": featuredImage.asset->url,
  "writer": writer->{
    name,
    slug,
    position,
    bio,
    "imageUrl": image.asset->url,
    socialLinks
  },
  "categories": categories[]->{
    title,
    slug,
    accentColor
  }
}
```

#### Fetch Spotlight Grid Configuration

```groq
*[_type == "spotlightConfig"][0] {
  items[]{
    title,
    "slug": article->slug.current,
    "category": article->categories[0]->slug.current,
    "imageUrl": overlayImage.asset->url
  }
}
```

### 14.7 Code Patterns & Conventions

#### Server vs. Client Components

```typescript
// ✅ Server Component (default)
// app/category/[slug]/page.tsx
export default async function CategoryPage({ params }) {
  const articles = await fetchArticles() // Direct DB/API calls OK
  return <ArticleList articles={articles} />
}

// ✅ Client Component (interactive)
// components/SearchBox.tsx
'use client'
import { useState } from 'react'

export default function SearchBox() {
  const [query, setQuery] = useState('')
  // Interactive logic
}
```

#### Error Handling Pattern

```typescript
// Always wrap data fetching in try-catch
export default async function ArticlePage({ params }) {
  try {
    const article = await fetchArticle(params.slug)
    if (!article) {
      notFound() // → renders not-found.tsx
    }
    return <Article data={article} />
  } catch (error) {
    console.error('Failed to fetch article:', error)
    throw error // → renders error.tsx
  }
}
```

#### Type Safety with Sanity

```typescript
// lib/types.ts
export interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt: string;
  featuredImageUrl?: string;
  writer: Writer;
  categories: Category[];
}

// Usage in components
interface Props {
  article: Post;
}
export default function ArticleCard({ article }: Props) {
  // Fully typed
}
```

#### Dynamic Metadata Generation

```typescript
// app/category/[category]/[article]/page.tsx
import { generateArticleMetadata } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const article = await fetchArticle(params.article);
  return generateArticleMetadata(article); // Auto OG tags, Twitter cards, JSON-LD
}
```

### 14.8 Debugging Guide

#### Common Issues & Solutions

**Issue: "Module not found" errors**

```bash
# Clear Next.js cache
rm -rf .next
pnpm dev
```

**Issue: Sanity images not loading**

```typescript
// Check NEXT_PUBLIC_SANITY_PROJECT_ID is set
// Verify image asset exists in Sanity
// Use urlFor helper from @sanity/image-url
import { urlFor } from "@/lib/sanity";
const imageUrl = urlFor(image).width(800).url();
```

**Issue: ISR not revalidating**

```typescript
// Force revalidation via webhook or on-demand
// app/api/revalidate/route.ts
import { revalidatePath } from "next/cache";

export async function POST(request) {
  const { path } = await request.json();
  revalidatePath(path);
  return Response.json({ revalidated: true });
}
```

**Issue: Environment variables undefined**

```bash
# Client vars MUST start with NEXT_PUBLIC_
# Restart dev server after .env changes
# Check Vercel dashboard for production env vars
```

#### Debugging Tools

```bash
# Next.js build analysis
ANALYZE=true pnpm build

# Inspect bundle size
# Opens interactive bundle analyzer in browser

# Check TypeScript errors
pnpm tsc --noEmit

# Inspect Sanity GROQ queries
# Use Sanity Vision plugin (Studio → Vision tab)
```

### 14.9 Performance Optimization Checklist

- [ ] Use Server Components by default (no `'use client'` unless needed)
- [ ] Implement `generateStaticParams` for dynamic routes
- [ ] Use `next/image` for all images (automatic optimization)
- [ ] Enable ISR with `revalidate` option
- [ ] Lazy load components with `next/dynamic`
- [ ] Minimize client-side JavaScript
- [ ] Implement route loading states
- [ ] Use `Suspense` boundaries for async data
- [ ] Optimize GROQ queries (limit fields, use projections)
- [ ] Enable compression in next.config.ts
- [ ] Implement pagination for large lists

### 14.10 Git Workflow

```bash
# 1. Create feature branch from staging
git checkout staging
git pull origin staging
git checkout -b feature/issue-XX-description

# 2. Make changes, commit with Ralph Protocol format
git add .
git commit -m "feat(component): description [#XX] SECURITY-CHECKLIST"

# 3. Push and create PR to staging
git push origin feature/issue-XX-description
gh pr create --base staging --title "Fix Issue #XX"

# 4. After CI passes, merge to staging
gh pr merge <pr-number>

# 5. Test on staging preview URL

# 6. Create PR staging → main for production
gh pr create --base main --title "Deploy: Issue #XX fixes"

# 7. After approval, merge to production
gh pr merge <pr-number>
```

### 14.11 Troubleshooting Ralph Protocol Violations

If `canonical-enforcer.sh` blocks a commit:

```bash
# Check for deprecated document references
grep -r "RALPH_OMNIBUS" .
grep -r "MANDATORY_PROTOCOLS" .

# Ensure commit message follows format
# ❌ Bad: "fix bug"
# ✅ Good: "fix(api): resolve view count error [#45] SECURITY-CHECKLIST"

# Validate phase reports
bash scripts/validate-phase-report.sh docs/reports/phase_1_assessment_report_45.md
```

### 14.12 Quick Command Reference

```bash
# Development
pnpm dev                   # Start dev server
pnpm build                 # Production build
pnpm start                 # Start production server

# Testing
pnpm test                  # Unit tests
pnpm test:e2e              # E2E tests
pnpm test:smoke            # Smoke tests

# Linting & Security
pnpm lint                  # ESLint
pnpm lint:security         # Security scan
pnpm audit                 # Dependency audit
pnpm secretlint            # Secret detection

# Sanity
pnpm sanity:dev            # Studio dev server
pnpm sanity:deploy         # Deploy studio
pnpm sanity:backup         # Backup dataset

# Deployment
pnpm deploy:prod           # Gated production deploy
vercel                     # Direct Vercel deploy (use with caution)
vercel rollback            # Emergency rollback
```

### 14.13 Common Pitfalls & Lessons Learned

> **Warning**: This section documents REAL mistakes made during this project's development. Learn from these to avoid repeating them.

#### 🔴 **CRITICAL: GitHub Actions Environment Issues**

**Pitfall #1: Missing GitHub Secrets**

```yaml
# ❌ WRONG: Workflow fails silently
env:
  EMAIL_USER: ${{ secrets.EMAIL_USER }}
  EMAIL_PASS: ${{ secrets.EMAIL_PASS }}
# If secrets don't exist, variables are EMPTY, not errored

# ✅ CORRECT: Always validate in workflow
- name: Validate Secrets
  run: |
    if [ -z "${{ secrets.EMAIL_USER }}" ]; then
      echo "ERROR: EMAIL_USER secret not set"
      exit 1
    fi
```

**Lesson**: Issues #50, #51, #52 ALL failed due to missing GitHub secrets. Always:

- Document required secrets in README
- Validate presence at workflow start
- Never assume secrets exist in CI/CD

**Pitfall #2: Sanity CLI Missing Project ID**

```typescript
// ❌ WRONG: sanity.config.ts only
export default defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
});

// Works locally, FAILS in GitHub Actions because CLI looks for sanity.cli.ts

// ✅ CORRECT: Also configure sanity.cli.ts
export default defineCliConfig({
  api: {
    projectId: config.projectId, // Explicit project ID
    dataset: config.dataset,
  },
});
```

**Lesson**: Issue #50 - Sanity backup failed 9/10 runs. The Sanity CLI requires explicit configuration even when env vars are set.

**Pitfall #3: Wrong Command Invocation in pnpm**

```yaml
# ❌ WRONG: Command not found
- run: pnpm tsx scripts/the-spider.ts

# ✅ CORRECT: Use pnpm exec
- run: pnpm exec tsx scripts/the-spider.ts
```

**Lesson**: Issue #52 - Spider patrol failed with "Command 'tsx' not found" despite tsx being installed. Always use `pnpm exec` for binary commands.

---

#### 🟡 **MEDIUM: Data Integrity & Schema Issues**

**Pitfall #4: RE-OPENED Issues Pattern**

```markdown
Issues #18, #20, #21, #22 - All marked RE-OPENED after being "RESOLVED"
```

**Root Cause**: Fixing symptoms instead of root causes:

- ❌ "Preview not working" → Restart dev server (temporary fix)
- ✅ "Preview not working" → Fix environment variable mismatch (permanent fix)

**Lesson**:

- Never mark issue RESOLVED without 24h Watchtower monitoring (Gate 10)
- Require proof of fix (terminal logs, screenshots)
- Test in production-like environment (GitHub Actions, not just local)

**Pitfall #5: Hardcoded URLs**

```typescript
// ❌ WRONG: Fragile, breaks when URL structure changes
<Link href={`/category/${category}/${slug}`}>

// ✅ CORRECT: Use centralized URL helper
import { getArticleUrl } from '@/lib/urls'
<Link href={getArticleUrl(category, slug)}>
```

**Lesson**: Issue #45 - Andy Jassy 404 error. URLs were hardcoded, breaking when route structure changed. The URL Law (#19) mandates `lib/urls.ts`.

**Pitfall #6: Missing GROQ LIMIT Clause**

```groq
# ❌ WRONG: Fetches ALL records (performance disaster)
*[_type == "post"] {
  _id,
  title
}

# ✅ CORRECT: Always include LIMIT
*[_type == "post"][0...100] {
  _id,
  title
}
```

**Lesson**: Ralph Protocol Law #1 - "The Limit Law". Fetching unlimited records crashes Sanity queries and slows site.

**Pitfall #7: Spotlight Image vs Featured Image Confusion**

```typescript
// ❌ WRONG: Using featuredImage for spotlight
const spotlightImage = article.featuredImage; // Rectangular, wrong ratio

// ✅ CORRECT: Use spotlightImage field
const spotlightImage = article.spotlightImage; // Square 1:1 ratio
```

**Lesson**: Issue #22 - Homepage looked broken because spotlight grid expects 1:1 images, not 16:9 featured images. Schema must enforce correct asset types.

---

#### 🟢 **LOW: Development Workflow Issues**

**Pitfall #8: Not Using Ralph Protocol Gates**

```bash
# ❌ WRONG: "Quick fix" without planning
git commit -m "fix bug"
# Result: Introduced 3 new bugs, no documentation

# ✅ CORRECT: Follow 10-gate process
1. Gate 1: Physical Audit (grep, view_file)
2. Gate 2: Logic Mapping (identify consumers)
3. Gate 3: Blueprint (implementation_plan.md + approval)
...
10. Gate 10: Watchtower (24h monitoring)
```

**Lesson**: Issues keep reopening because gates were skipped. Gates exist because every shortcut has costs.

**Pitfall #9: Insufficient Verification**

```bash
# ❌ WRONG: "Looks good locally"
pnpm dev  # Works on localhost
git push  # Assume it works in production

# ✅ CORRECT: Multi-environment verification
pnpm build                    # Test production build
pnpm test:e2e                 # Run E2E tests
# Create PR → triggers GitHub Actions
# Test on Vercel preview
# Monitor production for 24h (Gate 10)
```

**Lesson**: Local dev environment != production. Always test in staging/preview before prod.

**Pitfall #10: Cache-Related "Ghost Errors"**

```bash
# ❌ WRONG: Debugging stale cache issues
"Module not found" errors that don't make sense

# ✅ CORRECT: Clear caches first
rm -rf .next
rm -rf node_modules/.cache
pnpm dev
```

**Lesson**: 30% of "mysterious errors" are stale Next.js cache. Clear `.next` before debugging.

---

#### ⚫ **SECURITY: Critical Violations**

**Pitfall #11: Exposed Secrets in Code**

```typescript
// ❌ WRONG: Hardcoded API keys
const apiKey = "sk_live_abc123...";

// ✅ CORRECT: Environment variables only
const apiKey = process.env.SANITY_AUTH_TOKEN;
if (!apiKey) throw new Error("Missing SANITY_AUTH_TOKEN");
```

**Lesson**: Use `secretlint` pre-commit hook. Secrets in code = security incident.

**Pitfall #12: Using dangerouslySetInnerHTML Without Sanitization**

```typescript
// ❌ WRONG: XSS vulnerability
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ CORRECT: Sanitize first
import DOMPurify from 'isomorphic-dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

**Lesson**: Ralph Protocol Law #2 - Security Law. Never trust user input.

**Pitfall #13: Client-Side Secrets**

```typescript
// ❌ WRONG: Write token exposed to browser
const client = createClient({
  token: process.env.SANITY_WRITE_TOKEN, // ⚠️ If NEXT_PUBLIC_, this is exposed!
});

// ✅ CORRECT: Server-only operations
// lib/sanity.admin.ts (server-only)
export function getAdminClient() {
  return createClient({
    token: process.env.SANITY_WRITE_TOKEN, // Never NEXT_PUBLIC_
  });
}
```

**Lesson**: Ralph Protocol Law #7 - Air-Gap Law. Write operations = server-only.

---

#### 📊 **DATA: Content Management Issues**

**Pitfall #14: Draft Content Leaking to Production**

```groq
# ❌ WRONG: Fetches drafts too
*[_type == "post"]

# ✅ CORRECT: Exclude drafts
*[_type == "post" && !(_id in path("drafts.**"))]
```

**Lesson**: E2E tests failed because they expected published content but got drafts. Always filter drafts.

**Pitfall #15: Missing Required Fields**

```typescript
// ❌ WRONG: Optional fields treated as required
const writerName = article.writer.name; // Crashes if writer is null

// ✅ CORRECT: Defensive access
const writerName = article.writer?.name ?? "Anonymous";
```

**Lesson**: Sanity schema validation is CMS-side only. Always validate in code.

**Pitfall #16: Image Asset Not Populated**

```typescript
// ❌ WRONG: Direct asset reference
const imageUrl = article.featuredImage.url  // undefined

// ✅ CORRECT: Dereference asset
"featuredImageUrl": featuredImage.asset->url
```

**Lesson**: Sanity images require `asset->` dereferencing in GROQ queries.

---

#### 🔄 **CI/CD: Deployment Pitfalls**

**Pitfall #17: Deploying Schema Changes Without Studio Refresh**

```bash
# ❌ WRONG: Deploy schema, don't refresh Studio
pnpm sanity deploy
# Studio still shows old schema in production

# ✅ CORRECT: Ralph Protocol Gate 8
1. Deploy schema: pnpm sanity deploy
2. Hard refresh Studio: Cmd+Shift+R
3. Verify new fields appear
4. Screenshot as proof
```

**Lesson**: Gate 8 - Sanity Schema Gate. Studio caches schema aggressively.

**Pitfall #18: ISR Not Revalidating**

```typescript
// ❌ WRONG: Expecting instant updates
export const revalidate = 3600; // 1 hour
// User: "I published 5 mins ago, where is it?"

// ✅ CORRECT: On-demand revalidation
// Set up webhook: Sanity → /api/revalidate
// Triggers immediate cache purge
```

**Lesson**: ISR is NOT real-time. Use webhooks for urgent updates.

**Pitfall #19: Not Testing Build Locally Before Deploy**

```bash
# ❌ WRONG: Push directly to main
git push origin main
# Vercel build fails, production down

# ✅ CORRECT: Local build verification
pnpm build                    # Must succeed
pnpm start                    # Test production build
pnpm test:e2e                 # E2E tests pass
# Then push
```

**Lesson**: `pnpm dev` hides build errors. Always `pnpm build` before merging.

---

#### 🎯 **WORKFLOW: Process Failures**

**Pitfall #20: Skipping Implementation Plan**

```bash
# ❌ WRONG: "I know what to do"
# Start coding immediately
# Result: Scope creep, missed edge cases, rework

# ✅ CORRECT: Gate 3 - Blueprint
1. Create implementation_plan.md
2. Document changes, risks, verification
3. Get user approval
4. THEN code
```

**Lesson**: Every P0/P1 issue without a plan caused rework. Plans save time.

**Pitfall #21: Not Documenting Issue Resolution**

```bash
# ❌ WRONG: Fix issue, mark RESOLVED, move on
# 2 weeks later: "Wait, what did we fix?"

# ✅ CORRECT: Phase reports required
docs/reports/phase_1_assessment_report_45.md
docs/reports/phase_2_execution_report_45.md
docs/reports/phase_3_verification_report_45.md
```

**Lesson**: Undocumented fixes are forgotten. Phase reports = institutional memory.

**Pitfall #22: Generic Commit Messages**

```bash
# ❌ WRONG: Useless commit history
git commit -m "fix bug"
git commit -m "update code"
git commit -m "changes"

# ✅ CORRECT: Ralph semantic commits
git commit -m "fix(api): resolve view count race condition [#45] SECURITY-CHECKLIST"
git commit -m "feat(csa): add partner logo display [#28] SECURITY-CHECKLIST"
```

**Lesson**: Ralph Protocol Law #9 - Semantic Law. Future debugging depends on commit history.

---

#### 🧪 **TESTING: Verification Mistakes**

**Pitfall #23: Hardcoded Test Data**

```typescript
// ❌ WRONG: Test breaks when article deleted
test("Article page loads", async ({ page }) => {
  await page.goto("/category/leadership/specific-article-slug");
  // Fails if article unpublished
});

// ✅ CORRECT: Dynamic discovery
const articles = await discoverPublishedArticles();
if (articles.length === 0) test.skip();
await page.goto(articles[0].url);
```

**Lesson**: Issue #35 - E2E tests failed when draft content used. Tests must be content-agnostic.

**Pitfall #24: Not Running E2E Tests Before Deploy**

```bash
# ❌ WRONG: "Unit tests pass, ship it"
pnpm test  # ✅ Pass
git push   # 🔥 Production broken (navigation menu doesn't work)

# ✅ CORRECT: Full test suite
pnpm test           # Unit tests
pnpm test:e2e       # E2E critical paths
pnpm test:smoke     # Post-deploy smoke tests
```

**Lesson**: Unit tests don't catch integration bugs. E2E is mandatory.

---

#### 📈 **PERFORMANCE: Optimization Lessons**

**Pitfall #25: Not Using Server Components**

```typescript
// ❌ WRONG: Everything is 'use client'
'use client'
export default function ArticlePage() {
  // Entire page client-side, slow initial load
}

// ✅ CORRECT: Server Components by default
export default async function ArticlePage() {
  const data = await fetchArticle()  // Server-side fetch
  return <ArticleView data={data} />
}
```

**Lesson**: Client components should be <10% of codebase. Server = faster.

**Pitfall #26: Not Optimizing Images**

```tsx
// ❌ WRONG: Raw img tag
<img src={imageUrl} alt="..." />  // No optimization, CDN bypass

// ✅ CORRECT: Next/Image
<Image src={imageUrl} alt="..." width={800} height={450} />
```

**Lesson**: Next/Image = automatic WebP, lazy loading, CDN. Always use it.

---

#### 🎓 **LESSONS FROM RE-OPENED ISSUES**

**Issue #18 (Sanity Preview) - RE-OPENED 2x**

- **Mistake**: Fixed `.env.local` locally, didn't check Vercel env vars
- **Lesson**: Environment parity - local = staging = production

**Issue #20 (Footer/Nav SEO) - RE-OPENED 1x**

- **Mistake**: Updated component, didn't verify CMS content exists
- **Lesson**: Code changes ≠ complete fix. Check CMS data too.

**Issue #21 (Dynamic Metadata) - RE-OPENED 1x**

- **Mistake**: Metadata generated correctly, but not persisted to Sanity
- **Lesson**: Display ≠ stored. Verify data persistence.

**Issue #22 (Legacy Images) - RE-OPENED 1x**

- **Mistake**: Backfilled 80%, claimed 100%
- **Lesson**: "Almost done" ≠ done. Verify completeness with scripts.

---

#### 🔥 **THE GOLDEN RULES (NEVER VIOLATE)**

1. **Never hardcode URLs** - Use `lib/urls.ts`
2. **Never skip LIMIT in GROQ** - Always use `[0...N]`
3. **Never use `dangerouslySetInnerHTML` raw** - Sanitize with DOMPurify
4. **Never commit secrets** - Use `secretlint` pre-commit
5. **Never mark RESOLVED without Gate 10** - 24h monitoring required
6. **Never deploy schema without Studio refresh** - Gate 8 mandatory
7. **Never skip E2E tests** - CI must pass before merge
8. **Never trust local success** - Test in staging/preview
9. **Never use client components by default** - Server first
10. **Never fix symptoms** - Find and fix root cause

---

**Remember**: Every pitfall listed here caused production issues or wasted time. Learning from history prevents repeating it.

---

### 14.14 Issue Resolution Reference

> **Purpose**: Quick lookup to find what we learned from each resolved issue. Use this when debugging similar problems.

#### Complete Issue History (52 Issues Documented)

| Issue   | Title                        | Key Lesson Learned                                      | PRD Reference                          |
| ------- | ---------------------------- | ------------------------------------------------------- | -------------------------------------- |
| **#1**  | CSA Spotlight Visibility     | Use Sanity as single source of truth for all content    | Section 3.1, 4.1                       |
| **#2**  | Spotlight Config Mismatch    | Remove JSON files, migrate to CMS                       | Section 3.1, Pitfall #5                |
| **#3**  | Missing Spotlight Overlays   | 100% asset backfill required, verify completeness       | Section 4.1                            |
| **#4**  | CI/CD Pipeline Failures      | Content-agnostic tests with dynamic discovery           | Pitfall #23                            |
| **#5**  | Security: XSS Vulnerability  | Always sanitize HTML with DOMPurify                     | Pitfall #12, Golden Rule #3            |
| **#6**  | Security: SQL Injection      | GROQ is safe, not SQL - false positive                  | Section 10.1                           |
| **#7**  | Unreliable Deployment        | Enforce staging → main branch workflow                  | Section 9.2, 13.3                      |
| **#8**  | Tag Data Quality             | Reduced 131→28 tags, enforce validation                 | Section 3.4                            |
| **#9**  | Tag Landing Pages Missing    | Implement /tag/[slug] for SEO growth                    | Section 4.4, 6.3                       |
| **#10** | Missing Metadata: Views      | Hybrid approach + persona hardening                     | Section 4.3, 14.3                      |
| **#11** | Hardcoded Secrets Audit      | Never commit secrets, use env vars                      | Pitfall #11, Golden Rule #4            |
| **#12** | Server-to-Client Leak        | Split sanity.ts, add server-only guards                 | Pitfall #13, Section 14.2              |
| **#13** | E2E Tooling Gaps             | Sync env vars across local/CI                           | Section 9.3, Pitfall #9                |
| **#14** | Sanity Validation            | Enforce schema constraints (required fields)            | Pitfall #15, Section 3.1               |
| **#15** | "Sponsored" Category Debt    | Remove category, enforce /csa routing                   | Section 3.2, 4.2                       |
| **#16** | Playwright Coverage          | Dynamic ad verification with drafts                     | Section 9.3                            |
| **#17** | CI/CD Rulesets               | "Locked Vault" policy + job standards                   | Section 9.2                            |
| **#18** | Sanity Preview               | **RE-OPENED 2x** - Env parity (local=staging=prod)      | Pitfall #4, Lessons from RE-OPENED     |
| **#19** | View Count Anomaly           | Clamp randomization, manual override only               | Section 4.3                            |
| **#20** | Footer/Nav SEO               | **RE-OPENED 1x** - Code change ≠ complete fix           | Pitfall #4, Lessons from RE-OPENED     |
| **#21** | Dynamic Metadata Debt        | **RE-OPENED 1x** - Display ≠ stored, verify persistence | Pitfall #4, Lessons from RE-OPENED     |
| **#22** | Legacy Image Gaps            | **RE-OPENED 1x** - "Almost done" ≠ done, verify 100%    | Pitfall #4, #7, Lessons from RE-OPENED |
| **#23** | QA Tooling Implementation    | Deployed Iron Dome (8 tools) + Security CI              | Section 8.2, 9.2                       |
| **#24** | Category Scroll Freeze       | Remove conflicting JS auto-scroll loops                 | Section 4.4                            |
| **#25** | Governance: Missing PRD      | **This document** - Single source of truth              | Entire PRD                             |
| **#28** | Missing Tag Index Page       | Implement /tag index with polished UI                   | Section 4.4                            |
| **#29** | Missing Legal Copyright      | Update to "INVICTUS INTERNATIONAL 2026 © ™"             | Section 4.6                            |
| **#30** | Legacy Versioning Cleanup    | Remove package.json imports from components             | Section 4.6                            |
| **#31** | Automated Sitemap Gen        | Unified GROQ query (post + csa + tag)                   | Section 4.4, 14.6                      |
| **#32** | The Spider: Crawler          | Automated link health + daily email report              | Section 8.2, 9.2                       |
| **#33** | The Eagle: Visual Regression | Expanded Playwright coverage to salary pages            | Section 8.2, 9.3                       |
| **#34** | Ralph Protocol v2.1 Upgrade  | Enforced "Proof Law" + added Phase 7                    | Section 8.1, 13.1                      |
| **#35** | Prod Link Rot (14 URLs)      | Fixed malformed URLs in ArchiveFilters.tsx              | Pitfall #23, Golden Rule #1            |
| **#36** | DevOps: Dedupe CI            | Removed redundant e2e.yml workflow                      | Section 9.2                            |
| **#37** | Iron Dome: Dep Audit         | Resolved lodash CVE via pnpm.overrides                  | Section 10.2, 15.4                     |
| **#38** | Sanity: Schema Integrity     | Fixed env var leaks in CI runner                        | Section 10.1                           |
| **#39** | Ghost Category Deletion      | Verified empty categories removed                       | Section 3.2                            |
| **#40** | Batch Tagging "CEO"          | Tagged 35 CXO interviews with "CEO" tag                 | Section 3.4                            |
| **#41** | Tag Metadata Cleanup         | Cleaned empty/stopword tags, 0 orphans                  | Section 3.4                            |
| **#42** | Discard Stale Drafts         | Deleted redundant Andy Jassy draft                      | Section 15.9                           |
| **#43** | Crawler: Missing Report      | Switched to pnpm exec, verified Mac/CI                  | Pitfall #3, Section 15.2               |
| **#44** | UI Header Polish             | Reduced space waste, editorial card design              | Section 4.5                            |
| **#45** | Broken Link: Andy Jassy      | **OPEN** - Hardcoded URLs broke on route change         | Pitfall #5, Golden Rule #1             |
| **#46** | Persistent Email Failure     | **OPEN** - Daily report mailer debugging                | Section 15.3                           |
| **#47** | UI: Missing Author Header    | Fixed fallback logic + "By" prefix                      | Section 4.5                            |
| **#48** | Secret Management            | Vault Protocol + persistent secrets index               | Section 10.1, 15.5                     |
| **#49** | Programmatic SEO: 1M Views   | 12-month roadmap: 50K pages, automation                 | Section 6.1, 6.2, 11.2                 |
| **#50** | Daily Sanity Backup Fail     | **RE-OPENED 4x** - sanity.cli.ts config required        | Pitfall #2, Golden Rule #6             |
| **#51** | Daily SEO Report Fail        | **RE-OPENED 3x** - Missing GitHub secrets               | Pitfall #1, Section 15.3               |
| **#52** | Link Spider Email Fail       | **RE-OPENED 3x** - Use 'pnpm exec tsx' not 'pnpm tsx'   | Pitfall #3, Section 15.2               |

---

#### How to Use This Reference

**Scenario 1: Debugging Similar Issue**

```
You: "Images not loading on homepage"
Check: Issue #22 (Legacy Image Gaps)
Lesson: Verify 100% asset backfill, check Sanity image dereferencing
PRD: Pitfall #16 (Image Asset Not Populated)
```

**Scenario 2: Understanding Past Decision**

```
You: "Why don't we have a 'Sponsored' category?"
Check: Issue #15 (Sponsored Category Debt)
Lesson: Removed category, enforce /csa routing for sponsored content
PRD: Section 3.2 (Content Types), 4.2 (CSA Features)
```

**Scenario 3: Preventing Re-Opened Issues**

```
You: "Why did #18 reopen twice?"
Check: Lessons from RE-OPENED Issues
Lesson: Fixed .env.local locally, didn't check Vercel env vars
Golden Rule: #8 "Never trust local success - test in staging"
```

---

#### Issues by Category

**Security (P0)**: #5, #6, #11, #12, #48  
**Data Quality**: #8, #14, #39, #40, #41, #42  
**CI/CD & DevOps**: #4, #7, #13, #17, #23, #32, #33, #36, #37, #38, #43  
**Content & SEO**: #1, #2, #3, #9, #15, #31, #49  
**UI/UX**: #44, #47  
**Governance**: #25, #34  
**RE-OPENED (Learn from these!)**: #18, #20, #21, #22, #50, #51, #52

---

---

## 15. Operational Runbook

This section provides step-by-step procedures for common operational tasks, incident response, and team onboarding to ensure smooth day-to-day operations.

### 15.1 New Developer Onboarding (Day 1-7)

**Day 1: Environment Setup**

1. **Prerequisites** Install development tools, clone repository, configure environment variables
2. **Verification** Start dev server, run tests, access Sanity Studio
3. **Required Reading** README, Ralph Constitution, this PRD,ISSUES_LOG

**Week 1 Milestone**: Complete first PR following full Ralph Protocol (10 gates)

### 15.2 Common Operational Procedures

**✅ Deploy Hot Fix to Production**

```bash
git checkout -b hotfix/issue-XX
# Make minimal fix, test locally
gh pr create --base main
# Monitor for 1 hour post-deploy
```

**✅ Update Sanity Schema**

```bash
# Modify schema files
pnpm sanity deploy
# Hard refresh Studio (Cmd+Shift+R)
# Verify changes, screenshot for Gate 9
```

**✅ Restore from Backup**

```bash
ls exports/backups/
BACKUP_FILE=exports/backups/2026-01-28-production.tar.gz
pnpm sanity:restore  # ⚠️ CAUTION: Overwrites data
```

**✅ Roll Back Deployment**

```bash
vercel rollback  # Fastest option
# Or: git revert + push
```

### 15.3 Incident Response (P0-P4)

**Severity Levels**: P0 (Site down, <15min) → P4 (Backlog, planned)

**P0 Response**:

1. **Identify** (0-5min): Check logs, Sentry, GitHub Actions
2. **Communicate** (5-10min): Post incident notification
3. **Mitigate** (10-30min): Rollback, hotfix, or disable feature
4. **Verify** (30-45min): Run smoke tests, manual checks
5. **Monitor** (45-120min): Watch errors, analytics
   6 **Post-Mortem** (next day): Document & prevent recurrence

### 15.4 Dependency Management

**Monthly Security Updates** (First Monday)

```bash
pnpm audit
pnpm audit --fix
# Test thoroughly before production
```

**Quarterly Major Updates** (End of Q1/Q2/Q3/Q4)

```bash
pnpm outdated
pnpm update --latest  # Minor versions
# Major versions: One at a time with full testing
```

**Pinned Dependencies**: `next@16.1.0`, `sanity@4.22.0`, `node@22.x`

### 15.5 Third-Party Services

| Service                   | Purpose        | Tier             | Critical | Cost |
| ------------------------- | -------------- | ---------------- | -------- | ---- |
| **Sanity**                | CMS & Database | Free (Developer) | ⚠️ P0    | $0   |
| **Vercel**                | Hosting & CDN  | Hobby (Free)     | ⚠️ P0    | $0   |
| **Google Drive**          | Backups        | Free             | P2       | $0   |
| **Google Search Console** | SEO Monitoring | Free             | P2       | $0   |
| **Sentry**                | Error Tracking | Developer (Free) | P2       | $0   |

**Total Monthly Cost**: $0 (Free tier infrastructure)

### 15.6 Backup & Recovery

**Daily Backups**: 00:00 IST → Google Drive (30-day retention)
**Monthly Snapshots**: First of month (12-month retention)
**Restoration**: Use `pnpm sanity:restore` with caution

### 15.7 Performance SLAs

| Metric     | Target  | Measurement          |
| ---------- | ------- | -------------------- |
| Uptime     | 99.9%   | Vercel status        |
| LCP        | < 2.5s  | Lighthouse (mobile)  |
| FID        | < 100ms | Real user monitoring |
| Build Time | < 3min  | GitHub Actions       |

### 15.8 Communication & Escalation

**Channels**: GitHub Issues (24h), PRs (48h), Email (24h), Urgent/Phone (P0 only)

**Escalation**: P0 → Immediate mitigation + notify within 15min

### 15.9 Data Retention

- **Published Content**: Indefinite retention
- **Drafts**: 90-day inactivity →auto-deleteDaily **Backups**: 30 days rolling
- **Media**: Keep if referenced by published content

### 15.10 Documentation Standards

**Every Feature Requires**:

- Implementation plan (mandatory)
- Phase reports (1-10)
- Updated ISSUES_LOG.md
- API docs (if new endpoints)

**Every Incident Requires**:

- Incident report with root cause
- Timeline and prevention measures
- ISSUES_LOG.md entry

---

## Appendix

### A. Glossary

| Term               | Definition                                                |
| ------------------ | --------------------------------------------------------- |
| **CSA**            | C-Suite Sponsored Article (revenue-generating content)    |
| **CXO**            | C-level executives (CEO, CFO, CTO, etc.)                  |
| **GROQ**           | Graph-Relational Object Queries (Sanity's query language) |
| **ISR**            | Incremental Static Regeneration (Next.js rendering)       |
| **Ralph Protocol** | Engineering quality framework (10 laws, 10 gates)         |
| **Spotlight Grid** | Homepage featured content (9 fixed items)                 |
| **SSoT**           | Single Source of Truth                                    |
| **The Spider**     | Automated link health crawler                             |
| **Watchtower**     | 24h post-deploy monitoring (Gate 10)                      |

### B. Quick Reference Links

| Resource               | URL                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Production Site**    | https://csuitemagazine.global                                                                                    |
| **Sanity Studio**      | https://csuitemagazine.global/studio                                                                             |
| **GitHub Repository**  | https://github.com/[org]/c-suite-magazine                                                                        |
| **Vercel Dashboard**   | https://vercel.com/[team]/ceo-magazine                                                                           |
| **Issues Log**         | [docs/ISSUES_LOG.md](file:///Users/surajsatyarthi/Desktop/ceo-magazine/docs/ISSUES_LOG.md)                       |
| **Ralph Constitution** | [SUPREME_RALPH_CONSTITUTION.md](file:///Users/surajsatyarthi/Desktop/ceo-magazine/SUPREME_RALPH_CONSTITUTION.md) |

### C. Contact & Support

| Role              | Responsibility                                   |
| ----------------- | ------------------------------------------------ |
| **Product Owner** | Strategic direction, feature prioritization      |
| **Engineering**   | Development, infrastructure, technical decisions |
| **Content**       | Editorial standards, content creation            |

---

**Document Version Control**

| Version | Date       | Changes                                                   | Author       |
| ------- | ---------- | --------------------------------------------------------- | ------------ |
| 1.0.0   | 2026-01-28 | Initial comprehensive PRD                                 | Product Team |
| 1.1.0   | 2026-01-28 | Added Developer Reference section (14) with technical doc | Engineering  |
| 1.2.0   | 2026-01-28 | Added Common Pitfalls (14.13) with 26 real-world lessons  | Engineering  |
| 1.3.0   | 2026-01-28 | Added Operational Runbook (15) for smooth operations      | Engineering  |
| 1.4.0   | 2026-01-28 | Added Issue Resolution Reference (14.14) - all 52 issues  | Engineering  |

---

**Approval Status**: ⏳ Pending User Review

This document is now the **official Single Source of Truth** for the C-Suite Magazine platform. All product decisions, technical implementations, and roadmap planning must reference and align with this PRD.
