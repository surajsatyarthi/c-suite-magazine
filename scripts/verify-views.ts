import { formatViewsMillion } from '../lib/views';

console.log("--- View Count Verification (Issue #19) ---");

// Test 1: Random Slugs (Should NEVER be 5M+)
console.log("\n1. Testing 100 Random Slugs (Expect: 2.1M - 4.8M, NEVER 5M+)");
let failures = 0;
for(let i=0; i<100; i++) {
  const res = formatViewsMillion(0, `slug-${i}`);
  if (res === '5M+' || parseFloat(res) > 4.9) {
    console.error(`❌ FAILURE: slug-${i} got ${res}`);
    failures++;
  }
}
if (failures === 0) console.log("✅ 100/100 Random Slugs Passed (Safe Range)");

// Test 2: Intentional Override (Expect: 5M+)
console.log("\n2. Testing Intentional Query (Expect: 5M+)");
const paid = formatViewsMillion(5000000, 'paid-article');
if (paid === '5M+') console.log(`✅ Paid Article: ${paid}`);
else console.error(`❌ Paid Article Failed: ${paid}`);

// Test 3: Fallback (Expect: 2.1 M)
console.log("\n3. Testing Missing Slug (Expect: 2.1 M)");
const fallback = formatViewsMillion(0, undefined);
if (fallback === '2.1 M') console.log(`✅ Fallback: ${fallback}`);
else console.error(`❌ Fallback Failed: ${fallback}`);
