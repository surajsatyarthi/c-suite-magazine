# Agent Knowledge Base (Long-Term Memory)

**Status**: Active
**Protocol**: Ralph

## Critical Laws (The "Physics" of this Repository)

1.  **The Limit Law**: NEVER write a `SELECT` query without a `LIMIT` clause.
    - _Why_: Caused a production crash on 2026-01-15 (The "IndianOil Incident").
    - _Verified By_: `scripts/guardian-static.js`

2.  **The Security Law**: NEVER use `dangerouslySetInnerHTML` without `dompurify` sanitation.
    - _Why_: Next.js XSS vulnerability (The "Vibe Risk").
    - _Verified By_: `eslint-plugin-security`

3.  **The Verify Law**: NEVER mark a task complete without running the _specific_ Acceptance Criteria defined in the User Story.
    - _Why_: Prevent "Mock Mirages" and "silent failures".

    - _Verified By_: `husky` pre-commit hooks.

4.  **The JSON-LD Law**: NEVER use `JSON.stringify` inside `dangerouslySetInnerHTML` for scripts. ALWAYS use `safeJsonLd()`.
    - _Why_: Prevents `</script>` injection attacks (XSS).
    - _Verified By_: `eslint-plugin-security` & Manual Review.
