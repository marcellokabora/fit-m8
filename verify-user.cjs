// Dev helper: marks a test user's email as verified in Firebase Auth, bypassing the real inbox link.
// Usage: node verify-user.cjs someone@example.com
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
const env = {};
fs.readFileSync(envPath, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#') && line.includes('='))
    .forEach(line => {
        const [key, ...rest] = line.split('=');
        env[key.trim()] = rest.join('=').trim();
    });

const serviceAccountPath = path.resolve(process.cwd(), 'firebase-key.json');
let serviceAccount;

try {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
} catch (e) {
    console.error('❌ Error: firebase-key.json not found!');
    process.exit(1);
}

admin.initializeApp({
    credential: admin.cert(serviceAccount),
    projectId: env.PUBLIC_FIREBASE_PROJECT_ID
});

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error('Usage: node verify-user.cjs <email>');
        process.exit(1);
    }

    const auth = getAuth();
    const user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { emailVerified: true });
    console.log(`✅ ${email} (${user.uid}) is now marked as email-verified in Firebase Auth.`);
    console.log('   Reopen /discover in the app (or click "I\'ve verified my email") to sync it.');
}

main().catch((e) => {
    console.error('❌', e.message);
    process.exit(1);
});
