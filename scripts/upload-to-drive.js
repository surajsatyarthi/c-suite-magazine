const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');

async function uploadFile() {
    try {
        // 1. Load credentials
        // The workflow will decode the Base64 secret to a file named 'service-account.json'
        const KEY_FILE_PATH = path.join(process.cwd(), 'service-account.json');

        if (!fs.existsSync(KEY_FILE_PATH)) {
            throw new Error(`Service account key file not found at: ${KEY_FILE_PATH}`);
        }

        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE_PATH,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });

        const drive = google.drive({ version: 'v3', auth });

        // 2. Get configuration from environment variables
        const FOLDER_ID = process.env.GDRIVE_FOLDER_ID;
        const FILE_PATH = process.env.BACKUP_PATH; // e.g., 'backups/sanity-backup-2023-11-30.tar.gz'
        const FILE_NAME = process.env.BACKUP_FILENAME; // e.g., 'sanity-backup-2023-11-30.tar.gz'

        if (!FOLDER_ID || !FILE_PATH || !FILE_NAME) {
            throw new Error('Missing required environment variables: GDRIVE_FOLDER_ID, BACKUP_PATH, or BACKUP_FILENAME');
        }

        console.log(`Starting upload...`);
        console.log(`File: ${FILE_PATH}`);
        console.log(`Target Folder ID: ${FOLDER_ID}`);

        // 3. Upload the file
        const fileMetadata = {
            name: FILE_NAME,
            parents: [FOLDER_ID], // Explicitly put it in the shared folder
        };

        const media = {
            mimeType: 'application/gzip',
            body: fs.createReadStream(FILE_PATH),
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink',
        });

        console.log('Upload successful!');
        console.log(`File ID: ${response.data.id}`);
        console.log(`View Link: ${response.data.webViewLink}`);

    } catch (error) {
        console.error('Upload failed:', error);
        process.exit(1);
    }
}

uploadFile();
