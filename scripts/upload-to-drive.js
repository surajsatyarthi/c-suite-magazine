```javascript
const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');

// OAuth Credentials
const CLIENT_ID = process.env.GDRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GDRIVE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GDRIVE_REFRESH_TOKEN;

async function uploadFile() {
    try {
        if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
            throw new Error('Missing OAuth credentials. Please set GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET, and GDRIVE_REFRESH_TOKEN.');
        }

        // 1. Configure OAuth2 Client
        const oauth2Client = new google.auth.OAuth2(
            CLIENT_ID,
            CLIENT_SECRET,
            'https://developers.google.com/oauthplayground' // Redirect URI
        );

        oauth2Client.setCredentials({
            refresh_token: REFRESH_TOKEN
        });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // 2. Get configuration from environment variables
        const FOLDER_ID = process.env.GDRIVE_FOLDER_ID;
        const FILE_PATH = process.env.BACKUP_PATH;
        const FILE_NAME = process.env.BACKUP_FILENAME;

        if (!FOLDER_ID || !FILE_PATH || !FILE_NAME) {
            throw new Error('Missing required environment variables: GDRIVE_FOLDER_ID, BACKUP_PATH, or BACKUP_FILENAME');
        }

        console.log(`Starting upload...`);
        console.log(`File: ${ FILE_PATH } `);
        console.log(`Target Folder ID: ${ FOLDER_ID } `);

        // 3. Upload the file
        const fileMetadata = {
            name: FILE_NAME,
            parents: [FOLDER_ID],
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
        console.log(`File ID: ${ response.data.id } `);
        console.log(`View Link: ${ response.data.webViewLink } `);

    } catch (error) {
        console.error('Upload failed:', error);
        process.exit(1);
    }
}

uploadFile();
