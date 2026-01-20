# Testing Sanity Tag Validation

## Manual Testing Checklist

### Test 1: Stopword Rejection ❌

1. Open Sanity Studio: https://localhost:3000/studio
2. Create new article or edit existing
3. In Tags field, enter: `his`
4. **Expected**: Red error message: `"his" is a stopword and provides no semantic value (Try: leadership, innovation, business strategy)`
5. **Result**: Document cannot be saved

### Test 2: Short Tag Rejection ❌

1. In Tags field, enter: `ab`
2. **Expected**: Red error message: `Tags must be at least 3 characters (Use full words, not abbreviations)`
3. **Result**: Document cannot be saved

### Test 3: Acronym Whitelist ✅

1. In Tags field, enter: `AI`
2. **Expected**: No error, tag accepted
3. **Result**: Document can be saved

### Test 4: Case Normalization Suggestion ⚠️

1. In Tags field, enter: `Opinion`
2. **Expected**: Yellow warning: `Suggested: "opinion" (86 articles use this format)`
3. **Result**: Document can still be saved, but warning shown

### Test 5: Invalid Tag Rejection ❌

1. In Tags field, enter: `---`
2. **Expected**: Red error message: `"---" is not a valid tag (Use descriptive, meaningful tags)`
3. **Result**: Document cannot be saved

### Test 6: Valid Tags ✅

1. In Tags field, enter: `leadership`, `innovation`, `CEO`
2. **Expected**: No errors or warnings
3. **Result**: Document saved successfully

## Deployment Steps

```bash
# 1. Ensure Sanity Studio is running locally
cd /Users/surajsatyarthi/Desktop/ceo-magazine
pnpm dev:sanity

# 2. Open browser to test
# http://localhost:3000/studio

# 3. After successful testing, deploy to production
pnpm sanity deploy

# 4. Verify on production Studio
# https://csuitemagazine.global/studio
```

## Rollback Procedure (if needed)

If validation is too strict and blocking writers:

```typescript
// Edit: sanity/schemaTypes/postType.ts
// Line 109-113: Comment out custom validation

validation: (Rule) => Rule.required().min(3).max(3),
// .custom((tags) => {
//   const { validateTags } = require('../lib/tagValidation');
//   return validateTags(tags || []);
// }),
```

Then redeploy:

```bash
pnpm sanity deploy
```

## Auto-Rollback Monitor

The validation includes auto-rollback if >10 errors occur within 1 hour:

- Validation automatically disabled
- Writers see warning: "Validation temporarily disabled due to high error rate"
- Alert sent to logging system
- Manual reset required after fixing issue

Check logs after deployment to monitor error rates.
