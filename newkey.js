import fs from 'fs';

const key = JSON.parse(fs.readFileSync('./firebase-key.json', 'utf8'));
const escapedPrivateKey = key.private_key.replace(/\n/g, '\\\\n'); // 👈 double escape here

console.log(`
FIREBASE_PROJECT_ID=${key.project_id}
FIREBASE_CLIENT_EMAIL=${key.client_email}
FIREBASE_PRIVATE_KEY="${escapedPrivateKey}"
`);