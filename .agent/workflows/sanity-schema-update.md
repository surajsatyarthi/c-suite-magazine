---
description: Update Sanity schema fields
---

# Sanity Schema Update Workflow

**AUTOMATED VERIFICATION ENFORCED AT EACH STEP**

## Step 1: Document Current State

Before starting, create a backup of current schema:

```bash
cp sanity/schemaTypes/[target-file].ts sanity/schemaTypes/[target-file].ts.backup
```

**Verification:** Backup file created

---

## Step 2: Update Schema File

Edit the schema file to add/modify fields.

Example for CSA schema:
```typescript
// sanity/schemaTypes/csaType.ts
defineField({
  name: 'newFieldName',
  type: 'string',
  title: 'Field Title',
  description: 'Field description',
  group: 'meta',
})
```

**Verification Required:** Show diff of changes
```bash
git diff sanity/schemaTypes/[target-file].ts
```

---

## Step 3: Validate Schema Locally

// turbo
```bash
pnpm exec sanity schema validate
```

**CHECKPOINT:** Must show "0 errors, 0 warnings"

If validation fails:
- ❌ STOP - Fix errors
- ❌ DO NOT PROCEED to deployment

---

## Step 4: Deploy Schema to Sanity

// turbo
```bash
pnpm exec sanity schema deploy
```

**CHECKPOINT:** Wait for deployment confirmation message

Expected output:
```
✓ Schema deployed successfully
```

---

## Step 5: Verify in Sanity Studio UI

**MANUAL STEP REQUIRED:**

1. Open Sanity Studio in browser
2. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
3. Navigate to document type
4. Verify new fields appear in UI

**CHECKPOINT:** Take screenshot showing new fields in Studio

Screenshot must show:
- Document editor with new fields visible
- No validation warnings
- Current timestamp visible

**Upload screenshot before proceeding.**

---

## Step 6: Data Migration (If Needed)

**ONLY proceed if schema is deployed AND verified in UI**

Create migration script with mandatory structure:

```typescript
// scripts/migrate-[operation-name].ts
const dryRun = !process.argv.includes('--live');

console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE UPDATE'}`);
console.log(`Will update: ${items.length} items\n`);

// ... migration logic

console.log(`\nUpdated: ${successCount}/${totalCount}`);
```

Run dry-run first:
```bash
npx tsx scripts/migrate-[operation-name].ts --dry-run
```

**CHECKPOINT:** Review dry-run output, confirm expected changes

Run live migration:
```bash
npx tsx scripts/migrate-[operation-name].ts --live
```

**CHECKPOINT:** Verify migration success count matches dry-run

---

## Step 7: Final Verification

Run verification query:

```bash
npx tsx -e "
import { client } from './sanity/lib/client';
client.fetch('*[_type == \"[type]\"][0]{newField}')
  .then(console.log);
"
```

**CHECKPOINT:** Query returns data with new field populated

Refresh Studio and verify:
- [ ] No validation warnings in Studio
- [ ] New fields display correctly
- [ ] Document saves without errors

---

## Completion Checklist

Before marking schema update as complete:

- [ ] Schema file updated
- [ ] Schema validated (0 errors, 0 warnings)
- [ ] Schema deployed to Sanity
- [ ] Studio UI refreshed AND verified (screenshot taken)
- [ ] Data migration completed (if applicable)
- [ ] Final verification query confirms data
- [ ] No warnings in Studio

**ALL checkboxes must be checked. No exceptions.**
