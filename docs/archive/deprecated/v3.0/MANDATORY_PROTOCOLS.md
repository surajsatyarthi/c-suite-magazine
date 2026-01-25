# Sanity CMS Operations - Mandatory Protocols

**CRITICAL:** These protocols are mandatory for ALL operations on the live production site. No exceptions.

---

## Protocol 1: Schema Changes

### Before Making ANY Schema Change

- [ ] **Backup**: Document current schema state
- [ ] **Plan**: Write down exactly what fields will change
- [ ] **Order**: Schema changes MUST come before data changes
- [ ] **Review**: Double-check field names, types, validation rules

### Schema Change Execution Order

```
1. Update schema files (e.g., csaType.ts, postType.ts)
2. Validate schema locally: `pnpm exec sanity schema validate`
3. Deploy schema: `pnpm exec sanity schema deploy`
4. WAIT for deployment confirmation
5. Hard refresh Sanity Studio (Cmd+Shift+R)
6. Verify fields appear in Studio UI
7. ONLY THEN run data migration scripts
```

### After Schema Deployment

- [ ] Schema validation passes (0 errors, 0 warnings)
- [ ] Studio UI refreshed and shows new fields
- [ ] Screenshot taken as proof
- [ ] Data migration script ready with dry-run mode

**NEVER RUN DATA SCRIPTS BEFORE SCHEMA IS DEPLOYED.**

---

## Protocol 2: Data Migration Scripts

### Script Creation Requirements

Every data migration script MUST include:

```typescript
// 1. Dry-run mode (default)
const dryRun = !process.argv.includes('--live');

// 2. Clear logging
console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE UPDATE'}`);

// 3. Affected count
console.log(`Will update: ${itemsToUpdate.length} items`);

// 4. Confirmation for live mode
if (!dryRun) {
  console.log('⚠️  RUNNING IN LIVE MODE - Changes will be permanent');
}

// 5. Summary at end
console.log(`Updated: ${successCount}/${totalCount} items`);
```

### Script Execution Checklist

- [ ] **Test**: Run with `--dry-run` first
- [ ] **Review**: Check dry-run output carefully
- [ ] **Backup**: Confirm schema is already updated
- [ ] **Execute**: Run live mode only after dry-run review
- [ ] **Verify**: Check results with verification query

### Post-Migration Verification

```bash
# Always verify after migration
npx tsx scripts/verify-[operation].ts
```

- [ ] Backend data verified with GROQ query
- [ ] Sanity Studio refreshed (Cmd+Shift+R)
- [ ] Visually confirmed in Studio UI
- [ ] No validation warnings in Studio

---

## Protocol 3: Sanity Studio UI Verification

### CRITICAL RULE
**Backend data correctness ≠ UI correctness**

Even if GROQ queries return correct data, users see the UI. Always verify UI.

### Mandatory UI Verification Steps

After ANY backend change:

1. **Hard Refresh Studio**
   ```
   Mac: Cmd+Shift+R
   Windows: Ctrl+Shift+R
   ```

2. **Visual Confirmation**
   - [ ] Open affected document in Studio
   - [ ] Verify all fields display correctly
   - [ ] Check for validation warnings
   - [ ] Take screenshot as proof

3. **Cache Awareness**
   - Sanity Studio caches dereferenced data
   - Always hard refresh after backend changes
   - Never assume UI auto-updates

### Verification Checklist

- [ ] Backend GROQ query confirms data
- [ ] Studio hard refreshed (Cmd+Shift+R)
- [ ] Document opened and visually inspected
- [ ] Screenshot saved
- [ ] No stale cache warnings

**If UI doesn't match backend, hard refresh before claiming there's an issue.**

---

## Protocol 4: Git & Deployment

### Pre-Commit Checklist

- [ ] Local build passes: `pnpm run build`
- [ ] All tests pass (if applicable)
- [ ] Changes reviewed in diff
- [ ] Commit message is descriptive

### Deployment Checklist

```bash
# Complete sequence - ALL steps required
git status                    # Review changes
git add [files]              # Stage changes
git commit -m "[message]"    # Commit
git push origin main         # Push to trigger deployment
```

### Post-Push Verification

- [ ] **Immediate**: Check GitHub for push confirmation
- [ ] **Within 30s**: Verify Vercel deployment started
  ```bash
  pnpm vercel ls | head -10
  ```
- [ ] **Monitor**: Watch deployment progress
- [ ] **Verify**: Check live site after deployment completes
- [ ] **Confirm**: Test the specific feature deployed

### Deployment Verification

```
1. Git push confirmed ✓
2. Vercel deployment triggered ✓
3. Deployment status: Building... → Ready ✓
4. Live site updated ✓
5. Feature tested on live site ✓
```

**NEVER claim deployment success without verifying live site.**

---

## Protocol 5: Analysis & Comparison

### Before Claiming "Differences Found"

- [ ] **Read actual content**, not just JSON structure
- [ ] **Compare side-by-side text**, not metadata
- [ ] **Ignore** `_key`, `_rev`, `_updatedAt` differences
- [ ] **Focus** on user-visible content differences
- [ ] **Verify** conclusion with second check

### Draft vs Published Comparison

```typescript
// WRONG: Comparing JSON objects
if (JSON.stringify(draft) !== JSON.stringify(published)) {
  console.log('Differences found!') // ❌ Misleading
}

