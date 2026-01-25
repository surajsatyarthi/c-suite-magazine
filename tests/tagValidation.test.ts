import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateTag, validateTags, resetValidation } from '../sanity/lib/tagValidation';

describe('Tag Validation', () => {
  beforeEach(() => {
    // Reset validation state before each test
    resetValidation();
  });

  describe('validateTag', () => {
    it('should reject stopwords', () => {
      const result = validateTag('his');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('stopword');
    });

    it('should reject invalid short tags', () => {
      const result = validateTag('---');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not a valid tag');
    });

    it('should reject tags shorter than 3 characters (non-acronyms)', () => {
      const result = validateTag('ab');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 3 characters');
    });

    it('should allow whitelisted acronyms', () => {
      const result = validateTag('AI');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should suggest case normalization', () => {
      const result = validateTag('Opinion');
      expect(result.valid).toBe(true);
      expect(result.warning).toContain('opinion');
    });

    it('should accept valid tags', () => {
      const result = validateTag('leadership');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.warning).toBeUndefined();
    });

    it('should reject empty tags', () => {
      const result = validateTag('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    it('should trim whitespace', () => {
      const result = validateTag('  leadership  ');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateTags', () => {
    it('should validate array of tags', () => {
      const result = validateTags(['leadership', 'innovation', 'CEO']);
      expect(result).toBe(true);
    });

    it('should return error message for invalid tags', () => {
      const result = validateTags(['leadership', 'his', 'innovation']);
      expect(typeof result).toBe('string');
      expect(result).toContain('his');
      expect(result).toContain('stopword');
    });

    it('should reject duplicate tags', () => {
      const result = validateTags(['AI', 'AI', 'leadership'])
      expect(typeof result).toBe('string')
      expect(result).toContain('Duplicate tag: "AI"')
    })

    it('should reject duplicate tags with different casing', () => {
      const result = validateTags(['leadership', 'Leadership'])
      expect(typeof result).toBe('string')
      expect(result).toContain('Duplicate tag: "Leadership"')
    })

    it('should handle multiple errors', () => {
      const result = validateTags(['his', 'her', '---']);
      expect(typeof result).toBe('string');
      expect(result).toContain('his');
      expect(result).toContain('her');
      expect(result).toContain('---');
    });

    it('should handle non-array input gracefully', () => {
      const result = validateTags(null as any);
      expect(result).toBe(true);
    });

    it('should show warnings for case issues', () => {
      // This should pass but log warnings
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = validateTags(['Opinion', 'innovation']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Auto-rollback functionality', () => {
    it('should not trigger rollback for normal error count', () => {
      // Trigger 5 errors
      for (let i = 0; i < 5; i++) {
        validateTag('his');
      }
      
      // Next validation should still enforce rules
      const result = validateTag('her');
      expect(result.valid).toBe(false);
    });

    // Note: Auto-rollback after >10 errors requires integration testing
    // as it involves timing and alert mechanisms
  });
});
