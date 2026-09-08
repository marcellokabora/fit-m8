// Seeds fake "checked in right now" pins near Nova Icaria / Platja del Bogatell beach in
// Barcelona, for demoing the /map live check-in feature. Standalone (creates its own
// fake_beach_* users) so it doesn't depend on scripts/seed.cjs having been run first.
// Usage: npm run seed:checkins
const admin = require('firebase-admin');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
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

const db = getFirestore();

// Activities that fit the beach setting (all already exist in src/lib/types.ts ACTIVITIES).
const BEACH_ACTIVITIES = ['beachVolley', 'footVolley', 'beachTennis', 'surf', 'skateboard', 'tennis'];

const NAMES = [
    { name: 'Marc', gender: 'male' },
    { name: 'Laia', gender: 'female' },
    { name: 'Bruno', gender: 'male' },
    { name: 'Nuria', gender: 'female' },
    { name: 'Pau', gender: 'male' },
    { name: 'Carla', gender: 'female' },
    { name: 'Oriol', gender: 'male' },
    { name: 'Alba', gender: 'female' },
    { name: 'Ivan', gender: 'male' },
    { name: 'Marta', gender: 'female' }
];

// Nova Icaria and Platja del Bogatell, Barcelona — the two beach spots shown clustered
// together on the /map screen.
const BEACH_SPOTS = [
    { lat: 41.3855, lng: 2.1975 },
    { lat: 41.3919, lng: 2.205 }
];

// Jitters a point up to ~150m in a deterministic-per-index direction, so pins spread out
// around each beach spot instead of stacking exactly on top of each other.
function jitter(spot, index) {
    const bearingRad = (((index * 67) % 360) * Math.PI) / 180;
    const distanceKm = 0.05 + (index % 3) * 0.05;
    const latRad = (spot.lat * Math.PI) / 180;
    return {
        lat: spot.lat + (distanceKm / 111) * Math.cos(bearingRad),
        lng: spot.lng + (distanceKm / (111 * Math.cos(latRad))) * Math.sin(bearingRad)
    };
}

// Demo data only: real check-ins expire after CHECKIN_DURATION_MS (2h, src/lib/types.ts), but
// these fake pins are set to expire far in the future (~10 years) so they stay put indefinitely
// until this script is re-run or the docs are deleted by hand.
const SEED_EXPIRY_MS = 10 * 365 * 24 * 60 * 60 * 1000;

async function seedCheckins() {
    console.log('🏖️  Seeding fake beach check-ins...\n');

    for (let i = 0; i < NAMES.length; i++) {
        const { name, gender } = NAMES[i];
        const uid = `fake_beach_${i + 1}`;
        const activityId = BEACH_ACTIVITIES[i % BEACH_ACTIVITIES.length];
        const spot = BEACH_SPOTS[i % BEACH_SPOTS.length];
        const { lat, lng } = jitter(spot, i);

        try {
            await db
                .collection('users')
                .doc(uid)
                .set(
                    {
                        uid,
                        displayName: name,
                        photoURL: '',
                        photos: [],
                        bio: `Down at the beach for ${activityId}, come join!`,
                        age: 22 + (i % 15),
                        gender,
                        orientation: 'hetero',
                        city: 'Barcelona',
                        lat,
                        lng,
                        activities: [{ id: activityId, format: 'all', level: 'medium' }],
                        isSingle: i % 2 === 0,
                        isTrainer: false,
                        emailVerified: true,
                        createdAt: FieldValue.serverTimestamp(),
                        updatedAt: FieldValue.serverTimestamp()
                    },
                    { merge: true }
                );

            const now = Date.now();
            await db
                .collection('checkins')
                .doc(uid)
                .set({
                    uid,
                    activityId,
                    lat,
                    lng,
                    displayName: name,
                    photoURL: '',
                    gender,
                    createdAt: Timestamp.fromMillis(now),
                    expiresAt: Timestamp.fromMillis(now + SEED_EXPIRY_MS)
                });

            console.log(`✅ ${name} checked in for ${activityId} near ${spot.lat},${spot.lng}`);
        } catch (error) {
            console.error(`❌ Error seeding ${name}:`, error.message);
        }
    }

    console.log('\n✨ Done! Open /map to see the fake check-ins.');
    process.exit(0);
}

seedCheckins().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
