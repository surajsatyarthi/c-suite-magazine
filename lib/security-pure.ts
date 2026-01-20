
/**
 * Server-safe HTML sanitization without jsdom dependency.
 * Strips all HTML tags and dangerous characters to prevent XSS.
 * Lighter alternative to DOMPurify that works in Vercel serverless functions.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  const strip = (s: string) => s
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]*>/g, '');

  let result = strip(html);
  
  // Decode HTML entities
  result = result
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
    
  // Second pass to catch any tags that were encoded
  result = strip(result);
  
  // Final safety strip of any stray brackets
  return result.replace(/[<>]/g, '').trim();
}

/**
 * Safely stringifies data for JSON-LD scripts throughout the application.
 * Prevents XSS via </script> injection.
 */
export function safeJsonLd(data: any): { __html: string } {
  const json = JSON.stringify(data);
  // Escape all < to \u003c to prevent script tag injection and early termination
  const safeJson = json.replace(/</g, '\\u003c');
  return { __html: safeJson };
}
