# Automated Protocol Enforcement System

## Overview

This directory contains **automated workflow files** that embed verification checkpoints to enforce protocols WITHOUT manual oversight.

## How It Works

### 1. Workflow Files (`.agent/workflows/*.md`)

Each workflow file contains:
- Step-by-step instructions
- Embedded verification checkpoints
- `// turbo` annotations for auto-executable commands
- Mandatory completion criteria

### 2. Checkpoint System

**Automated checkpoints:**
- Commands marked with `// turbo` auto-run and verify exit code
- Exit code 0 = checkpoint passes, continue
- Exit code ≠ 0 = checkpoint fails, STOP workflow

**Manual checkpoints:**
- Require screenshot or proof upload
- Cannot be skipped
- Must be confirmed before proceeding

### 3. Enforcement Mechanism

When following a workflow:

1. AI reads workflow file (e.g., `/sanity-schema-update`)
2. Executes each step in order
3. At each checkpoint marked `// turbo`, command auto-runs
4. If checkpoint fails, workflow STOPS
5. Cannot proceed to next step until checkpoint passes
6. Manual checkpoints require explicit user confirmation

## Available Workflows

| Workflow File | Purpose | Key Checkpoints |
|---------------|---------|-----------------|
| `sanity-schema-update.md` | Update Sanity schema | Schema validation, deployment confirmation, Studio UI verification |
| `data-migration.md` | Migrate Sanity data | Dry-run review, live execution, post-migration verification |
| `deploy-to-production.md` | Deploy to Vercel | Build pass, push confirm, deployment trigger, live site test |

## Usage

### For AI Assistant

When user requests an operation covered by a workflow:

1. **Identify workflow**: Determine which workflow applies
2. **Read workflow**: Use `view_file` to read workflow file
3. **Follow steps**: Execute each step in exact order
4. **Run checkpoints**: Auto-execute `// turbo` commands
5. **Verify output**: Check exit codes and command output
6. **Request proof**: For manual checkpoints, ask user for screenshot/confirmation
7. **No skipping**: Cannot skip steps or checkpoints

**Example:**
```
User: "Add a legacySlug field to CSA schema"

AI: Reading workflow: .agent/workflows/sanity-schema-update.md
    
    Step 1: Creating backup...
    ✓ Backup created
    
    Step 2: Updating schema file...
    ✓ Updated
    
    Step 3: Validating schema... [AUTO-RUN]
    $ pnpm exec sanity schema validate
    ✓ Validated schema (0 errors, 0 warnings)
    
    Step 4: Deploy schema... [AUTO-RUN]
    $ pnpm exec sanity schema deploy
    ✓ Schema deployed
    
    Step 5: CHECKPOINT - Studio UI Verification Required
    Please:
    1. Open Sanity Studio
    2. Hard refresh (Cmd+Shift+R)
    3. Verify new field appears
    4. Take screenshot
    5. Upload screenshot
    
    [WAITING FOR USER - Cannot proceed without screenshot]
```

### Checkpoint Enforcement Logic

```typescript
// Pseudo-code for AI workflow execution
function executeWorkflow(workflowFile) {
    const steps = parseWorkflow(workflowFile);
    
    for (const step of steps) {
        if (step.hasCheckpoint) {
            if (step.isAutoExecutable) {
                // Auto-run and verify
                const result = executeCommand(step.command);
                if (result.exitCode !== 0) {
                    STOP("Checkpoint failed: " + step.name);
                    return;
                }
            } else {
                // Manual verification required
                requestUserConfirmation(step.requirements);
                WAIT_FOR_USER();
            }
        }
        executeStep(step);
    }
}
```

## Benefits

### Prevents Today's Mistakes

| Mistake | Prevented By | How |
|---------|--------------|-----|
| Schema-last violation | `sanity-schema-update.md` step order | Schema deployment enforced before data migration allowed |
| UI cache oversight | Workflow step 5 checkpoint | Mandatory Studio refresh + screenshot requirement |
| Deployment skip | `deploy-to-production.md` checkpoints | Build → Push → Trigger → Verify enforced sequence |
| Premature success claims | Completion criteria | All checkboxes must pass before "complete" |

### Zero Manual Dependency

**Automated enforcement through:**
- `// turbo` auto-execution
- Exit code validation
- Required proof uploads
- Checkpoint blocking logic

**No reliance on:**
- AI remembering to check
- User manually asking for proof
- Good intentions or discipline

## Integration with Existing Tools

### Pre-Deployment Check

Workflows integrate with existing scripts:

```bash
# Workflow calls this automatically
./scripts/pre-deploy-check.sh
```

### Schema Validation

```bash
# Auto-run in schema workflow
pnpm exec sanity schema validate
```

### Vercel Status

```bash
# Auto-run in deployment workflow
pnpm vercel ls | head -10
```

## Extending the System

To add new workflows:

1. Create `.agent/workflows/[operation-name].md`
2. Add YAML frontmatter with description
3. Structure steps with checkpoints
4. Mark auto-executable commands with `// turbo`
5. Define completion criteria checklist

**Template:**
```markdown
---
description: Brief description of operation
---

# Operation Workflow

## Step 1: [Step Name]

Instructions...

// turbo
\`\`\`bash
command-to-auto-run
\`\`\`

**CHECKPOINT:** Expected result

---

## Completion Checklist

- [ ] Criterion 1
- [ ] Criterion 2

ALL checkboxes must be checked.
```

## Failure Modes

**What happens if AI tries to skip checkpoint?**

1. Workflow explicitly states "CHECKPOINT" and requirements
2. Next step references previous checkpoint completion
3. Completion criteria list all checkpoints
4. Cannot claim "done" without all checkpoints passed

**What if AI forgets workflow exists?**

1. Workflows are in `.agent/workflows/` (standard location)
2. User can reference: "Follow sanity-schema-update workflow"
3. AI system instructions remind to check for workflows

**What if checkpoint requirement unclear?**

1. Each checkpoint has explicit "Expected output" or requirements
2. Manual checkpoints specify exact proof needed (screenshot)
3. Completion criteria provide checklist format

## Summary

**Old system:** Relied on AI discipline and memory
**New system:** Automated verification prevents mistakes

**Enforcement:**
- Checkpoints block progress if failed
- Manual verifications require proof
- Completion criteria must be met
- No assumptions or shortcuts possible

**Result:** Protocols enforced automatically, not manually
