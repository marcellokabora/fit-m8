// Removes the legacy photoURL field after preserving its value in photos[0] when needed.
// Usage: npm run migrate-remove-photo-url             (dry run)
//        npm run migrate-remove-photo-url -- --execute (apply changes)
const admin = require('firebase-admin');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

const env = {};
fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .forEach((line) => {
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

function usablePhoto(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function migrationFor(data) {
    if (!Object.prototype.hasOwnProperty.call(data, 'photoURL')) return null;

    const update = { photoURL: FieldValue.delete() };
    const hasGalleryPhoto = Array.isArray(data.photos) && data.photos.some(usablePhoto);
    if (!hasGalleryPhoto && usablePhoto(data.photoURL)) update.photos = [data.photoURL.trim()];
    return update;
}

async function main() {
    const sources = [
        ['users', await db.collection('users').get()],
        ['checkins', await db.collection('checkins').get()],
        ['joinRequests', await db.collectionGroup('joinRequests').get()]
    ];
    const migrations = [];
    const counts = {};

    for (const [name, snapshot] of sources) {
        let removed = 0;
        let backfilled = 0;
        for (const document of snapshot.docs) {
            const update = migrationFor(document.data());
            if (!update) continue;
            migrations.push({ ref: document.ref, update });
            removed++;
            if (update.photos) backfilled++;
        }
        counts[name] = { scanned: snapshot.size, removed, backfilled };
    }

    console.log(`${execute ? 'Executing' : 'Dry run for'} project ${env.PUBLIC_FIREBASE_PROJECT_ID}`);
    for (const [name, count] of Object.entries(counts)) {
        console.log(
            `${name}: scanned ${count.scanned}, remove ${count.removed}, backfill ${count.backfilled}`
        );
    }

    if (!execute) {
        console.log(`No documents changed. Re-run with --execute to update ${migrations.length} documents.`);
        return;
    }

    for (let offset = 0; offset < migrations.length; offset += 450) {
        const batch = db.batch();
        for (const migration of migrations.slice(offset, offset + 450)) {
            batch.update(migration.ref, migration.update);
        }
        await batch.commit();
    }

    console.log(`Updated ${migrations.length} documents.`);
}

main().catch((error) => {
    console.error('Migration failed:', error.message);
    process.exit(1);
});