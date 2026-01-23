import { describe, it, expect, vi } from 'vitest';
import { GET } from '../../app/sitemap.xml/route';

// Mock Sanity Client
vi.mock('@/lib/sanity', () => ({
  client: {
    fetch: vi.fn((query) => {
      if (query.includes('_type == "post" || _type == "csa"')) {
        return Promise.resolve([
          { type: 'post', slug: 'test-post', _updatedAt: '2023-01-01', category: 'news' },
          { type: 'csa', slug: 'paid-article', _updatedAt: '2023-01-01' }
        ]);
      }
      if (query.includes('_type == "tag"')) {
        return Promise.resolve([
          { slug: 'innovation', _updatedAt: '2023-01-01' }
        ]);
      }
      return Promise.resolve([]); // Categories
    })
  }
}));

// Mock Database helper
vi.mock('@/lib/db', () => ({
  getExecutiveSlugs: vi.fn().mockResolvedValue(['ceo-pay'])
}));

describe('Sitemap Generator', () => {
  it('should generate XML containing CSA, Tag, and Executive URLs', async () => {
    const response = await GET();
    const text = await response.text();

    console.log(text); // For debug proof

    // Assertions (The Proof Law)
    expect(text).toContain('<loc>https://csuitemagazine.global/csa/paid-article</loc>');
    expect(text).toContain('<loc>https://csuitemagazine.global/tag/innovation</loc>');
    expect(text).toContain('<loc>https://csuitemagazine.global/executive-salaries/ceo-pay</loc>');
    expect(text).toContain('<priority>1</priority>'); // CSA Priority
  });
});
