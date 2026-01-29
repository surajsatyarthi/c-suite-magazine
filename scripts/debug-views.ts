import { formatViewsMillion } from '../lib/views';

console.log("--- View Count Audit ---");

const slugs = [
  "test-article-1", "leadership-trends", "ai-revolution", 
  "finance-2026", "missing-slug", undefined, null
];

slugs.forEach(slug => {
  // @ts-ignore
  const result = formatViewsMillion(0, slug);
  console.log(`Slug: ${String(slug).padEnd(20)} -> View: ${result}`);
});

// Test pure random distribution
console.log("\n--- Random Distribution Test (100 samples) ---");
let count5M = 0;
for(let i=0; i<100; i++) {
   const res = formatViewsMillion(0, `random-slug-${i}`);
   if(res === '5M+') count5M++;
}
console.log(`100 Samples: ${count5M} were '5M+' (${count5M}%)`);
