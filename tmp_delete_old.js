const { execSync } = require('child_process');

const s = `
https://ceo-magazine-iy390jxq4-suraj-satyarthis-projects.vercel.app,
https://ceo-magazine-fsrpijxxx-suraj-satyarthis-projects.vercel.app,
https://ceo-magazine-fz8bspi6x-suraj-satyarthis-projects.vercel.app,
https://ceo-magazine-cav5q3q5f-suraj-satyarthis-projects.vercel.app,
https://ceo-magazine-bv5cczn7q-suraj-satyarthis-projects.vercel.app,
https://ceo-magazine-oz35cupep-suraj-satyarthis-projects.vercel.app,
https://ceo-magazine-1k70bvv8v-suraj-satyarthis-projects.vercel.app,
https://ceo-magazine-agly844f2-suraj-satyarthis-projects.vercel.app,
https://ceo-magazine-45t3lgn1v-suraj-satyarthis-projects.vercel.app,
https://ceo-magazine-6cyh0ybzc-suraj-satyarthis-projects.vercel.app,
https://ceo-magazine-of0u2qdi4-suraj-satyarthis-projects.vercel.app,
https://ceo-magazine-nrrv8y89l-suraj-satyarthis-projects.vercel.app,
https://ceo-magazine-r7ur11rzs-suraj-satyarthis-projects.vercel.app,
https://ceo-magazine-d0j6z22eo-suraj-satyarthis-projects.vercel.app,
https://ceo-magazine-7uatttcuh-suraj-satyarthis-projects.vercel.app,
https://ceo-magazine-qnv2y5vdt-suraj-satyarthis-projects.vercel.app,
https://ceo-magazine-hwv3tom1x-suraj-satyarthis-projects.vercel.app,
https://ceo-magazine-e1ki2y4xt-suraj-satyarthis-projects.vercel.app,
https://ceo-magazine-5arts99b8-suraj-satyarthis-projects.vercel.app,
https://ceo-magazine-bdj6gmicy-suraj-satyarthis-projects.vercel.app,
https://ceo-magazine-4eqnrat2w-suraj-satyarthis-projects.vercel.app
`;

function removeDeployments() {
  const dps = s.split(',').map(v => v.trim()).filter(v => v !== '');
  for (const i of dps) {
    try {
      execSync(`npx vercel rm ${i} --scope suraj-satyarthis-projects --token vxirYcARuHo4Iv8SRpAeBl6A --yes`, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Failed to delete ${i}: ${error.message}`);
    }
  }
}

removeDeployments();
