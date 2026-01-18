import 'server-only';

/**
 * Server-safe HTML sanitization without jsdom dependency.
 * Strips all HTML tags and dangerous characters to prevent XSS.
 * Lighter alternative to DOMPurify that works in Vercel serverless functions.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  return html
    // Remove all HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags and content
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Decode HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    // Remove any remaining dangerous characters
    .replace(/[<>]/g, '')
    .trim();
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