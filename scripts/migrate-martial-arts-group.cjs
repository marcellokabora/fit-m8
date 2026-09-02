// One-time data migration: expands the removed 'martialArts' activity id into the 6
// specific combat disciplines that replaced it (see src/lib/types.ts ACTIVITIES 'combat'
// group), across every `users` doc's `activities[].id` and `discoverFilters.activities[]`.
// Usage: npm run migrate-martial-arts           (dry run, no writes)
//        npm run migrate-martial-arts -- --apply (actually writes the changes)
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

// The 6 activity ids that now live under the 'combat' group (src/lib/types.ts ACTIVITIES)
const COMBAT_IDS = ['boxing', 'kickboxing', 'muayThai', 'karate', 'jiuJitsu', 'judo'];
const MAX_SPORTS_FREE = 10;
const BATCH_LIMIT = 500;

// Replaces one { id: 'martialArts', format, level } entry with 6 entries (same format/level),
// skipping any combat id the user already has to avoid duplicates.
function expandActivities(activities) {
    const out = [];
    const existingIds = new Set(activities.map((a) => a?.id));
    for (const a of activities) {
        if (a && a.id === 'martialArts') {
            for (const id of COMBAT_IDS) {
                if (!existingIds.has(id)) {
                    out.push({ ...a, id });
                    existingIds.add(id);
                }
            }
        } else {
            out.push(a);
        }
    }
    return out;
}

// Replaces 'martialArts' with all 6 combat ids (deduped) inside a discoverFilters.activities array
function expandFilterIds(ids) {
    const out = [];
    for (const id of ids) {
        if (id === 'martialArts') {
            for (const combatId of COMBAT_IDS) {
                if (!out.includes(combatId)) out.push(combatId);
            }
        } else if (!out.includes(id)) {
            out.push(id);
        }
    }
    return out;
}

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

        if (Array.isArray(data.activities) && data.activities.some((a) => a?.id === 'martialArts')) {
            const activities = expandActivities(data.activities);
            console.log(`  users/${doc.id} activities: martialArts -> ${COMBAT_IDS.join(', ')} (${data.activities.length} -> ${activities.length})`);
            if (activities.length > MAX_SPORTS_FREE) {
                console.log(`    ⚠️  now has ${activities.length} activities, over the free-tier limit of ${MAX_SPORTS_FREE} (no auto-fix; requires Premium or manual trim)`);
            }
            update.activities = activities;
        }

        const filterActivities = data.discoverFilters?.activities;
        if (Array.isArray(filterActivities) && filterActivities.includes('martialArts')) {
            const remapped = expandFilterIds(filterActivities);
            console.log(`  users/${doc.id} discoverFilters.activities: martialArts -> ${COMBAT_IDS.join(', ')}`);
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
