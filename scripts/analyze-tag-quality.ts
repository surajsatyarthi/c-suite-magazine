import { client } from '../lib/sanity';

async function analyzeTagQuality() {
  const query = `*[_type == 'post' || _type == 'csa'] {
    _id,
    title,
    tags,
    _type
  }`;
  
  const posts = await client.fetch(query);
  
  const allTags = new Set<string>();
  const tagFrequency = new Map<string, number>();
  const tagsByArticle = new Map<string, string[]>();
  
  posts.forEach((post: any) => {
    if (Array.isArray(post.tags)) {
      post.tags.forEach((tag: string) => {
        if (tag) {
          allTags.add(tag);
          tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
        }
      });
      tagsByArticle.set(post._id, post.tags);
    }
  });
  
  console.log('=== TAG QUALITY ANALYSIS ===\n');
  console.log(`Total unique tags: ${allTags.size}`);
  console.log(`Total articles analyzed: ${posts.length}\n`);
  
  // Sort by frequency
  const sorted = Array.from(tagFrequency.entries())
    .sort((a, b) => b[1] - a[1]);
  
  console.log('\n=== TOP 100 MOST USED TAGS ===');
  sorted.slice(0, 100).forEach(([tag, count], idx) => {
    console.log(`${idx + 1}. "${tag}": ${count} articles`);
  });
  
  // Identify potential stopwords (common English words)
  const commonStopwords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'can', 'his', 'her', 'their', 'its',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we',
    'they', 'them', 'him'
  ];
  
  const foundStopwords = sorted.filter(([tag]) => 
    commonStopwords.includes(tag.toLowerCase())
  );
  
  console.log('\n=== STOPWORD ISSUES ===');
  console.log(`Found ${foundStopwords.length} stopwords:`);
  foundStopwords.forEach(([tag, count]) => {
    console.log(`  - "${tag}": ${count} articles`);
  });
  
  // Identify case sensitivity issues (same tag with different cases)
  const tagsByLowercase = new Map<string, string[]>();
  allTags.forEach(tag => {
    const lower = tag.toLowerCase();
    if (!tagsByLowercase.has(lower)) {
      tagsByLowercase.set(lower, []);
    }
    tagsByLowercase.get(lower)!.push(tag);
  });
  
  const caseIssues = Array.from(tagsByLowercase.entries())
    .filter(([, variants]) => variants.length > 1)
    .sort((a, b) => b[1].length - a[1].length);
  
  console.log('\n=== CASE SENSITIVITY ISSUES ===');
  console.log(`Found ${caseIssues.length} tags with case inconsistencies:`);
  caseIssues.slice(0, 50).forEach(([lower, variants]) => {
    const counts = variants.map(v => `"${v}" (${tagFrequency.get(v)})`).join(', ');
    console.log(`  - ${counts}`);
  });
  
  // Identify very short tags (likely problematic)
  const shortTags = sorted.filter(([tag]) => tag.length <= 3);
  console.log('\n=== VERY SHORT TAGS (≤3 chars) ===');
  console.log(`Found ${shortTags.length} very short tags:`);
  shortTags.forEach(([tag, count]) => {
    console.log(`  - "${tag}": ${count} articles`);
  });
  
  // Export summary stats
  console.log('\n=== SUMMARY STATISTICS ===');
  console.log(`Total tags: ${allTags.size}`);
  console.log(`Stopwords found: ${foundStopwords.length}`);
  console.log(`Case inconsistencies: ${caseIssues.length}`);
  console.log(`Very short tags: ${shortTags.length}`);
  console.log(`Single-use tags: ${sorted.filter(([, count]) => count === 1).length}`);
}

analyzeTagQuality()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
