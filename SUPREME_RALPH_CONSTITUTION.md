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

- v3.1 — Major cleanup, stronger SSoT language, deletion mandate (Jan 25, 2026)

**Signed:** Systemic Quality Agent
