import 'server-only';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML content to prevent XSS.
 * Use this before injecting dynamic content into dangerouslySetInnerHTML.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}

/**
 * Safely stringifies data for JSON-LD scripts throughout the application.
 * Prevents XSS via </script> injection.
 */
export function safeJsonLd(data: any): { __html: string } {
  const json = JSON.stringify(data);
  // Ecape < to \u003c to prevent </script> attacks
  const safeJson = json.replace(/</g, '\\u003c');
  return { __html: safeJson };
}