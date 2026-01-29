import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { google } from 'googleapis';

// --- Configuration ---
const CONFIG = {
  sanity: {
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || 'production',
    authToken: process.env.SANITY_AUTH_TOKEN,
  },
  gdrive: {
    clientId: process.env.GDRIVE_CLIENT_ID,
    clientSecret: process.env.GDRIVE_CLIENT_SECRET,
    refreshToken: process.env.GDRIVE_REFRESH_TOKEN,
    folderId: process.env.GDRIVE_FOLDER_ID,
  },
  retention: {
    maxFiles: 30, // Keep last 30 backups
  },
  backupDir: path.join(process.cwd(), 'backups'),
};

// --- Helpers ---

/**
 * Validates required environment variables.
 */
function validateEnv() {
  const missing: string[] = [];
  if (!CONFIG.sanity.projectId) missing.push('SANITY_PROJECT_ID');
  if (!CONFIG.sanity.authToken) missing.push('SANITY_AUTH_TOKEN');
  if (!CONFIG.gdrive.clientId) missing.push('GDRIVE_CLIENT_ID');
  if (!CONFIG.gdrive.clientSecret) missing.push('GDRIVE_CLIENT_SECRET');
  if (!CONFIG.gdrive.refreshToken) missing.push('GDRIVE_REFRESH_TOKEN');
  if (!CONFIG.gdrive.folderId) missing.push('GDRIVE_FOLDER_ID');

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log('✅ Environment variables validated.');
}

/**
 * Spawns a child process securely.
 */
function spawnSafe(command: string, args: string[], cwd: string = process.cwd()): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`> Spawning: ${command} ${args.join(' ')}`);
    const child = spawn(command, args, {
      stdio: 'inherit',
      cwd,
      env: { ...process.env }, // Pass through env vars including PATH
      shell: false, // Security: disable shell to prevent injection
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

// --- Core Logic ---

async function exportDataset(): Promise<string> {
  // Ensure backup directory exists
  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `sanity-backup-${CONFIG.sanity.dataset}-${timestamp}.tar.gz`;
  const filePath = path.join(CONFIG.backupDir, filename);

  console.log(`\n📦 Starting Sanity Export to: ${filePath}`);

  // Construct args for: sanity dataset export [dataset] [file] --overwrite
  const args = [
    'dataset',
    'export',
    CONFIG.sanity.dataset,
    filePath,
    '--overwrite',
  ];

  try {
    // Use local 'sanity' binary provided by project dependencies via pnpm exec
    // This avoids downloading the CLI on every run and ensures version consistency.
    await spawnSafe('pnpm', ['exec', 'sanity', ...args]);
    
    // Check if file was actually created
    if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
       throw new Error('Backup file created but is empty or missing.');
    }

    console.log('✅ Export successful.');
    return filePath;
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  }
}

async function uploadToDrive(filePath: string): Promise<void> {
  console.log(`\n☁️ Uploading to Google Drive...`);
  
  const oauth2Client = new google.auth.OAuth2(
    CONFIG.gdrive.clientId,
    CONFIG.gdrive.clientSecret,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({ refresh_token: CONFIG.gdrive.refreshToken });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  const fileName = path.basename(filePath);

  const fileMetadata = {
    name: fileName,
    parents: [CONFIG.gdrive.folderId!],
  };

  const media = {
    mimeType: 'application/gzip',
    body: fs.createReadStream(filePath),
  };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, name, webViewLink',
  });

  console.log(`✅ Upload successful! File ID: ${file.data.id}`);
}

async function rotateRemoteBackups(): Promise<void> {
  console.log(`\n🔄 Rotating backups (Limit: ${CONFIG.retention.maxFiles})...`);
    
  const oauth2Client = new google.auth.OAuth2(
    CONFIG.gdrive.clientId,
    CONFIG.gdrive.clientSecret
  );
  oauth2Client.setCredentials({ refresh_token: CONFIG.gdrive.refreshToken });
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  // List files in the folder, ordered by createdTime (oldest first)
  const res = await drive.files.list({
    q: `'${CONFIG.gdrive.folderId}' in parents and trashed = false and name contains 'sanity-backup-'`,
    fields: 'files(id, name, createdTime)',
    orderBy: 'createdTime desc', // Newest first
    pageSize: 100,
  });

  const files = res.data.files || [];
  console.log(`Found ${files.length} backups.`);

  if (files.length > CONFIG.retention.maxFiles) {
    const toDelete = files.slice(CONFIG.retention.maxFiles);
    console.log(`Deleting ${toDelete.length} old backups...`);

    for (const file of toDelete) {
      if (file.id) {
        console.log(`Deleting: ${file.name} (${file.id})`);
        await drive.files.delete({ fileId: file.id });
      }
    }
    console.log('✅ Rotation complete.');
  } else {
    console.log('✅ No rotation needed.');
  }
}

// --- Main Execution ---

async function main() {
  console.log('🚀 Starting Sanity Backup Pipeline...');
  
  try {
    validateEnv();
    
    // 1. Export
    const filePath = await exportDataset();
    
    // 2. Upload
    await uploadToDrive(filePath);
    
    // 3. Rotate
    await rotateRemoteBackups();
    
    console.log('\n✨ Backup pipeline completed successfully.');

    // 4. Log Success
    try {
        const { createClient } = require('next-sanity');
        const client = createClient({
            projectId: CONFIG.sanity.projectId,
            dataset: CONFIG.sanity.dataset,
            apiVersion: '2024-10-01',
            useCdn: false,
            token: CONFIG.sanity.authToken
        });
        
        await client.create({
            _type: 'systemLog',
            system: 'backup-sanity',
            status: 'SUCCESS',
            message: 'Daily backup completed successfully.',
            timestamp: new Date().toISOString(),
            metadata: JSON.stringify({ file: path.basename(filePath) })
        });
        console.log('✅ Logged success to Sanity.');
    } catch (logError) {
        console.error('⚠️ Failed to log success:', logError);
    }
    
    // Cleanup local file after successful upload (optional, but good for CI limits)
    // In local dev we might want to keep it, but CI is ephemeral.
    // For now we assume CI environment cleans up or we leave it for debugging.
    
  } catch (error) {
    console.error('\n💥 Pipeline failed:', error);

    // Log Failure
    try {
        const { createClient } = require('next-sanity');
        const client = createClient({
            projectId: CONFIG.sanity.projectId,
            dataset: CONFIG.sanity.dataset,
            apiVersion: '2024-10-01',
            useCdn: false,
            token: CONFIG.sanity.authToken
        });
        
        await client.create({
            _type: 'systemLog',
            system: 'backup-sanity',
            status: 'FAILURE',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
        console.log('✅ Logged failure to Sanity.');
    } catch (logError) {
        console.error('⚠️ Failed to log failure:', logError);
    }

    process.exit(1);
  }
}

main();
