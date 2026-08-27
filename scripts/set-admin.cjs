// Dev helper: grants/revokes the "admin" custom claim used by firestore.rules to allow
// editing fake profile docs. Usage: npm run set-admin -- someone@example.com [--revoke]
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
    const revoke = process.argv.includes('--revoke');
    if (!email) {
        console.error('Usage: npm run set-admin -- <email> [--revoke]');
        process.exit(1);
    }

    const auth = getAuth();
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, revoke ? {} : { admin: true });
    console.log(`✅ ${email} (${user.uid}) admin claim ${revoke ? 'revoked' : 'granted'}.`);
    console.log('   Sign out and back in (or wait for the ID token to refresh) for it to take effect.');
}

main().catch((e) => {
    console.error('❌', e.message);
    process.exit(1);
});
