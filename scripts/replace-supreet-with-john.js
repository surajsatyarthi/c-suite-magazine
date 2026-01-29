import * as fs from 'fs';
import * as path from 'path';

const spotlightPath = path.join(process.cwd(), 'public', 'spotlight.json');
const spotlight = JSON.parse(fs.readFileSync(spotlightPath, 'utf-8'));

console.log('🔄 Replacing Supreet Nagi with John Zangardi\n');

// Find and replace Supreet with John Zangardi
const supreetIndex = spotlight.findIndex((item: any) =>
    item.href?.includes('supreet-nagi')
);

if (supreetIndex !== -1) {
    console.log(`Found Supreet Nagi at position ${supreetIndex + 1}`);

    // Replace with John Zangardi
    spotlight[supreetIndex] = {
        "image": "/Featured%20section/John Zangardi.png",
        "href": "/category/cxo-interview/john-zangardi",
        "title": "C‑Suite Magazine"
    };

    console.log(`Replaced with John Zangardi\n`);
} else {
    console.log('⚠️  Supreet Nagi not found in grid\n');
}

// Save
fs.writeFileSync(spotlightPath, JSON.stringify(spotlight, null, 2));

console.log('✅ Updated spotlight.json\n');
console.log('New Grid Order:');
spotlight.forEach((item: any, i: number) => {
    const name = item.href.split('/').pop();
    console.log(`   ${i + 1}. ${name}`);
});

console.log('\n📝 Run ./scripts/test-spotlight-before-deploy.sh to verify\n');
