# Ralph Remediation Report: Issue #12 (Server-to-Client Leak Risk)

## Problem Statement

Sensitive server-side logic and Sanity API tokens were exposed to client-side bundles because `lib/sanity.ts` (containing token handling) was imported by client components (e.g., `ArchiveFilters.tsx`). This presented a credential leak risk and increased bundle size.

## Assessment & Findings

- `lib/sanity.ts` lacked `server-only` guards.
- The `getClient()` function accessed `SANITY_API_TOKEN` and `SANITY_WRITE_TOKEN`.
- Multiple client components imported `urlFor` and `client` from this shared module.

## Remediation Actions

1. **Module Splitting**: Created `lib/sanity.server.ts` protected by `import 'server-only'` to handle all authenticated Sanity operations.
2. **Sanitization**: Removed `getClient()` and token accesses from `lib/sanity.ts`, making it safe for client-side imports.
3. **Utility Hardening**: Applied `server-only` guards to `articleHelpers.ts` and `articleImageService.ts`.
4. **Migration**: Updated all server-side pages (`tag`, `category`, `csa`) to use `getServerClient()` from the protected module.

## Verification Result

- ✅ **Build Integrity**: `next build` and `tsc` pass with zero errors.
- ✅ **Import Boundary**: Sensitive logic is physically separated from client-safe exports.
- ✅ **Functional Parity**: Draft mode and private dataset access remain functional through `getServerClient()`.

## Prevention Strategy

Strict adherence to Ralph Protocol B: Any module accessing `process.env` secrets or using server-specific libraries must be guarded with `server-only`. Public clients must be strictly isolated in `sanity/lib/client.ts`.
