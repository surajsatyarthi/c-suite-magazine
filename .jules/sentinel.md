## 2024-05-22 - Unauthenticated API Endpoints
**Vulnerability:** Several API endpoints (`/api/ads`, `/api/writers`) allowed POST/PUT/PATCH operations without any authentication, permitting arbitrary data modification in the CMS.
**Learning:** Adding new API routes often happens without checking for global middleware coverage. Next.js App Router route handlers are isolated and require explicit protection if not covered by a global middleware matcher.
**Prevention:** Implement a standard `isAuthenticated()` check for all internal API routes. Use `lib/api-auth.ts` which falls back to common secrets (`CRON_SECRET`, `VERCEL_WEBHOOK_SECRET`) to ensure some level of protection even if `API_SECRET` is missed in initial setup.
