import { calculateReadingTime } from '../lib/calculateReadingTime';

console.log('🧪 Testing Reading Time Calculation\n');
console.log('---\n');

// Test 1: Empty content
console.log('Test 1: Empty content');
const emptyResult = calculateReadingTime(null);
console.log(`   Result: ${emptyResult} minutes`);
console.log(`   Expected: 1 minute (minimum)`);
console.log(`   Status: ${emptyResult === 1 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 2: Very short content (50 words)
console.log('Test 2: Very short content (50 words)');
const shortContent = [
    {
        _type: 'block',
        children: [
            {
                _type: 'span',
                text: 'This is a very short article with exactly fifty words. We need to test that the minimum reading time is enforced correctly. Even though this content is brief and would take less than a minute to read at 200 words per minute, the result should still be one minute as the minimum.'
            }
        ]
    }
];
const shortResult = calculateReadingTime(shortContent);
console.log(`   Result: ${shortResult} minutes`);
console.log(`   Expected: 1 minute (minimum)`);
console.log(`   Status: ${shortResult === 1 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 3: Medium content (400 words = 2 minutes)
console.log('Test 3: Medium content (~400 words = 2 minutes)');
const mediumText = Array(400).fill('word').join(' ');
const mediumContent = [
    {
        _type: 'block',
        children: [
            {
                _type: 'span',
                text: mediumText
            }
        ]
    }
];
const mediumResult = calculateReadingTime(mediumContent);
console.log(`   Result: ${mediumResult} minutes`);
console.log(`   Expected: 2 minutes`);
console.log(`   Status: ${mediumResult === 2 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 4: Long content (1000 words = 5 minutes)
console.log('Test 4: Long content (~1000 words = 5 minutes)');
const longText = Array(1000).fill('word').join(' ');
const longContent = [
    {
        _type: 'block',
        children: [
            {
                _type: 'span',
                text: longText
            }
        ]
    }
];
const longResult = calculateReadingTime(longContent);
console.log(`   Result: ${longResult} minutes`);
console.log(`   Expected: 5 minutes`);
console.log(`   Status: ${longResult === 5 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 5: Multiple blocks with realistic content
console.log('Test 5: Multiple blocks with realistic content');
const realisticContent = [
    {
        _type: 'block',
        children: [
            {
                _type: 'span',
                text: 'Introduction paragraph with about twenty words to simulate realistic article content structure and flow.'
            }
        ]
    },
    {
        _type: 'block',
        children: [
            {
                _type: 'span',
                text: 'Second paragraph continues the narrative. ' + Array(180).fill('word').join(' ')
            }
        ]
    },
    {
        _type: 'image',
        caption: 'Image caption with five additional words'
    }
];
const realisticResult = calculateReadingTime(realisticContent);
console.log(`   Result: ${realisticResult} minutes`);
console.log(`   Expected: ~1 minute (200+ words)`);
console.log(`   Status: ${realisticResult === 1 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 6: Content with special characters and punctuation
console.log('Test 6: Content with special characters and punctuation');
const specialContent = [
    {
        _type: 'block',
        children: [
            {
                _type: 'span',
                text: 'Content with "quotes", dashes—like this—and various punctuation! Does it count? Yes.'
            }
        ]
    }
];
const specialResult = calculateReadingTime(specialContent);
console.log(`   Result: ${specialResult} minutes`);
console.log(`   Expected: 1 minute (minimum for short text)`);
console.log(`   Status: ${specialResult === 1 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 7: Exact 200 words (should be 1 minute)
console.log('Test 7: Exact 200 words (boundary test)');
const exact200Text = Array(200).fill('word').join(' ');
const exact200Content = [
    {
        _type: 'block',
        children: [
            {
                _type: 'span',
                text: exact200Text
            }
        ]
    }
];
const exact200Result = calculateReadingTime(exact200Content);
console.log(`   Result: ${exact200Result} minutes`);
console.log(`   Expected: 1 minute (200 words / 200 wpm = 1)`);
console.log(`   Status: ${exact200Result === 1 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 8: 1600 words (should be 8 minutes)
console.log('Test 8: Large article (1600 words = 8 minutes)');
const large8MinText = Array(1600).fill('word').join(' ');
const large8MinContent = [
    {
        _type: 'block',
        children: [
            {
                _type: 'span',
                text: large8MinText
            }
        ]
    }
];
const large8MinResult = calculateReadingTime(large8MinContent);
console.log(`   Result: ${large8MinResult} minutes`);
console.log(`   Expected: 8 minutes`);
console.log(`   Status: ${large8MinResult === 8 ? '✅ PASS' : '❌ FAIL'}\n`);

console.log('---\n');
console.log('✅ All tests complete!\n');
