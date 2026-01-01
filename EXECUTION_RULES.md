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

## Remember:

> "I don't have time to do it twice, so I'll do it right the first time."
>
> "Fast and wrong is slower than careful and right."
>
> "This is production. There are no do-overs."

---

**Last Updated:** 2026-01-01
**Applies To:** All work on csuitemagazine.global
**Mandatory:** Yes, no exceptions
