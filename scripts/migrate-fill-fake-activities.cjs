// Ensures every fake user has at least 10 unique, gender-appropriate activities.
// Usage: npm run migrate-fill-fake-activities             (dry run)
//        npm run migrate-fill-fake-activities -- --execute (apply changes)
const admin = require('firebase-admin');
const { FieldPath, FieldValue, getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');
const { fillActivities } = require('./fake-profile-activities.cjs');

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

async function main() {
    const snapshot = await db.collection('users')
        .where(FieldPath.documentId(), '>=', 'fake_')
        .where(FieldPath.documentId(), '<', 'fake_\uf8ff')
        .get();
    const migrations = [];
    let belowTen = 0;
    let cleaned = 0;

    for (const document of snapshot.docs) {
        const data = document.data();
        const original = Array.isArray(data.activities) ? data.activities : [];
        const activities = fillActivities(original, data.gender);
        if (original.length < 10) belowTen++;
        if (JSON.stringify(activities) === JSON.stringify(original)) continue;
        if (original.length >= 10) cleaned++;
        migrations.push({ ref: document.ref, activities });
    }

    console.log(`${execute ? 'Executing' : 'Dry run for'} project ${env.PUBLIC_FIREBASE_PROJECT_ID}`);
    console.log(`Fake users: scanned ${snapshot.size}, below 10 ${belowTen}, cleanups ${cleaned}, update ${migrations.length}`);

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

    console.log(`Updated ${migrations.length} fake users.`);
}

main().catch(error => {
    console.error('Migration failed:', error.message);
    process.exit(1);
});