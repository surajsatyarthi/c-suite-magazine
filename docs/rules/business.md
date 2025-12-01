# CRITICAL BUSINESS RULES - NEVER BREAK THESE

## 🚨 ZERO TOLERANCE RULES

### 1. NEVER DISPLAY ZERO COUNTS PUBLICLY
- **NEVER** show "0 articles", "0 views", "0 comments" on public-facing UI
- **NEVER** display empty states with zero counts to general users
- **ALWAYS** hide categories/sections with zero content
- **CONSEQUENCE**: Makes magazine look unprofessional and dead

### 2. PREMIUM BRAND PROTECTION
- **ALWAYS** maintain premium, exclusive appearance
- **NEVER** show technical errors, debug info, or system messages publicly
- **ALWAYS** test on staging before production for brand-critical changes
- **CONSEQUENCE**: Damages C-Suite executive brand perception

### 3. CATEGORY DISPLAY RULES
- **ONLY** show categories that have published articles (count > 0)
- **NEVER** expose article counts in navigation/header to public
- **ALWAYS** use internal APIs for count data, never public endpoints
- **CONSEQUENCE**: Reveals content gaps to competitors and looks amateur

### 4. SPOTLIGHT ARTICLE PROTECTION
- **NEVER** modify featured images or hero images for the 16 spotlight articles
- **NEVER** apply automated image changes to premium curated content
- **ALWAYS** preserve editorial team's image selections for spotlight pieces
- **CONSEQUENCE**: Damages premium curated content and editorial integrity

## 🔒 IMPLEMENTATION REQUIREMENTS

### For Developers:
1. **Filter at API level**: `categories.filter(c => c.count > 0)`
2. **Separate public/internal APIs**: Never expose counts publicly
3. **Business logic validation**: Code review must check for zero displays
4. **Staging testing**: All UI changes tested for brand impact
5. **Spotlight protection**: `if (articleType === 'spotlight') return originalImage`

### For Code Review:
1. **Search for**: `count`, `0`, `zero`, `"0"` in UI components
2. **Verify**: No public display of empty states with counts
3. **Confirm**: Premium appearance maintained
4. **Test**: Executive-level user experience
5. **Check**: Spotlight articles excluded from image modifications

## 📋 CHECKLIST BEFORE DEPLOYING

- [ ] No zero counts displayed publicly
- [ ] Categories filtered by content availability  
- [ ] Premium brand appearance maintained
- [ ] Executive user experience validated
- [ ] No technical errors exposed publicly
- [ ] Spotlight articles protected from image modifications

**BREAKING THESE RULES = IMMEDIATE REVERSION + SERIOUS CONSEQUENCES**