---
description: Run data migration on Sanity content
---

# Data Migration Workflow

**MANDATORY DRY-RUN BEFORE LIVE EXECUTION**

## Pre-Migration Requirements

**STOP AND VERIFY BEFORE CREATING MIGRATION:**

- [ ] Schema is ALREADY updated and deployed
- [ ] Schema changes verified in Sanity Studio UI
- [ ] Backup plan documented
- [ ] Rollback strategy defined

**If schema not deployed first:**
❌ ABORT - Update schema first using sanity-schema-update.md workflow

---

## Step 1: Create Migration Script

Script MUST include these mandatory components:

```typescript
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createClient } from '@sanity/client';
import { config } from '../sanity/config';

const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

async function migrate[OperationName](dryRun: boolean = true) {
    console.log('🔧 [Operation Description]');
    console.log(`Mode: ${dryRun ? '🔍 DRY RUN' : '✍️  LIVE UPDATE'}\n`);

    try {
        // Fetch documents to update
        const documents = await client.fetch(`
            *[_type == "[type]" && !(_id in path("drafts.**"))] {
                _id,
                title,
                [fields to update]
            }
        `);

        console.log(`Found ${documents.length} documents to process\n`);

        let updatedCount = 0;

        for (const doc of documents) {
            // Determine if update needed
            const needsUpdate = /* condition */;
            
            if (!needsUpdate) continue;

            console.log(`📄 ${doc.title}`);
            console.log(`   Will update: [describe change]`);

            if (!dryRun) {
                await client
                    .patch(doc._id)
                    .set({ /* changes */ })
                    .commit();
                console.log(`   ✅ Updated\n`);
            } else {
                console.log(`   ✅ Would update (dry run)\n`);
            }

            updatedCount++;
        }

        console.log('\n📊 Summary:');
        console.log(`Total documents: ${documents.length}`);
        console.log(`Documents updated: ${updatedCount}`);

        if (dryRun) {
            console.log('\n🔍 Dry run complete. No changes made.');
            console.log('Run with --live flag to apply changes.\n');
        } else {
            console.log('\n🎉 Migration complete!\n');
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Parse command line arguments
const isLive = process.argv.includes('--live');
migrate[OperationName](!isLive);
```

**CHECKPOINT:** Script created with all mandatory components

---

## Step 2: Dry Run Execution

// turbo
```bash
npx tsx scripts/migrate-[operation-name].ts
```

**Default mode is dry-run (safe)**

**CHECKPOINT:** Review dry-run output carefully

Verify:
- [ ] Document count is expected
- [ ] Changes described are correct
- [ ] No unexpected documents affected
- [ ] Summary shows expected update count

**If dry-run output unexpected:**
- ❌ STOP - Fix script logic
- ❌ Re-run dry-run until output is correct
- ❌ DO NOT proceed to live mode

---

## Step 3: Dry Run Verification

**MANDATORY REVIEW QUESTIONS:**

1. Does the document count match expectations?
2. Are only the intended documents affected?
3. Are the changes described correct?
4. Is the update logic safe (no data loss)?
5. Is there a rollback plan if something goes wrong?

**If answer to ANY question is "No" or "Unsure":**
- ❌ STOP migration
- ❌ Review and fix script
- ❌ Re-run dry-run

---

## Step 4: Live Migration Execution

**ONLY proceed after dry-run review approval**

Run live migration:

```bash
npx tsx scripts/migrate-[operation-name].ts --live
```

**⚠️ WARNING:** Changes are now permanent

**CHECKPOINT:** Monitor output in real-time

- Watch for error messages
- Verify success count matches dry-run
- Confirm summary matches expectations

---

## Step 5: Post-Migration Verification

**IMMEDIATE VERIFICATION REQUIRED**

Run verification query:

```typescript
// Create verification script
import { client } from '../sanity/config';

async function verify() {
    const updated = await client.fetch(`
        *[_type == "[type]" && !(_id in path("drafts.**"))] {
            _id,
            title,
            [updated fields]
        }
    `);
    
    console.log(`Total documents: ${updated.length}`);
    updated.slice(0, 3).forEach(doc => {
        console.log(`${doc.title}:`);
        console.log(`  Field: ${doc.[field]}`);
    });
}

verify();
```

// turbo
```bash
npx tsx scripts/verify-[operation-name].ts
```

**CHECKPOINT:** Verification shows expected data

---

## Step 6: Sanity Studio UI Verification

**MANDATORY UI CHECK**

1. Open Sanity Studio
2. Hard refresh: `Cmd+Shift+R` or `Ctrl+Shift+R`
3. Open a migrated document
4. Verify changes visible
5. Check for validation warnings

**CHECKPOINT:** Screenshot showing updated data in Studio

Screenshot must show:
- Document with updated fields
- No validation warnings
- Current timestamp

**Upload screenshot before proceeding.**

---

## Step 7: Sample Document Check

Verify a few random documents manually:

1. Click into 3-5 migrated documents
2. Verify field values correct
3. Check no unexpected changes
4. Confirm document saves correctly

**CHECKPOINT:** All sampled documents correct

---

## Completion Checklist

- [ ] Migration script created with mandatory structure
- [ ] Dry-run executed and reviewed
- [ ] Dry-run output confirmed correct
- [ ] Live migration executed
- [ ] Success count matches dry-run
- [ ] Verification query confirms data
- [ ] Studio UI refreshed AND verified (screenshot)
- [ ] Sample documents manually checked
- [ ] No validation warnings in Studio

**ALL checkboxes must be checked before claiming migration complete.**

---

## Emergency Rollback

If issues discovered after migration:

```typescript
// Create rollback script
async function rollback() {
    const documents = await client.fetch(`...`);
    
    for (const doc of documents) {
        await client
            .patch(doc._id)
            .set({ [field]: [previous value] })
            .commit();
    }
}
```

**Keep backup of previous values for rollback.**

---

## Completion Criteria

Migration is ONLY complete when:

1. ✅ Dry-run reviewed and approved
2. ✅ Live migration executed successfully
3. ✅ Verification query confirms data
4. ✅ Studio UI verified (screenshot taken)
5. ✅ Sample documents checked manually
6. ✅ No errors or warnings

**Missing ANY criterion = migration NOT complete**
