# Production Execution Rules
## MANDATORY CHECKLIST - Must Complete BEFORE Any Action

**These rules apply to ALL tasks on this production site.**

---

## 🛑 STOP - Before You Start

### Phase 1: UNDERSTAND (2 minutes)
- [ ] What is the exact task?
- [ ] What is the expected outcome?
- [ ] Is this reversible or irreversible?
- [ ] What are the risks if this goes wrong?
- [ ] Am I 100% clear on requirements, or do I need to ask clarifying questions?

### First Principles Check:
- [ ] What are the fundamental facts? (today's date, data availability, API functionality)
- [ ] What am I assuming without verifying?
- [ ] Can I test my assumptions right now?
- [ ] What is the simplest way to verify ground truth?

**Example:** Don't assume "logo APIs exist, this one probably works" → Test: `curl logo.clearbit.com/apple.com`

**HARD STOP:** If unclear, ask user before proceeding.

---

## 🔍 Phase 2: VERIFY (3-5 minutes)

### For External APIs/Services:
- [ ] Does the API/service actually exist and work?
- [ ] Test the API endpoint with a sample request
- [ ] Check API documentation for rate limits, ToS
- [ ] Verify response format matches expectations
- [ ] **NEVER add untested APIs to production**

### For Data:
- [ ] What is today's date?
- [ ] What is the latest available data?
- [ ] Is the data I'm using current or stale?
- [ ] Where is the authoritative source?
- [ ] Can I verify accuracy before importing?

### For Code Changes:
- [ ] Have I read the existing code I'm modifying?
- [ ] Do I understand why it was written this way?
- [ ] Will my change break existing functionality?
- [ ] Does this respect existing patterns and conventions?
- [ ] Am I modifying global styles/config that affects other pages?

**HARD STOP:** If verification fails, do NOT proceed. Report findings to user.

---

## 📋 Phase 3: PLAN (3-5 minutes)

### Create a written plan:
1. What files will be modified?
2. What is the sequence of operations?
3. What dependencies exist between operations?
4. What can go wrong at each step?
5. How will I verify success?
6. What is the rollback plan if it fails?

### Risk Assessment:
- **HIGH RISK:** Database changes, API integrations, global config
- **MEDIUM RISK:** Component changes, new features
- **LOW RISK:** Copy changes, styling tweaks

**For HIGH RISK tasks:**
- [ ] Written plan approved by user BEFORE execution
- [ ] Test on subset before full deployment
- [ ] Backup/rollback strategy in place

---

## ✅ Phase 4: EXECUTE

### Rules:
1. **Read before write** - Always read files before modifying
2. **Test before deploy** - Verify functionality works
3. **Batch commits** - 5-6 related changes per commit, not individual changes
4. **Document changes** - Clear commit messages with context

### Production Safety:
- [ ] This is a LIVE production site with REAL users
- [ ] Changes deploy immediately on push
- [ ] Broken code = broken user experience = damaged reputation
- [ ] There are NO "quick fixes" - everything must be done right

---

## 🚫 NEVER DO THIS

1. ❌ Use external APIs without testing them first
2. ❌ Assume data is current without checking
3. ❌ Modify global CSS/config without understanding impact
4. ❌ Make multiple tiny commits instead of batching
5. ❌ Skip reading existing code before modifying
6. ❌ Rush to "complete the task" without verification
7. ❌ Treat production like a playground/testing environment

---

## ✓ ALWAYS DO THIS

1. ✅ Measure twice, cut once
2. ✅ Verify external dependencies actually work
3. ✅ Check data currency and accuracy
4. ✅ Read and understand existing code
5. ✅ Ask when uncertain
6. ✅ Plan before executing
7. ✅ Respect that this is a live business

---

## 📊 Before Presenting ANY Plan to User

### Checklist:
- [ ] I have verified all external dependencies work
- [ ] I have checked data is current
- [ ] I have read all relevant existing code
- [ ] I understand the full scope and implications
- [ ] I have identified all risks
- [ ] I have a rollback plan
- [ ] I am confident this will work correctly

**If you cannot check all boxes, the plan is NOT ready.**

---

## 🎯 Success Criteria

**A task is complete when:**
1. ✅ Functionality works as expected
2. ✅ No broken dependencies or side effects
3. ✅ Data is accurate and current
4. ✅ Code follows existing patterns
5. ✅ Changes are committed and deployed
6. ✅ User confirms it meets requirements

**NOT when:**
❌ Code is written but untested
❌ Changes are pushed but break something
❌ Task is "done" but user has to fix issues

---

## 🔄 Pattern Recognition

**If you find yourself:**
- Moving fast without pausing
- Assuming things work without testing
- Making multiple small commits
- Fixing issues you created
- Hearing "why didn't you check this first?"

**STOP. You're rushing. Go back to Phase 1.**

---

## 🎓 Senior Programmer Principles

### 1. Blast Radius Thinking
- **What's the worst that can happen if this fails?**
- How many users/pages/systems are affected?
- **Rule:** Test 1 → verify → scale to rest (never all at once)

### 2. Chesterton's Fence
- Never remove/modify code until you understand WHY it exists
- **Rule:** Before changing existing code, document its original purpose

### 3. Progressive Rollout
- Don't change 10 things at once
- Change 1 thing → verify → change next thing
- **Rule:** One logical change per deployment cycle

### 4. Edge Cases First
- Don't think "happy path" - think "what breaks this?"
- What if API returns 500? Data is null? User has 0 records?
- **Rule:** List 3 ways this can fail before writing code

### 5. Observability
- How will I KNOW if this is working in production?
- What metrics/logs tell me success vs failure?
- **Rule:** Define success criteria BEFORE deploying

### 6. Idempotency
- Can I run this script 5 times safely?
- Does re-running fix things or break them?
- **Rule:** All scripts must be safe to re-run (use `ON CONFLICT DO UPDATE`)

### 7. Automation Over Repetition
- Am I doing the same manual task repeatedly?
- Will I need to do this again in 3 months?
- **Rule:** If you'll do it more than 3 times, automate it

### 8. Simplicity Over Cleverness
- Will a junior developer understand this in 6 months?
- Can I solve this WITHOUT adding complexity?
- **Rule:** Build the simplest thing that works

### 9. Delete More Than You Add
- Can I solve this WITHOUT new code?
- Can I delete old code while adding new?
- **Rule:** For every 100 lines added, try to delete 50

### 10. Reversibility Test
- Can I undo this in 30 seconds if it breaks?
- **Rule:** If you can't undo it quickly, don't do it without backup

---

## 🚦 Two-Checkpoint Enforcement System

### Checkpoint 1: PLANNING (Before Starting Work)

**User asks:** "Show me your plan following EXECUTION_RULES"

**I must provide:**
- [ ] Phase 1 complete - Task understood, risks identified
- [ ] Phase 2 complete - All verification results with PROOF
- [ ] Written plan with numbered steps
- [ ] Risk assessment (HIGH/MEDIUM/LOW)
- [ ] Proof of verification (test results, screenshots, dates)

**User says:** "APPROVED" or "STOP - Go verify X first"

---

### Checkpoint 2: VALIDATION (Before Deployment)

**User asks:** "Show me it works"

**I must provide:**
- [ ] Test results demonstrating functionality
- [ ] Edge cases considered and handled
- [ ] Rollback plan if deployment fails
- [ ] Confirmation data is current (with dates/sources)

**User says:** "APPROVED TO DEPLOY" or "STOP - Fix X first"

---

### Enforcement Protocol

**If I skip ahead without approval:**
- User stops me: "Which checkpoint are we at? Show me the checklist."

**If I can't provide verification proof:**
- User rejects: "STOP - Go verify and come back with proof"

**The rules are not self-enforcing. User vigilance + written rules = quality work.**

---

## Remember:

> "I don't have time to do it twice, so I'll do it right the first time."
>
> "Fast and wrong is slower than careful and right."
>
> "This is production. There are no do-overs."

---

**Last Updated:** 2026-01-01 (Added First Principles, Senior Programmer Principles, Two-Checkpoint System)
**Applies To:** All work on csuitemagazine.global
**Mandatory:** Yes, no exceptions
