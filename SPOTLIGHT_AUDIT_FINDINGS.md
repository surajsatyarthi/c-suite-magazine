# Spotlight Revenue Placement Audit - Complete Findings
**Date**: 2026-01-08  
**Critical**: Revenue-impacting issues found

## 🔴 CRITICAL ISSUES

### Issue #1: CSA Clients Not Getting Paid Visibility
**Severity**: CRITICAL - Direct Revenue Loss

**Finding**: 3 CSA (Company Sponsored) articles exist but are NOT properly configured:

1. **Rich Stinson** - Slug mismatch in static file
   - Correct slug: `rich-stinson-ceo-southwire`
   - Static file has: `rich-stinson-visionary-leader-powering-america-s-electrification-future`
   - Status: In Executive in Focus but wrong URL

2. **Stella Ambrose** - Slug mismatch in static file
   - Correct slug: `stella-ambrose-deputy-ceo-sawit-kinabalu`
  - Static file has: `stella-ambrose-visionary-trailblazer-in-sustainable-palm-oil-leadership`
   - Status: In grid position 7 but wrong URL

3. **IndianOil (Shrikant Vaidya)** - NOT on homepage at all
   - Slug: `shrikant-vaidya-chairman-indianoil`
   - Status: ❌ MISSING from both static file AND Sanity spotlight config
   - **Impact**: Client paid but not displayed

### Issue #2: Wrong Article Count
**Severity**: HIGH - Business Model Misalignment

- **Current**: 17 articles configured (1 Executive + 16 grid candidates, showing only 12)
- **Required**: 13 articles total (1 Executive + 12 grid)
- **Problem**: 4 extra articles, diluting placement value

### Issue #3: Dual Configuration Sources
**Severity**: HIGH - Management Complexity

- `public/spotlight.json` controls homepage (17 articles)
- Sanity `spotlightConfig` has 16 articles
- **Result**: Confusion, manual sync required

---

## Current Configuration

### Executive in Focus (1 slot)
- **Rich Stinson** ✅ (but wrong slug)

### Spotlight Grid (12 displayed from 16 available)

**Displayed (1-12)**:
1. Olga Denysiuk
2. Stoyana Natseva
3. Brianne Howey
4. Dr. Basma Ghandourah
5. Erin Krueger
6. Bill Faruki
7. Stella Ambrose ✅ CSA (but wrong slug)
8. Pankaj Bansal
9. Supreet Nagi
10. Swami Aniruddha
11. Bryce Tully
12. Cal Riley

**NOT Displayed (13-16)**:
13. John Zangardi
14. Bryan Smeltzer
15. Dean Fealk
16. Benjamin Borketey

**COMPLETELY MISSING**:
- IndianOil / Shrikant Vaidya ❌ CSA article

---

## Required Actions

### Immediate (Revenue-Critical)

1. **Fix CSA Article Slugs**
   - Update Rich Stinson slug in configuration
   - Update Stella Ambrose slug in configuration

2. **Add Missing CSA Article**
   - Add IndianOil article to spotlight
   - Ensure it's in the 13 displayed slots

3. **Reduce to 13 Total Articles**
   - Remove 4 articles (currently have 17, need 13)
   - Keep all 3 CSA articles
   - Select 10 regular articles for grid

### Business Decisions Needed

**Question 1**: Which articles to remove (need to remove 4)?
- Candidates: John Zangardi, Bryan Smeltzer, Dean Fealk, Benjamin Borketey (currently not displayed)
- OR remove from displayed 1-12?

**Question 2**: Confirm Executive in Focus
- Is Rich Stinson the highest-paying client?

**Question 3**: Source of Truth
- Use Sanity spotlightConfig (recommended)
- OR keep public/spotlight.json (manual)

---

## Technical Details

### Files Involved
- `public/spotlight.json` - Current homepage controller
- Sanity `spotlightConfig` document - 16 articles
- `lib/spotlight.ts` - Display logic (hardcoded 12 limit)

### CSA Articles in Sanity
All 3 exist as `_type: "csa"`:
- Rich Stinson (CEO, Southwire)
- Stella Ambrose (Deputy CEO, Sawit Kinabalu)
- Shrikant Madhav Vaidya (Chairman, IndianOil)

### Code Changes Needed
```typescript
// lib/spotlight.ts line 78
// Change from:
const maxCount = typeof desiredCount === 'number' ? desiredCount : 12

// To:
const maxCount = typeof desiredCount === 'number' ? desiredCount : 13
```

---

## Next Steps

1. Start new chat to discuss implementation
2. Get business decisions on article selection
3. Implement fixes with revenue verification
4. Test homepage display
5. Confirm with clients

**Reference this file in new chat for context.**
