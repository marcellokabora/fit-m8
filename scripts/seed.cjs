const admin = require('firebase-admin');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Load Firebase config from .env
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
	console.log('\n📋 To create it:');
	console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
	console.log('2. Click "Generate New Private Key"');
	console.log('3. Save as firebase-key.json in the root directory');
	process.exit(1);
}

admin.initializeApp({
	credential: admin.cert(serviceAccount),
	projectId: env.PUBLIC_FIREBASE_PROJECT_ID
});

const db = getFirestore();

const activityPool = [
	'jogging',
	'padel',
	'tennis',
	'beachVolley',
	'basketball',
	'soccer',
	'cycling',
	'swimming',
	'hiking',
	'pingPong',
	'pickleball',
	'squash',
	'gym',
	'calisthenics',
	'rockClimbing',
	'golf',
	'boxing',
	'kickboxing',
	'muayThai',
	'karate',
	'jiuJitsu',
	'judo',
	'frescobol',
	'paddleboard',
	'surf',
	'yoga',
	'rollerblade',
	'skateboard',
	'footvolley'
];

// Human-readable labels for the generated profiles' bios (mirrors src/lib/types.ts ACTIVITIES)
const activityLabels = {
	jogging: 'jogging',
	padel: 'padel',
	tennis: 'tennis',
	beachVolley: 'beach volleyball',
	basketball: 'basketball',
	soccer: 'football',
	cycling: 'cycling',
	swimming: 'swimming',
	hiking: 'hiking',
	pingPong: 'ping pong',
	pickleball: 'pickleball',
	squash: 'squash',
	gym: 'gym training',
	calisthenics: 'calisthenics',
	rockClimbing: 'rock climbing',
	golf: 'golf',
	boxing: 'boxing',
	kickboxing: 'kickboxing',
	muayThai: 'muay thai',
	karate: 'karate',
	jiuJitsu: 'jiu-jitsu',
	judo: 'judo',
	frescobol: 'frescobol',
	paddleboard: 'paddleboarding',
	surf: 'surfing',
	yoga: 'yoga',
	rollerblade: 'rollerblading',
	skateboard: 'skateboarding',
	footvolley: 'foot volley'
};

const FEMALE_NAMES = [
	'Carla', 'Nuria', 'Paula', 'Marta', 'Laia', 'Clara', 'Irene', 'Elena',
	'Silvia', 'Alba', 'Ines', 'Berta', 'Noa', 'Aina', 'Judit', 'Olga',
	'Teresa', 'Monica', 'Raquel', 'Cristina', 'Anna', 'Maria', 'Sara', 'Lucia',
	'Julia', 'Emma', 'Sofia', 'Valeria', 'Marina', 'Andrea', 'Blanca', 'Celia',
	'Diana', 'Eva', 'Gemma', 'Helena', 'Iris', 'Laura', 'Mireia', 'Natalia',
	'Patricia', 'Rita', 'Sandra', 'Victoria', 'Ariadna', 'Bruna', 'Carmen',
	'Daniela', 'Ester', 'Fiona', 'Gisela', 'Isabel', 'Joana', 'Karla',
	'Leire', 'Meritxell', 'Nerea', 'Ona', 'Pilar', 'Queralt', 'Rocio'
];
const MALE_NAMES = [
	'Jordi', 'Oriol', 'Pau', 'Marti', 'Bruno', 'Ivan', 'Sergi', 'Xavi',
	'Ferran', 'Roger', 'Gerard', 'Victor', 'Toni', 'Dario', 'Guillem', 'Enric',
	'Ramon', 'Diego', 'Joan', 'Aleix', 'Marc', 'Pol', 'Biel', 'Arnau',
	'David', 'Carlos', 'Miguel', 'Alvaro', 'Nil', 'Eric', 'Hugo', 'Adria',
	'Bernat', 'Cesc', 'Dídac', 'Eloi', 'Genis', 'Izan', 'Jan', 'Lluis',
	'Manel', 'Nacho', 'Pere', 'Quim', 'Ruben', 'Salva', 'Tomas', 'Unai',
	'Vicenç', 'Albert', 'Andreu', 'Cristian', 'Emili', 'Felip', 'Gabriel',
	'Hector', 'Ismael', 'Jaume', 'Kilian', 'Lucas', 'Mario'
];

