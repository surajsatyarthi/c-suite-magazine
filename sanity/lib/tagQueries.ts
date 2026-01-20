/**
 * GROQ queries for Tag Autocomplete
 * Fetches frequently used tags to suggest to writers
 */

export const GET_POPULAR_TAGS = `
  *[_type == "post" && defined(tags)] | order(_createdAt desc)[0...100] {
    tags
  }
`;

/**
 * Filter and count unique tags from raw results
 */
export function processPopularTags(posts: { tags: string[] }[]): string[] {
  if (!Array.isArray(posts)) return [];
  const tagCounts: Record<string, number> = {};
  
  posts.forEach(post => {
    post.tags?.forEach(tag => {
      const normalized = tag.trim();
      if (normalized) {
        tagCounts[normalized] = (tagCounts[normalized] || 0) + 1;
      }
    });
  });

  // Return tags used more than once, sorted by popularity
  return Object.entries(tagCounts)
    .filter(([_, count]) => count >= 2) // Filter out single-use tags to improve quality
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);
}
