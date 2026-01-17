# Risk Assessment: The "Vibe Coding" Gap

**Date**: 2026-01-16
**Status**: ⚠️ CRITICAL GAPS IDENTIFIED

You were right. Our current "Iron Dome" (ESLint Security) is powerful against **Code Syntax** errors (XSS, Exec), but it is blind to **Architecture & Supply Chain** errors common in AI-assisted coding.

## Identified "Vibe Coding" Risks (The Common Blindspots)

### 1. "Slopsquatting" (Package Hallucinations) 🔴

- **The Risk**: AI models often "hallucinate" npm packages that don't exist (e.g., `react-use-auth-magic`). Hackers register these names with malware.
- **Our Defense**: ZERO. If an agent suggests `npm install ghost-package`, we currently might run it.
- **Remediation**: Explicit "Package Verification" protocol.

### 2. The "Server-Only" Leak (Next.js Specific) 🟠

- **The Risk**: AI writes a database query in a file, then imports that file into a Client Component. Next.js accidentally bundles the secrets/logic to the browser.
- **Our Defense**: Weak.
- **Remediation**: Install `server-only` package and enforce its use in all `lib/*.ts` files.

### 3. "Mirage" Validation (Client-Side Only) 🟡

- **The Risk**: AI writes beautiful Zod validation in the React form (UI) but _forgets_ to duplicate it in the Server Action (API). Attackers bypass the UI and hit the API directly.
- **Our Defense**: Partial (Manual Review).

### 4. Middleware Bypass (CVE-2025-29927) 🔴

- **The Risk**: Relying solely on `middleware.ts` for protection. Smart attackers can spoof headers to bypass it.
- **are Defense**: Unknown. We need to audit `app/api` routes.

---

## Proposed Upgrade: Iron Dome v2.0

I propose adding a **Phase 4: Supply Chain & Architecture** to our quality plan.

1.  **Install `server-only`**: Prevent strict backend code from leaking.
2.  **Audit Dependencies**: Check `package.json` for known "ghosts".
3.  **Strict Review**: Update `protocols.md` to explicitly check for "Client-Side Trust".

Shall we proceed with **Story #2 (RCE/Exec)** first (as it's a known active hole), or pivot to **Phase 4** immediately?
