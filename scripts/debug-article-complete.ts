import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '2f93fcy8',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-10-01'
});

async function debugArticleComplete() {
  const query = `*[_type == "csa" && slug.current == "sukhinder-singh-cassidy-rewiring-global-economy"][0] {
    _id,
    title,
    articleVariant,
    interviewMode,
    isCompanySponsored,
    "writer": writer->{name}
  }`;

  try {
    const results = await client.fetch(query);
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

debugArticleComplete();
