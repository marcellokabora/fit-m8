// One-time data migration: removes the deleted 'badminton' activity id (no replacement,
// see src/lib/types.ts ACTIVITIES) from every `users` doc's `activities[]` and
// `discoverFilters.activities[]` fields.
// Usage: npm run migrate-remove-badminton           (dry run, no writes)
//        npm run migrate-remove-badminton -- --apply (actually writes the changes)
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
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

const BATCH_LIMIT = 500;

async function main() {
    const apply = process.argv.includes('--apply');
    const db = getFirestore();
    const snap = await db.collection('users').get();

    let batch = db.batch();
    let opsInBatch = 0;
    let changedDocs = 0;

    for (const doc of snap.docs) {
        const data = doc.data();
        const update = {};

        if (Array.isArray(data.activities) && data.activities.some((a) => a?.id === 'badminton')) {
            const activities = data.activities.filter((a) => a?.id !== 'badminton');
            console.log(`  users/${doc.id} activities: removed badminton (${data.activities.length} -> ${activities.length})`);
            update.activities = activities;
        }

        const filterActivities = data.discoverFilters?.activities;
        if (Array.isArray(filterActivities) && filterActivities.includes('badminton')) {
            const remapped = filterActivities.filter((id) => id !== 'badminton');
            console.log(`  users/${doc.id} discoverFilters.activities: removed badminton`);
            update['discoverFilters.activities'] = remapped;
        }

        if (Object.keys(update).length === 0) continue;

        changedDocs++;
        if (apply) {
            batch.update(doc.ref, update);
            opsInBatch++;
            if (opsInBatch === BATCH_LIMIT) {
                await batch.commit();
                batch = db.batch();
                opsInBatch = 0;
            }
        }
    }

    if (apply && opsInBatch > 0) {
        await batch.commit();
    }

    console.log(apply
        ? `✅ Updated ${changedDocs} of ${snap.size} user doc(s).`
        : `ℹ️  Dry run: ${changedDocs} of ${snap.size} user doc(s) would be updated. Re-run with --apply to write.`);
}

main().catch((e) => {
    console.error('❌', e.message);
    process.exit(1);
});
