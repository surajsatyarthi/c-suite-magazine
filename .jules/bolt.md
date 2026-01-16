# Bolt's Journal

## 2025-01-28 - [Buffer Polyfill Removal]
**Learning:** `Buffer` usage in Client Components (or shared components imported by Client Components) triggers the inclusion of a large polyfill in the client bundle.
**Action:** Use browser-native `btoa()` for base64 encoding instead of `Buffer.from(...).toString('base64')`. `btoa` is available in both modern browsers and Node.js 16+, making it safe for Next.js App Router components that run in both environments.
