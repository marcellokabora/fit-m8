// Replaces the removed unicycle activity with rollerblading on user profiles.
// Usage: npm run migrate-remove-unicycle             (dry run)
//        npm run migrate-remove-unicycle -- --execute (apply changes)
const admin = require('firebase-admin');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

const env = {};
fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#') && line.includes('='))
    .forEach(line => {
        const [key, ...rest] = line.split('=');
        env[key.trim()] = rest.join('=').trim();
    });

const serviceAccount = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'firebase-key.json'), 'utf-8')
);

admin.initializeApp({
    credential: admin.cert(serviceAccount),
    projectId: env.PUBLIC_FIREBASE_PROJECT_ID
});

const db = getFirestore();
const execute = process.argv.includes('--execute');

function migratedActivities(activities) {
    if (!Array.isArray(activities) || !activities.some(activity => activity?.id === 'unicycle')) {
        return null;
    }

    const alreadyHasRollerblade = activities.some(activity => activity?.id === 'rollerblade');
    let replaced = false;
    return activities.flatMap(activity => {
        if (activity?.id !== 'unicycle') return [activity];
        if (alreadyHasRollerblade || replaced) return [];
        replaced = true;
        return [{ ...activity, id: 'rollerblade' }];
    });
}

async function main() {
    const snapshot = await db.collection('users').get();
    const migrations = [];

    for (const document of snapshot.docs) {
        const activities = migratedActivities(document.data().activities);
        if (!activities) continue;
        migrations.push({ ref: document.ref, activities });
    }

    console.log(`${execute ? 'Executing' : 'Dry run for'} project ${env.PUBLIC_FIREBASE_PROJECT_ID}`);
    console.log(`Users: scanned ${snapshot.size}, replace unicycle for ${migrations.length}`);

    if (!execute) {
        console.log('No documents changed. Re-run with --execute to apply the migration.');
        return;
    }

    for (let offset = 0; offset < migrations.length; offset += 450) {
        const batch = db.batch();
        for (const migration of migrations.slice(offset, offset + 450)) {
            batch.update(migration.ref, {
                activities: migration.activities,
                updatedAt: FieldValue.serverTimestamp()
            });
        }
        await batch.commit();
    }

    console.log(`Updated ${migrations.length} users.`);
}

main().catch(error => {
    console.error('Migration failed:', error.message);
    process.exit(1);
});