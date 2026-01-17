# Vibe-Engineering: Ethics & Strict Guardrails

"Vibe Coding" has immense potential for speed and creativity, but without **Strict Guardrails**, it leads to **Architecture Decay** and **Silent Failures**.

## 1. The Vibe-Engineering Traps

| Trap                       | Description                                                                            |
| :------------------------- | :------------------------------------------------------------------------------------- |
| **The Mock Mirage**        | Tests pass 100%, but the app crashes in production due to missing Physical Reality.    |
| **Silent Security Debt**   | The feature "works," but lacks Auth, HMAC, or input validation.                        |
| **Zombie Context**         | Obsolete or redundant logic accumulated because AI doesn't know what to delete.        |
| **Signal Noise Blindness** | Ignoring critical errors because the dev environment is full of "noise" (lint errors). |

---

## 2. The Strict Guidelines (The "Law of the Machine")

### Guideline I: The "Ground Truth" Rule

**The AI is never allowed to trust its own memory.**

- Before every DB action, AI MUST `view_file` the `schema.ts`.
- Before every API call, AI MUST `view_file` the relevant logic/lib file.

### Guideline II: The "Real-World" Tally (The Black-Gate)

**Mocks are for speed; Smoke Tests are for Truth.**

- Every feature must be verified with a physical check (Raw SQL `SELECT` or file audit).

### Guideline III: The "Zero Noise" Policy

**Lint errors are treated as blockers, not suggestions.**

- Resolve all linter/build noise before declaring a story "Passed."

### Guideline IV: The "Defense-First" Architecture

**Functionality is secondary to Security.**

- Every API route must document its Security Stack (Auth, Rate Limit, Validation).
- No anonymous placeholders.

---

## 3. The "Ralph" Quality Control Loop

1. **Grounding** (Planning): AI views schema/truth sources.
2. **Red-Gate** (Verification): Logic tests with mocks.
3. **Black-Gate** (Verification): Physical tally (SQL/File audit).
