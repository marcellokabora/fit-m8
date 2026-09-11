// Seeds fake "checked in right now" pins for demoing the /explore live check-in feature.
// Standalone (creates its own fake users) so it doesn't depend on scripts/seed.cjs.
// Usage: npm run seed:checkins
//        npm run seed:checkins:madrid
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

const SEED_LOCATIONS = {
    barcelona: {
        city: 'Barcelona',
        uidPrefix: 'fake_beach',
        label: 'Barcelona beach',
        activities: ['beachVolley', 'footVolley', 'beachTennis', 'surf', 'skateboard', 'tennis'],
        spots: [
            { lat: 41.3855, lng: 2.1975 },
            { lat: 41.3919, lng: 2.205 }
        ]
    },
    madrid: {
        city: 'Madrid',
        uidPrefix: 'fake_madrid',
        label: 'central Madrid',
        activities: ['padel', 'soccer', 'tennis', 'jogging', 'basketball', 'cycling', 'gym', 'calisthenics', 'skateboard', 'yoga'],
        spots: [
            { lat: 40.4155, lng: -3.7074 },
            { lat: 40.42, lng: -3.7058 },
            { lat: 40.4089, lng: -3.7006 }
        ]
    }
};

const cityArg = process.argv.find(arg => arg.startsWith('--city='));
const cityKey = cityArg ? cityArg.slice('--city='.length).toLowerCase() : 'barcelona';
const seedLocation = SEED_LOCATIONS[cityKey];

if (!seedLocation) {
    console.error(`Unknown city "${cityKey}". Choose: ${Object.keys(SEED_LOCATIONS).join(', ')}`);
    process.exit(1);
}

// Picks a fresh point 50-500m from the selected spot on every run. Square-root sampling
// spreads pins across the area instead of clustering most of them near the center.
function jitter(spot) {
    const bearingRad = Math.random() * Math.PI * 2;
    const distanceKm = 0.05 + Math.sqrt(Math.random()) * 0.45;
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
    console.log(`Seeding fake check-ins around ${seedLocation.label}...\n`);

    for (let i = 0; i < NAMES.length; i++) {
        const { name, gender } = NAMES[i];
        const uid = `${seedLocation.uidPrefix}_${i + 1}`;
        const activityId = seedLocation.activities[i % seedLocation.activities.length];
        const spot = seedLocation.spots[i % seedLocation.spots.length];
        const { lat, lng } = jitter(spot);

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
                        bio: `Playing ${activityId} in ${seedLocation.city}, come join!`,
                        age: 22 + (i % 15),
                        gender,
                        orientation: 'hetero',
                        city: seedLocation.city,
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

            console.log(`${name} checked in for ${activityId} near ${spot.lat},${spot.lng}`);
        } catch (error) {
            console.error(`❌ Error seeding ${name}:`, error.message);
        }
    }

    console.log(`\nDone! Open /explore to see the ${seedLocation.city} check-ins.`);
    process.exit(0);
}

seedCheckins().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
