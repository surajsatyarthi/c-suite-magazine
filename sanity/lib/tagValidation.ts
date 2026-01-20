/**
 * Tag Validation Rules for Sanity CMS
 * Prevents stopwords, enforces min length, suggests case normalization
 * 
 * Features:
 * - Stopword blocking with helpful suggestions
 * - Minimum 3-character requirement (except whitelisted acronyms)
 * - Case normalization suggestions
 * - Auto-rollback if >10 errors/hour
 */

// Comprehensive stopword list
const STOPWORDS = [
  'his', 'her', 'was', 'but', 'she', 'the', 'a', 'an', 'and', 'or', 
  'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 
  'is', 'are', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 
  'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 
  'can', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 
  'it', 'we', 'they', 'them', 'him', 'not', 'how', 'why', 'when', 
  'where', 'what', 'which', 'who'
];

// Invalid short tags
const INVALID_SHORT_TAGS = ['---', 'gen', 'tan', 'sml', 'm3m', 'dv8', 'art'];

// Whitelisted acronyms (allowed despite being short)
const ACRONYM_WHITELIST = ['AI', 'CEO', 'CTO', 'CFO', 'COO', 'CMO', 'CIO', 
  'ESG', 'BFSI', 'IT', 'HR', 'PR', 'VC', 'IPO', 'SaaS', 'B2B', 'B2C'];

// Case normalization mappings (for suggestions)
const CASE_SUGGESTIONS: Record<string, string> = {
  'Opinion': 'opinion',
  'CxO Interview': 'cxo interview',
  'Innovation': 'innovation',
  'Leadership': 'leadership',
  'ai': 'AI',
  'esg': 'ESG',
  'cfo': 'CFO',
  'ceo': 'CEO',
  'cto': 'CTO',
  'coo': 'COO',
  'cmo': 'CMO',
  'cio': 'CIO',
  'bfsi': 'BFSI',
  'it': 'IT'
};

// Auto-rollback monitoring
let errorCount = 0;
let errorWindow = Date.now();
let isValidationDisabled = false;

interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
  suggestion?: string;
}

/**
 * Send alert to monitoring system
 */
function sendAlert(message: string): void {
  console.error(`🚨 ALERT: ${message}`);
  // TODO: Integrate with Slack/email webhook in production
  // Example: await fetch(process.env.SLACK_WEBHOOK_URL, { method: 'POST', body: JSON.stringify({ text: message }) });
}

/**
 * Main validation function with auto-rollback
 */
export function validateTag(tag: string): ValidationResult {
  // Auto-rollback check
  if (isValidationDisabled) {
    return {
      valid: true,
      warning: 'Validation temporarily disabled due to high error rate. Please use caution with tag selection.'
    };
  }

  const trimmedTag = tag.trim();

  // Empty tag check
  if (!trimmedTag) {
    return { valid: false, error: 'Tag cannot be empty' };
  }

  // Stopword check
  if (STOPWORDS.includes(trimmedTag.toLowerCase())) {
    incrementErrorCount();
    return {
      valid: false,
      error: `"${trimmedTag}" is a stopword and provides no semantic value`,
      suggestion: 'Try: leadership, innovation, business strategy'
    };
  }

  // Invalid short tag check
  if (INVALID_SHORT_TAGS.includes(trimmedTag.toLowerCase())) {
    incrementErrorCount();
    return {
      valid: false,
      error: `"${trimmedTag}" is not a valid tag`,
      suggestion: 'Use descriptive, meaningful tags'
    };
  }

  // Minimum length check (except whitelisted acronyms)
  if (trimmedTag.length < 3 && !ACRONYM_WHITELIST.includes(trimmedTag.toUpperCase())) {
    incrementErrorCount();
    return {
      valid: false,
      error: 'Tags must be at least 3 characters',
      suggestion: 'Use full words, not abbreviations'
    };
  }

  // Case normalization suggestion (warning, not error)
  if (CASE_SUGGESTIONS[trimmedTag]) {
    return {
      valid: true,
      warning: `Suggested: "${CASE_SUGGESTIONS[trimmedTag]}" (${getTagUsageCount(CASE_SUGGESTIONS[trimmedTag])} articles use this format)`
    };
  }

  return { valid: true };
}

/**
 * Validate array of tags
 */
export function validateTags(tags: string[]|null|undefined): string | true {
  if (!Array.isArray(tags)) return true;

  const errors: string[] = [];
  const warnings: string[] = [];
  const seenTags = new Set<string>();

  for (const tag of tags) {
    const trimmed = tag.trim().toLowerCase();
    
    // Duplicate check
    if (seenTags.has(trimmed)) {
      errors.push(`❌ Duplicate tag: "${tag}"`);
      continue;
    }
    seenTags.add(trimmed);

    const result = validateTag(tag);
    
    if (!result.valid && result.error) {
      errors.push(`❌ "${tag}": ${result.error}${result.suggestion ? ` (${result.suggestion})` : ''}`);
    }
    
    if (result.warning) {
      warnings.push(`⚠️ "${tag}": ${result.warning}`);
    }
  }

  // Return errors (blocks save)
  if (errors.length > 0) {
    return `Tag validation failed:\n${errors.join('\n')}`;
  }

  // Show warnings but allow save
  if (warnings.length > 0) {
    console.warn('Tag warnings:', warnings.join('\n'));
  }

  return true;
}

/**
 * Auto-rollback logic: Increment error count and disable if threshold exceeded
 */
function incrementErrorCount(): void {
  errorCount++;

  // Reset counter every hour
  if (Date.now() - errorWindow > 3600000) {
    errorCount = 0;
    errorWindow = Date.now();
    if (isValidationDisabled) {
      console.log('✅ Error rate normalized. Re-enabling validation.');
      isValidationDisabled = false;
    }
    return;
  }

  // Auto-disable if >10 errors in 1 hour
  if (errorCount > 10) {
    isValidationDisabled = true;
    sendAlert('🚨 CRITICAL: Tag validation auto-disabled due to high error rate (>10 errors/hour). Manual review required.');
    console.error('VALIDATION AUTO-DISABLED: >10 errors in past hour');
  }
}

/**
 * Helper: Get usage count for a tag (placeholder - will integrate with Sanity in production)
 */
function getTagUsageCount(tag: string): number {
  // TODO: Query Sanity for actual count
  // For now, return static mapping based on our analysis
  const knownCounts: Record<string, number> = {
    'opinion': 86,
    'cxo interview': 65,
    'innovation': 35,
    'leadership': 30,
    'AI': 20
  };
  return knownCounts[tag] || 0;
}

/**
 * Manual override to re-enable validation (for admin use)
 */
export function resetValidation(): void {
  errorCount = 0;
  errorWindow = Date.now();
  isValidationDisabled = false;
  console.log('✅ Tag validation manually reset and re-enabled');
}
