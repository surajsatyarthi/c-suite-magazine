# Ralph Protocol: Phase 1 Assessment (Issue #19)

**Task**: Remediate View Count Anomaly (Issue #19)
**Phase**: Gate 1 (Assessment) -> Planning
**Priority**: P0 (Trust/Accuracy)

## 1. Problem Statement

The current "Hybrid View Model" produces "5M+" too randomly (~12% chance).
The user confirmed that **"5M+" is desirable** for premium content (CXO Interviews) but not for everything.
Currently, 31 CXO Articles exist. We need to ensure THEY get the badge, while random articles do not.

## 2. Threat Model

| Threat             | Mitigation                                                       |
| :----------------- | :--------------------------------------------------------------- |
| **Trust Erosion**  | "If everyone is special, no one is special."                     |
| **Value Dilution** | Paying clients feel cheated if random blogs get the same status. |

## 3. Proposed Solution: "The Intentionality Upgrade" (v2)

### A. Cap the Randomness

Change the Jitter Function in `lib/views.ts`:

- **Old**: Max = 5.3M (Breaks threshold)
- **New**: Max = **4.8M** (Safe Ceiling)

### B. Enable the "God Mode"

- To grant "5M+" status, the editor simply sets `views` in Sanity to `5000000`.
- Logic: `Total = Jitter (4.5M) + Real (5.0M) = 9.5M` -> "5M+".

## 4. Acceptance Criteria

- **AC 1**: Run `scripts/verify-views.ts` on random slugs. **Result must be < 5M**.
- **AC 2**: Run `scripts/verify-views.ts` on a mocked "Paid Article" (Real views = 5M). **Result must be "5M+"**.

## 5. Execution Plan

1.  Modify `lib/views.ts` to clamp jitter to 4.8M.
2.  Modify `scripts/verify-views.ts` to test both cases.
3.  (Optional) Run a script to auto-bump the 31 CXO articles? (User did not request this, but we can offer).

## 6. Permission Request

I request permission to proceed to **Phase 2 (Execution)**.
