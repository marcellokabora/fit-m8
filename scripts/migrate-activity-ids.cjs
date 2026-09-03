// One-time data migration: renames the 'footvolley' activity id to camelCase 'footVolley'
// (mirrors the id rename in src/lib/types.ts ACTIVITIES) across every `users` doc's
// `activities[].id` and `discoverFilters.activities[]` fields.
// Usage: npm run migrate-activity-ids           (dry run, no writes)
//        npm run migrate-activity-ids -- --apply (actually writes the changes)
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

const ID_MAP = {
    'footvolley': 'footVolley'
};

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

        if (Array.isArray(data.activities)) {
            const activities = data.activities.map((a) => {
                if (a && typeof a.id === 'string' && ID_MAP[a.id]) {
                    console.log(`  users/${doc.id} activities: ${a.id} -> ${ID_MAP[a.id]}`);
                    return { ...a, id: ID_MAP[a.id] };
                }
                return a;
            });
            if (JSON.stringify(activities) !== JSON.stringify(data.activities)) {
                update.activities = activities;
            }
        }

        const filterActivities = data.discoverFilters?.activities;
        if (Array.isArray(filterActivities)) {
            const remapped = filterActivities.map((id) => {
                if (typeof id === 'string' && ID_MAP[id]) {
                    console.log(`  users/${doc.id} discoverFilters.activities: ${id} -> ${ID_MAP[id]}`);
                    return ID_MAP[id];
                }
                return id;
            });
            if (JSON.stringify(remapped) !== JSON.stringify(filterActivities)) {
                update['discoverFilters.activities'] = remapped;
            }
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
