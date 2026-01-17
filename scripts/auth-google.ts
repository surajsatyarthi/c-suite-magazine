/**
 * Interactive Google Drive Auth Helper
 * 
 * Usage: npx tsx scripts/auth-google.ts
 * 
 * This script starts a local server, opens your browser to Google OAuth,
 * limits the scope strictly to Drive File access, and prints the 
 * EXACT secrets you need to copy-paste into GitHub.
 */

import { google } from 'googleapis';
import http from 'http';
import url from 'url';
import { spawn } from 'child_process';

// These are public for the "Installed App" flow, but ideally passed as env vars.
// If you don't have these, you must create a Project in Google Cloud Console.
// We will prompt for them if missing.
const LOCAL_CLIENT_ID = process.env.GDRIVE_CLIENT_ID;
const LOCAL_CLIENT_SECRET = process.env.GDRIVE_CLIENT_SECRET;

async function main() {
  console.log('\n🔐 Antigravity Google Auth Helper\n');

  let clientId = LOCAL_CLIENT_ID;
  let clientSecret = LOCAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.log('⚠️  No Credentials found in env.');
    console.log('   Please go to: https://console.cloud.google.com/apis/credentials');
    console.log('   Create "OAuth Client ID" -> "Desktop App"');
    console.log('   (Or paste existing ones below)\n');
    
    // We can't interactively prompt in this environment easily without readline complexity,
    // so we will fail gracefully and ask user to set vars.
    console.error('❌ Please run this command again with your Client ID/Secret set:');
    console.error('   GDRIVE_CLIENT_ID=... GDRIVE_CLIENT_SECRET=... npx tsx scripts/auth-google.ts');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'http://localhost:3000/api/auth/callback/google'
  );

  // Generate auth URL
  const scopes = ['https://www.googleapis.com/auth/drive.file'];
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // CRITICAL: Gives us the Refresh Token
    scope: scopes,
    prompt: 'consent' // CRITICAL: Forces a new Refresh Token to be issued
  });

  // Start local server to catch callback
  const server = http.createServer(async (req, res) => {
    if (req.url!.startsWith('/api/auth/callback/google')) {
      const qs = new url.URL(req.url!, 'http://localhost:3000').searchParams;
      const code = qs.get('code');

      res.end('Authentication successful! You can close this window and check your terminal.');
      server.close();

      if (code) {
        const { tokens } = await oauth2Client.getToken(code);
        
        console.log('\n✅ AUTHENTICATION SUCCESSFUL!\n');
        console.log('👇 COPY THESE VALUES TO GITHUB SECRETS 👇');
        console.log('-----------------------------------------');
        console.log(`GDRIVE_CLIENT_ID=${clientId}`);
        console.log(`GDRIVE_CLIENT_SECRET=${clientSecret}`);
        console.log(`GDRIVE_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log('-----------------------------------------\n');
        
        if (!tokens.refresh_token) {
          console.warn('⚠️  No Refresh Token received. Did you authorize the app before? Go to https://myaccount.google.com/permissions and revoke access, then try again.');
        }
      }
    }
  });

  server.listen(3000, () => {
    console.log(`\n👉 Opening Browser for Auth: ${authUrl}`);
    spawn('open', [authUrl]); // Mac specific
  });
}

main();
