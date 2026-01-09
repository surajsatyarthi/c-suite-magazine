import * as fs from 'fs';
import * as path from 'path';

// EMERGENCY FIX - Create correct order without Rich Stinson
const correctOrder = [
    // Stella at Grid 1
    {
        "image": "https://cdn.sanity.io/images/2f93fcy8/production/3a41211cea808f6de841703b6de6046957c4c34b-800x1200.png",
        "href": "/category/cxo-interview/stella-ambrose-deputy-ceo-sawit-kinabalu",
        "title": "Stella Ambrose: Visionary Trailblazer in Sustainable Palm Oil Leadership"
    },
    // Bill at Grid 2
    {
        "image": "/Featured%20section/Bill Faruki.png",
        "href": "/category/cxo-interview/bill-faruki",
        "title": "C‑Suite Magazine"
    },
    // Rest of grid (positions 3-12)
    {
        "image": "/Featured%20section/stoyana natseva.png",
        "href": "/category/cxo-interview/stoyana-natseva",
        "title": "C‑Suite Magazine"
    },
    {
        "image": "/Featured%20section/Brianne Howey.png",
        "href": "/category/cxo-interview/brianne-howey",
        "title": "C‑Suite Magazine"
    },
    {
        "image": "/Featured%20section/dr. basma ghandourah.png",
        "href": "/category/cxo-interview/dr-basma-ghandourah",
        "title": "C‑Suite Magazine"
    },
    {
        "image": "/Featured%20section/Erin Krueger.png",
        "href": "/category/cxo-interview/erin-krueger",
        "title": "C‑Suite Magazine"
    },
    {
        "image": "/Featured%20section/Pankaj Bansal.png",
        "href": "/category/cxo-interview/pankaj-bansal",
        "title": "C‑Suite Magazine"
    },
    {
        "image": "/Featured%20section/Supreet Nagi.png",
        "href": "/category/cxo-interview/supreet-nagi",
        "title": "C‑Suite Magazine"
    },
    {
        "image": "/Featured%20section/Swami Aniruddha.png",
        "href": "/category/cxo-interview/swami-aniruddha",
        "title": "C‑Suite Magazine"
    },
    {
        "image": "/Featured%20section/bryce tully.png",
        "href": "/category/cxo-interview/bryce-tully",
        "title": "C‑Suite Magazine"
    },
    {
        "image": "/Featured%20section/cal riley.png",
        "href": "/category/cxo-interview/cal-riley",
        "title": "C‑Suite Magazine"
    },
    {
        "image": "/Featured%20section/Dean Fealk.png",
        "href": "/category/cxo-interview/dean-fealk",
        "title": "C‑Suite Magazine"
    }
];

const spotlightPath = path.join(process.cwd(), 'public', 'spotlight.json');

console.log('🚨 EMERGENCY FIX - Correcting Spotlight Order\n');
console.log('Issues being fixed:');
console.log('   1. ❌ Rich Stinson removed from grid (should only be in Executive in Focus)');
console.log('   2. ✅ Stella at Grid Position 1');
console.log('   3. ✅ Bill Faruki at Grid Position 2\n');

console.log('New Grid Order:');
correctOrder.forEach((item, i) => {
    const name = item.href.split('/').pop();
    console.log(`   Grid ${i + 1}. ${name}`);
});

console.log(`\nTotal: ${correctOrder.length} articles (12 grid + 1 Executive in Focus separately)\n`);

fs.writeFileSync(spotlightPath, JSON.stringify(correctOrder, null, 2));

console.log('✅ Fixed public/spotlight.json\n');
console.log('⚠️  NOTE: Rich Stinson will be displayed separately as Executive in Focus by the frontend\n');
