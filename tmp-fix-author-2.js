const fs=require('fs');
const p='/Users/surajsatyarthi/Desktop/Magazine/ceo-magazine/app/writer/[slug]/page.tsx';
let s=fs.readFileSync(p,'utf8');
const newQuery = `const query = \`*[_type == \"writer\" && slug.current == $slug][0] {\n  _id,\n  name,\n  slug,\n  position,\n  bio,\n  image,\n  \"imageUrl\": image.asset->url,\n  social,\n  \"articles\": *[_type == \"post\" && writer->slug.current == $slug] | order(publishedAt desc) {\n    _id,\n    title,\n    slug,\n    excerpt,\n    \"excerptText\": coalesce(pt::text(excerpt), pt::text(body)),\n    mainImage,\n    \"mainImageUrl\": mainImage.asset->url,\n    \"categories\": categories[]->{title, slug, color},\n    publishedAt,\n    views\n  }\n}\``;
// Primary replacement: replace the const query block
s = s.replace(/const query = \`[\s\S]*?\`/m, newQuery);
// Fallback: if no query found, insert into getWriter function
if(!s.includes('const query =')){
  s = s.replace(/async function getWriter\(slug: string\) \{[\s\S]*?return client\.fetch\(query, \{ slug \ }\)/m, (m)=>{
    return `async function getWriter(slug: string) {\n  ${newQuery}\n  return client.fetch(query, { slug })`;
  });
}
fs.writeFileSync(p, s);
console.log('fixed writer query via fallback if needed');
