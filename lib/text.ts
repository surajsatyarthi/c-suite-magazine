// Generic sanitizer that strips Markdown noise and common RTF control tokens
export function sanitizeText(raw?: string): string {
  if (!raw) return ''
  return String(raw)
    // Markdown image/link/code/formatting
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\*\*|__|\*|_/g, '')
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // RTF header/artifacts that sometimes arrive without backslashes
    // Handle concatenated tokens like "rtf1ansi" and numeric suffixes
    .replace(/rtf1[a-z0-9]*/gi, '')
    .replace(/cocoasubrtf[a-z0-9]*/gi, '')
    .replace(/cocoartf[a-z0-9]*/gi, '')
    .replace(/ansicpg\d+/gi, '')
    .replace(/fonttbl|colortbl|stylesheet|applewebdata|macosroman/gi, '')
    // Strip generic RTF control words like \fs24, \pard, \qc, \b0, \i0, \uNNN, etc.
    .replace(/\\[a-zA-Z]+-?\d*/g, '')
    // Remove hex escape sequences like \'e9
    .replace(/\\'[0-9a-fA-F]{2}/g, '')
    // Remove RTF grouping braces
    .replace(/[{}]/g, '')
    // Collapse whitespace and punctuation noise
    .replace(/\s+/g, ' ')
    .replace(/\s*[,;:.]{2,}\s*/g, ' ')
    .trim()
}

export function sanitizeTitle(raw?: string): string {
  return sanitizeText(raw)
}

export function sanitizeExcerpt(raw?: string, title?: string): string {
  const cleaned = sanitizeText(raw)
  const t = title ? sanitizeTitle(title) : ''
  if (!cleaned) return ''
  // Avoid excerpts that duplicate the title exactly or as a prefix
  if (t) {
    const cLower = cleaned.toLowerCase()
    const tLower = t.toLowerCase()
    if (cLower === tLower || cLower.startsWith(tLower)) {
      return ''
    }
  }
  return cleaned
}