// RIGHT: Comparing actual content
const draftText = extractText(draft.body)
const publishedText = extractText(published.body)
if (draftText !== publishedText) {
  console.log('Content differences found') // ✓ Accurate
}
```

### Analysis Checklist

- [ ] Extracted human-readable content
- [ ] Compared text side-by-side
- [ ] Identified actual user-visible differences
- [ ] Verified conclusion before reporting
- [ ] Provided proof (text comparison output)

**Never claim "significant differences" based on JSON comparison alone.**

---

## Protocol 6: Communication

### Before Saying "Success" or "Done"

- [ ] All verification steps completed
- [ ] UI confirmed (if applicable)
- [ ] Live site checked (if deployed)
- [ ] Screenshot/proof captured
- [ ] No assumptions made

### Required Information in Status Updates

**Incomplete:**
❌ "Done!"
❌ "Article added to spotlight"
❌ "Changes deployed"

**Complete:**
✅ "Done! Verified in Sanity Studio (screenshot attached)"
✅ "Article added to spotlight - Studio refreshed, shows 16 items"
✅ "Changes deployed - Vercel build complete, tested on live site"

### Cache-Related Communications

When making backend changes that affect UI:

```
Changes saved to database ✓

⚠️  IMPORTANT: Refresh Sanity Studio to see changes
   Press Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

I will verify UI after you refresh.
```

**Always warn about cache implications. Never assume auto-refresh.**

---

## Protocol 7: Error Recovery

### When a Mistake is Discovered

1. **Stop immediately** - Don't make it worse
2. **Investigate thoroughly** - Don't guess
3. **Document findings** - Write RCA
4. **Provide fix options** - Give user choice
5. **Verify fix thoroughly** - All protocols apply

### Post-Mortem Requirements

After any mistake:

- [ ] **RCA document** created with root cause
- [ ] **Process gap** identified
- [ ] **Prevention measure** defined
- [ ] **Protocol updated** to prevent recurrence
- [ ] **Checklist added** for future operations

---

## Summary: Mandatory Verification Before Claiming Success

### Every Operation Must Verify:

| Operation Type | Backend | Studio UI | Live Site | Proof |
|----------------|---------|-----------|-----------|-------|
| Schema change | ✓ | ✓ | - | Screenshot |
| Data migration | ✓ | ✓ | - | Query results |
| Code deployment | ✓ (build) | - | ✓ | Live URL test |
| Content update | ✓ | ✓ | ✓ | Screenshot + URL |

### Zero Tolerance Items

1. ❌ Schema-last (data before schema)
2. ❌ Claiming success without UI verification
3. ❌ Deploying without verifying live site
4. ❌ Reporting differences without reading content
5. ❌ Making assumptions about cache/refresh

---

## Implementation

These protocols are:
- **Mandatory** for all production operations
- **Non-negotiable** regardless of urgency
- **Enforced** through checklists and verification
- **Updated** after any mistake/incident

**Violation of these protocols is unacceptable.**
