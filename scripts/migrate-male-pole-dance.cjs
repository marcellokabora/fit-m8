// One-time data migration for male profiles that contain Pole Dance.
// Replaces Pole Dance with Beach Tennis and fills affected profiles to 10 unique sports.
// Usage: npm run migrate-male-pole-dance           (dry run, no writes)
//        npm run migrate-male-pole-dance -- --apply (actually writes the changes)
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
} catch (error) {
    console.error('Error: firebase-key.json not found or invalid.');
    process.exit(1);
}

admin.initializeApp({
    credential: admin.cert(serviceAccount),
    projectId: env.PUBLIC_FIREBASE_PROJECT_ID
});

const SPORT_POOL = [
    'beachTennis',
    'bmx',
    'scooter',
    'electricScooter',
    'surfskate',
    'skateboard',
    'windsurf',
    'kitesurf',
    'wingFoil',
    'paraWing',
    'kayak'
];
const REPAIR_USER_ID = '6oCVNjmPoAfnGDYWK9ormsIuuJz2';
const REPAIR_PRESERVED_ACTIVITY_IDS = new Set([
    'beachVolley',
    'crossTraining',
    'gym',
    'yoga',
    'beachTennis'
]);
const FORMATS = ['all', '1v1', '2v2', 'group'];
const LEVELS = ['basic', 'medium', 'expert'];
const BATCH_LIMIT = 500;

function shuffled(values) {
    const result = [...values];
    for (let index = result.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
}

function migrateActivities(sourceActivities) {
    const hadBeachTennis = sourceActivities.some(activity => activity?.id === 'beachTennis');
    let addedBeachTennis = hadBeachTennis;
    const activities = [];

    for (const activity of sourceActivities) {
        if (activity?.id !== 'poleDance') {
            activities.push(activity);
            continue;
        }

        if (!addedBeachTennis) {
            activities.push({ ...activity, id: 'beachTennis' });
            addedBeachTennis = true;
        }
    }

    const existingIds = new Set(activities.map(activity => activity?.id).filter(Boolean));
    const candidates = shuffled(SPORT_POOL.filter(id => !existingIds.has(id)));

    while (activities.length < 10 && candidates.length > 0) {
        const id = candidates.pop();
        activities.push({
            id,
            format: FORMATS[Math.floor(Math.random() * FORMATS.length)],
            level: LEVELS[Math.floor(Math.random() * LEVELS.length)]
        });
    }

    return activities;
}

async function main() {
    const apply = process.argv.includes('--apply');
    const db = getFirestore();
    if (process.argv.includes('--repair-fillers')) {
        const doc = await db.collection('users').doc(REPAIR_USER_ID).get();
        if (!doc.exists) throw new Error(`users/${REPAIR_USER_ID} was not found`);
        const preserved = (doc.data().activities ?? []).filter(activity =>
            REPAIR_PRESERVED_ACTIVITY_IDS.has(activity?.id)
        );
        const activities = migrateActivities(preserved);
        console.log(`users/${doc.id}: ${activities.map(activity => activity.id).join(', ')}`);
        if (apply) await doc.ref.update({ activities });
        console.log(apply ? 'Updated 1 profile.' : 'Dry run: 1 profile would be updated.');
        return;
    }
    const snapshot = await db.collection('users').where('gender', '==', 'male').get();
    let batch = db.batch();
    let operationsInBatch = 0;
    let changedDocs = 0;

    for (const doc of snapshot.docs) {
        const data = doc.data();
        if (!Array.isArray(data.activities) || !data.activities.some(activity => activity?.id === 'poleDance')) {
            continue;
        }

        const activities = migrateActivities(data.activities);
        console.log(`users/${doc.id}: ${data.activities.length} -> ${activities.length} sports`);
        console.log(`  ${activities.map(activity => activity?.id).filter(Boolean).join(', ')}`);
        changedDocs++;

        if (apply) {
            batch.update(doc.ref, { activities });
            operationsInBatch++;
            if (operationsInBatch === BATCH_LIMIT) {
                await batch.commit();
                batch = db.batch();
                operationsInBatch = 0;
            }
        }
    }

    if (apply && operationsInBatch > 0) {
        await batch.commit();
    }

    console.log(apply
        ? `Updated ${changedDocs} male profile(s).`
        : `Dry run: ${changedDocs} male profile(s) would be updated. Re-run with --apply to write.`);
}

main().catch(error => {
    console.error('Migration failed:', error.message);
    process.exit(1);
});