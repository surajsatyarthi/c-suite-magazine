# Implementation Plan - Issue #48: Secret Management Governance

## 1. Problem Statement

Structural failures in secret handling led to the accidental deletion of valid API tokens during automated cleanups, resulting in repeated requests for credentials and blocked execution.

## 2. Proposed System: The "Vault Protocol"

### Component A: Persistent Indexing

- **Action**: Create `docs/INTERNAL_SECRETS_MAP.md`.
- **Purpose**: A central, non-sensitive index that tracks WHICH secrets exist and WHERE they are stored (e.g., "Sanity Editor Token -> .env.local").
- **Security**: No actual values will ever be stored in the map; it serves as a "Checklist for Recovery."

### Component B: Hardened Persistence

- **Action**: Every credential received in chat must be written to `.env.local` within ONE tool call.
- **Verification**: Immediate dry-run verification of the token's scope (Viewer vs Editor).

### Component C: Cleanup Guards

- **Action**: Update all deletion/cleanup scripts and manual commands to explicitly exclude `.env*` and `.sanity*` patterns.

## 3. Immediate Action Items

- [/] Request **Sanity Write Token** from user.
- [ ] Persist token to `.env.local`.
- [ ] Verify token with a `patch` operation on a test document.
