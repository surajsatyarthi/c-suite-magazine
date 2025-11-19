const fs=require('fs');
const p='/Users/surajsatyarthi/Desktop/Magazine/ceo-magazine/app/article/[slug]/page.tsx';
let s=fs.readFileSync(p,'utf8');
// Update getPost author projection
s = s.replace(/"author": author->\{name, slug, position, image, bio\}/, '"author": author->{name, slug, position, image, "imageUrl": image.asset->url, bio}');
// Replace any usage of post.author.image.url with imageUrl fallback
s = s.replace(/post\.author\.image\.url \|\| urlFor\(post\.author\.image\)[^\)]*\)/g, 'post.author.imageUrl || urlFor(post.author.image).width(256).height(256).url()');
fs.writeFileSync(p,s);
console.log('patched article page author image handling');
