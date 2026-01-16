# Sentinel's Journal

## 2025-02-12 - [CRITICAL] Webhook Authentication Bypass
**Vulnerability:** The Vercel webhook endpoint (`app/api/vercel-webhook/route.ts`) contained a fallback mechanism that allowed bypassing signature verification by providing the secret in a query parameter (`?secret=...`).
**Learning:** Debug/testing backdoors often persist into production code if not flagged. While convenient for manual testing, allowing secrets in URL parameters is insecure as they are often logged in access logs, proxy logs, and browser history.
**Prevention:** Remove all "testing only" bypasses before merging to production. Use proper mocking or local environment variables for testing instead of modifying the authentication logic to be permissive. Strict signature verification should always be enforced in production-facing webhooks.
