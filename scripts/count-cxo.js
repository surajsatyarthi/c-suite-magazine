const { createClient } = require('@sanity/client');

// Initialize client
const client = createClient({
  projectId: '2f93fcy8',
  dataset: 'production',
  apiVersion: '2023-01-01',
  useCdn: false
});

async function countCXO() {
  const query = `*[_type == "post" && "CXO Interview" in categories[]->title] { title, "slug": slug.current }`;
  try {
    const posts = await client.fetch(query);
    console.log(`\n\n🎯 Total CXO Interview Articles: ${posts.length}\n`);
    posts.forEach((p, i) => console.log(`${i+1}. ${p.title} (${p.slug})`));
    console.log('\n');
  } catch (err) {
    console.error(err);
  }
}

countCXO();
