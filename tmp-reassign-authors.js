const { createClient } = require('@sanity/client');
require('dotenv').config({ path: './.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const reassignments = [
  { postId: '6FGiNia5tWM9A0y146SyqV', newAuthorId: 'author-priya-raman' }, // Dr. Basma Ghandourah to Priya Raman
  { postId: '6FGiNia5tWM9A0y146T0bN', newAuthorId: 'author-priya-raman' }, // John Zangardi to Priya Raman
  { postId: 'KGEAgIEt6gkQLdV5lSZFvP', newAuthorId: 'author-sarah-johnson' }, // Pankaj Bansal to Sarah Johnson
  { postId: 'KGEAgIEt6gkQLdV5lSZJMo', newAuthorId: 'author-sarah-johnson' }, // Swami Aniruddha to Sarah Johnson
  { postId: 'KGEAgIEt6gkQLdV5lSZKOC', newAuthorId: 'author-raj-patel' }, // Supreet Nagi to Raj Patel
  { postId: 'iVn352lnQzrBdeP67CLroJ', newAuthorId: 'author-raj-patel' } // Stoyana Natseva to Raj Patel
];

(async () => {
  try {
    for (const { postId, newAuthorId } of reassignments) {
      await client.patch(postId).set({ author: { _type: 'reference', _ref: newAuthorId } }).commit();
      console.log(`Reassigned post ${postId} to author ${newAuthorId}`);
    }
    console.log('All reassignments completed.');
  } catch (e) {
    console.error('Failed to reassign authors:', e);
    process.exit(1);
  }
})();