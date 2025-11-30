const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');

// OAuth Credentials (Hardcoded for verification, should be moved to secrets later)
const CLIENT_ID = '1061868890550-u3oqjsmpfrf6ks5kmbsqpv9urc5s092l.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REFRESH_TOKEN = '1//0gyxIbfG0Q4qeCgYIARAAGBASNwF-L9IrvzOKBBjGQIAa1L_8k02iB7DVuFtCEe2d_gNNkzabIK6KGQcMRkuv-JqQJHyzjWXh18w';

async function uploadFile() {
    try {
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
        console.log(`File: ${FILE_PATH}`);
        console.log(`Target Folder ID: ${FOLDER_ID}`);

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
        console.log(`File ID: ${response.data.id}`);
        console.log(`View Link: ${response.data.webViewLink}`);

    } catch (error) {
        console.error('Upload failed:', error);
        process.exit(1);
    }
}

uploadFile();
