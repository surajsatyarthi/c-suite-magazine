// This file re-exports pure security functions
// Removed 'server-only' to allow usage in components like Breadcrumbs.tsx
export { sanitizeHtml, safeJsonLd } from './security-pure';