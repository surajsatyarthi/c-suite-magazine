# SUPREME RALPH CONSTITUTION (v3.1)

## SINGLE SOURCE OF TRUTH (SSoT) — OFFICIAL & ONLY VALID DOCUMENT

**Effective Date:** January 25, 2026  
**Authority:** This document is the **sole authoritative source** for all engineering, security, and operational protocols in this repository.

**MANDATORY RULE:**  
All previous documents (RALPH_OMNIBUS.md, MANDATORY_PROTOCOLS.md, RALPH_PROTOCOL.md, protocols.md, operational.md, world_class_engineering_standards.md, etc.) are **officially deprecated** and **must be deleted** after archiving.

**Motto:** "Nullius in verba" — Take nobody's word for it.

**Compliance Rule:**  
Any reference to deprecated documents in reports, plans, or commit messages will trigger an automatic failure via `scripts/canonical-enforcer.sh`.

────────────────────────────────────

### 1. THE 10 COMMANDMENTS (Non-Negotiable Laws)

Violation of any law = **P0 Protocol Breach**

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

### 2. THE 10 QUALITY GATES (Mandatory Lifecycle)

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

### 3. SANITY CMS PROTOCOLS

- Schema changes → `sanity schema validate` → `sanity schema deploy`
- Always run migrations with `--dry-run` first
- Verify via GROQ + Studio UI

### 4. EMERGENCY PROTOCOL

1. Stabilize → Revert → Purge Cache
2. Create Forensic Report (cite which gate was bypassed)
3. Fix using full 10 Gates (No shortcuts allowed)

### 5. CHANGE LOG

- v3.2 — Added Appendix A: Git Forensics & Debugging Protocols (Jan 28, 2026)
- v3.1 — Major cleanup, stronger SSoT language, deletion mandate (Jan 25, 2026)

---

## APPENDIX A: GIT FORENSICS & DEBUGGING PROTOCOLS

**Origin:** Lessons from Golden Card RCA (Jan 28, 2026)  
**Incident:** Critical UI component "disappeared" from production. Root cause: forgotten git stash from 4 days prior.

### A.1 PHASE 0: STATE VALIDATION (MANDATORY FIRST STEP)

**Rule:** For ANY "missing code" investigation, run these commands BEFORE traditional debugging:

```bash
# 1. Check for orphaned work
git stash list

# 2. Search stashes by keyword
git stash list | grep -i "<feature-name>|<issue-number>"

# 3. Check unmerged feature branches
git branch -a | grep feature/

# 4. Include ALL refs in history search
git log --all --oneline --since="30 days ago"
```

**Rationale:** Code "disappearances" are often **non-integrations** (never merged), not **regressions** (deleted).

### A.2 STASH MANAGEMENT PROTOCOL

**Before Stashing Work:**

- [ ] Add descriptive message with issue number: `git stash push -m "WIP: [#Issue-X] <feature-description> - RESUME BEFORE LAUNCH"`
- [ ] Document in issue tracker: Add checkbox in `docs/ISSUES_LOG.md` → `- [ ] Resume stashed work (stash@{N})`
- [ ] Set calendar reminder if time-sensitive

**Before Context Switching:**

- [ ] Check for related stashes: `git stash list | grep issue-X`
- [ ] Create draft PR if work is substantial
- [ ] Update issue status to "PAUSED" with stash reference

### A.3 GIT ALIASES (ADD TO .gitconfig)

```ini
[alias]
  stash-search = "!f() { git stash list | grep -i \"$1\"; }; f"
  stash-age = "!git stash list --date=relative"
  stash-forgotten = "!git stash list --date=format:'%Y-%m-%d' | awk -F: '{print $1, $NF}' | grep -v $(date +%Y-%m-%d)"
```

### A.4 PRE-DEPLOYMENT STASH AUDIT

**Checklist:** Before marking ANY issue as RESOLVED:

- [ ] Run `git stash-forgotten` to find aged stashes
- [ ] Verify all feature branches for `<issue-number>` are merged or archived
- [ ] Check stash list for WIP commits related to current issue

### A.5 TIMELINE RECONSTRUCTION QUESTIONS

**Ask User Before Debugging:**

1. "When did you last see this working?" (Date/time)
2. "Where was it working?" (Local dev / Staging / Production)
3. "Was it ever deployed?" (Check deployment logs vs. feature branch history)

**Why:** Prevents assumption failures (assuming "working code" was in `main`).

### A.6 COGNITIVE FAILURE MODES (ANTI-PATTERNS)

| Failure Mode                | Description                                    | Prevention                                           |
| --------------------------- | ---------------------------------------------- | ---------------------------------------------------- |
| **Assumption Failure**      | Assuming reported "working code" was deployed  | Always verify deployment history vs. local branches  |
| **Search Strategy Failure** | Only checking commit history, ignoring stashes | Always run Phase 0 first (stash list + branch check) |
| **Communication Failure**   | Not asking clarifying questions about state    | Use Timeline Reconstruction Questions (A.5)          |

### A.7 EMERGENCY STASH RECOVERY

```bash
# Inspect stash contents
git stash show -p stash@{N}

# Show specific file from stash
git stash show -p stash@{N} -- path/to/file.tsx

# Extract file without applying stash
git show stash@{N}:app/components/Component.tsx > recovered.tsx

# Apply stash with conflict resolution
git stash pop stash@{N}
git checkout --theirs <config-files>  # Keep updated configs
```

### A.8 INTEGRATION WITH 10 GATES

**Gate 1 Enhancement:** Physical Audit now includes:

- [ ] `git stash list` check
- [ ] Feature branch audit (`git branch -a | grep <feature>`)
- [ ] Stash content inspection if aged >3 days

**Gate 3 Enhancement:** Blueprint must document:

- Current stash status (if applicable)
- Plan for merging/applying existing WIP work

---

**Signed:** Systemic Quality Agent
