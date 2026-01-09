import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createClient } from '@sanity/client';
import { config } from '../sanity/config';

const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

const excerpts = [
    {
        _id: 'R4nh1tgtHdOlPpvIYzWE0k',
        title: 'Ratan Tata',
        excerpt: 'Ratan Tata\'s visionary leadership transformed Tata Group into a global powerhouse while maintaining unwavering commitment to ethics, social responsibility, and nation-building.'
    },
    {
        _id: 'c7UYOegSzEupZNl9sN7KPs',
        title: 'Bhavesh Aggarwal',
        excerpt: 'Bhavesh Aggarwal is revolutionizing India\'s mobility landscape, combining electric vehicles with cutting-edge AI to create a sustainable transportation future.'
    },
    {
        _id: 'R4nh1tgtHdOlPpvIZ09PGm',
        title: 'Ritesh Agarwal',
        excerpt: 'From a teenage entrepreneur to building OYO into a global hospitality empire, Ritesh Agarwal\'s journey redefines how young innovators can disrupt traditional industries.'
    },
    {
        _id: '6LHIUa7X7StJKVVM1bKFxX',
        title: 'Amin H. Nasser',
        excerpt: 'As Aramco\'s CEO, Amin H. Nasser navigates the energy transition with pragmatic leadership, balancing traditional oil operations with bold investments in sustainable energy.'
    },
    {
        _id: 'R4nh1tgtHdOlPpvIZ09N0a',
        title: 'Chamath Palihapitiya',
        excerpt: 'Once the SPAC king of Wall Street, Chamath Palihapitiya now channels his influence into climate technology, funding the innovations that could save our planet.'
    },
    {
        _id: '6LHIUa7X7StJKVVM1biINI',
        title: 'Yi He',
        excerpt: 'Yi He\'s remarkable ascent from rural China to co-CEO of Binance represents one of crypto\'s most compelling leadership stories, bridging traditional finance with digital innovation.'
    },
    {
        _id: 'R4nh1tgtHdOlPpvIZ0FI0g',
        title: 'Mohamed Alabbar',
        excerpt: 'Mohamed Alabbar, the visionary behind Dubai Mall and Emaar Properties, continues to shape urban development across the Middle East, transforming cities into next-generation destinations.'
    },
    {
        _id: 'c7UYOegSzEupZNl9sNKPNI',
        title: 'Murray Auchincloss',
        excerpt: 'Murray Auchincloss brings a pragmatic reset to BP, steering the energy giant back to profitability while navigating the complex transition toward cleaner energy sources.'
    }
];

async function addJuggernautExcerpts() {
    console.log('📝 Adding Excerpts to Industry Juggernaut Articles\n');
    console.log('='.repeat(80));

    for (const article of excerpts) {
        console.log(`\nUpdating: ${article.title}`);
        console.log(`Excerpt: ${article.excerpt}`);

        try {
            await client
                .patch(article._id)
                .set({ excerpt: article.excerpt })
                .commit();

            console.log('✅ Updated successfully');
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Added excerpts to ${excerpts.length} articles\n`);
}

addJuggernautExcerpts();