// Fisher-Yates shuffle.
function shuffled(array) {
	const copy = [...array];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

// Cycles through a shuffled copy of `pool`, reshuffling once exhausted, so repeats are
// spread out evenly across all callers instead of clustering within one sport's batch.
function createCycler(pool) {
	let queue = [];
	return () => {
		if (queue.length === 0) queue = shuffled(pool);
		return queue.pop();
	};
}

const nextFemaleName = createCycler(FEMALE_NAMES);
const nextMaleName = createCycler(MALE_NAMES);

function randomAge(min = 18, max = 55) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Builds 10 photo-less profiles per sport (that sport as their primary/first activity), so the
// admin fake-profiles page has at least 10 candidates to attach a real photo to for every sport.
// Names and ages are randomized so every sport's batch looks distinct. Pass `gender` to force
// every profile in the batch to the same gender instead of alternating.
function generateSportProfiles(sportId, count = 10, { minAge = 18, maxAge = 55, gender: forcedGender } = {}) {
	const label = activityLabels[sportId] ?? sportId;
	const profiles = [];
	for (let i = 0; i < count; i++) {
		const gender = forcedGender ?? (i % 2 === 0 ? 'female' : 'male');
		const displayName = gender === 'female' ? nextFemaleName() : nextMaleName();
		const format = i % 3 === 0 ? '1v1' : i % 3 === 1 ? '2v2' : 'all';
		const level = i % 2 === 0 ? 'basic' : 'expert';
		profiles.push({
			displayName,
			photoURL: '',
			photos: [],
			age: randomAge(minAge, maxAge),
			city: 'Barcelona',
			gender,
			orientation: i % 4 === 3 ? 'gay' : 'hetero',
			bio: `Big fan of ${label}, always looking for new partners!`,
			isSingle: i % 3 !== 2,
			isTrainer: i % 5 === 4,
			activities: [{ id: sportId, format, level }]
		});
	}
	return profiles;
}

const BARCELONA_CENTER = { lat: 41.3851, lng: 2.1734 };

// Places a point `distanceKm` from Barcelona at a bearing derived from `index`, so
// fake profiles are spread out in different directions instead of stacking on one line.
function locationAtDistance(index, distanceKm) {
	const bearingRad = (((index * 53) % 360) * Math.PI) / 180;
	const latRad = (BARCELONA_CENTER.lat * Math.PI) / 180;
	return {
		lat: BARCELONA_CENTER.lat + (distanceKm / 111) * Math.cos(bearingRad),
		lng: BARCELONA_CENTER.lng + (distanceKm / (111 * Math.cos(latRad))) * Math.sin(bearingRad)
	};
}

function prepareProfile(profile, profileIndex) {
	const activities = [...profile.activities];
	const existingIds = new Set(activities.map(activity => activity.id));

	for (let offset = 0; activities.length < 5; offset++) {
		const id = activityPool[(profileIndex * 3 + offset) % activityPool.length];
		if (existingIds.has(id)) continue;
		existingIds.add(id);
		activities.push({
			id,
			format: offset % 3 === 2 ? 'all' : offset % 2 === 0 ? '1v1' : '2v2',
			level: (profileIndex + offset) % 2 === 0 ? 'basic' : 'expert'
		});
	}

	return { ...profile, activities };
}

async function seedDatabase() {
	console.log('🌱 Seeding fake profiles...\n');

	// 20 photo-less female + 10 male surf profiles (real photos pending manual upload via /admin/fake-profiles).
	const entries = [
		...generateSportProfiles('surf', 20, { minAge: 18, maxAge: 35, gender: 'female' }).map(
			(profile, i) => ({
				profile,
				userId: `fake_surf_${i + 1}`
			})
		),
		...generateSportProfiles('surf', 10, { minAge: 18, maxAge: 35, gender: 'male' }).map(
			(profile, i) => ({
				profile,
				userId: `fake_surf_${21 + i}`
			})
		),
		// 20 photo-less mixed-gender yoga profiles (alternates female/male via default gender).
		...generateSportProfiles('yoga', 20, { minAge: 18, maxAge: 35 }).map(
			(profile, i) => ({
				profile,
				userId: `fake_yoga_${i + 1}`
			})
		)
	];

	for (const [profileIndex, { profile: sourceProfile, userId }] of entries.entries()) {
		try {
			const profile = prepareProfile(sourceProfile, profileIndex);
			// Spread test profiles from 5km up to 50km, cycling per group of 10 so distance
			// doesn't correlate with gender (profiles are listed females-then-males).
			const distanceKm = ((profileIndex % 10) + 1) * 5;
			const { lat, lng } = locationAtDistance(profileIndex, distanceKm);

			const userData = {
				...profile,
				lat,
				lng,
				uid: userId,
				emailVerified: true,
				createdAt: FieldValue.serverTimestamp(),
				updatedAt: FieldValue.serverTimestamp()
			};

			// Photos are managed by hand via /admin/fake-profiles, so never write them here —
			// merge without these keys leaves whatever is already set (or unset) untouched.
			delete userData.photoURL;
			delete userData.photos;
			await db.collection('users').doc(userId).set(userData, { merge: true });
			console.log(`✅ Created: ${profile.displayName} (${profile.age}y, ~${distanceKm}km away) - ${profile.activities.map(a => a.id).join(', ')}`);
		} catch (error) {
			console.error(`❌ Error creating ${sourceProfile.displayName}:`, error.message);
		}
	}

	console.log('\n✨ Seeding complete!');
	console.log('📱 Refresh your app and start swiping on the discover page!');
	process.exit(0);
}

seedDatabase().catch(error => {
	console.error('Fatal error:', error);
	process.exit(1);
});
