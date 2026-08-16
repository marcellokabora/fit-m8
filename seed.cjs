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

// Fake female profiles
const fakeProfiles = [
	{
		displayName: 'Sarah',
		photoURL: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=900&h=1200&q=85',
		age: 19,
		city: 'Barcelona',
		gender: 'Female',
		orientation: 'straight',
		bio: 'Love tennis and outdoor activities! 🎾',
		activities: [
			{ id: 'tennis', format: '1v1', level: 'Basic' },
			{ id: 'jogging', format: '1v1', level: 'Expert' }
		]
	},
	{
		displayName: 'Emma',
		photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&h=1200&q=85',
		age: 33,
		city: 'Barcelona',
		gender: 'Female',
		orientation: 'gay',
		bio: 'Padel enthusiast! Looking for a partner 🎾',
		activities: [
			{ id: 'padel', format: '1v1', level: 'Expert' },
			{ id: 'gym', format: '1v1', level: 'Basic' }
		]
	},
	{
		displayName: 'Lisa',
		photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&h=1200&q=85',
		age: 45,
		city: 'Barcelona',
		gender: 'Female',
		orientation: 'straight',
		bio: 'Pickleball addict! Casual vibes 🥒',
		activities: [
			{ id: 'pickleball', format: '1v1', level: 'Expert' },
			{ id: 'cycling', format: '1v1', level: 'Basic' }
		]
	},
	{
		displayName: 'Maria',
		photoURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&h=1200&q=85',
		age: 21,
		city: 'Barcelona',
		gender: 'Female',
		orientation: 'straight',
		bio: 'Badminton player. Let\'s match! 🏸',
		activities: [
			{ id: 'badminton', format: '1v1', level: 'Basic' },
			{ id: 'gym', format: '1v1', level: 'Expert' }
		]
	},
	{
		displayName: 'Julia',
		photoURL: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&h=1200&q=85',
		age: 38,
		city: 'Barcelona',
		gender: 'Female',
		orientation: 'gay',
		bio: 'Rock climbing partner needed 🧗',
		activities: [
			{ id: 'rock-climbing', format: '1v1', level: 'Expert' },
			{ id: 'hiking', format: '1v1', level: 'Basic' }
		]
	},
	{
		displayName: 'Anna',
		photoURL: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&h=1200&q=85',
		age: 50,
		city: 'Barcelona',
		gender: 'Female',
		orientation: 'straight',
		bio: 'Ping pong is life! 🏓',
		activities: [
			{ id: 'ping-pong', format: '1v1', level: 'Expert' },
			{ id: 'swimming', format: '1v1', level: 'Basic' }
		]
	},
	{
		displayName: 'Sophie',
		photoURL: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&h=1200&q=85',
		age: 18,
		city: 'Barcelona',
		gender: 'Female',
		orientation: 'straight',
		bio: 'Squash player looking for regular matches 📦',
		activities: [
			{ id: 'squash', format: '1v1', level: 'Expert' },
			{ id: 'gym', format: '1v1', level: 'Basic' }
		]
	},
	{
		displayName: 'Lucia',
		photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&h=1200&q=85',
		age: 29,
		city: 'Barcelona',
		gender: 'Female',
		orientation: 'gay',
		bio: 'Martial arts enthusiast! Come train with me 🥋',
		activities: [
			{ id: 'martial-arts', format: '1v1', level: 'Basic' },
			{ id: 'gym', format: '1v1', level: 'Expert' }
		]
	},
	{
		displayName: 'Vera',
		photoURL: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&h=1200&q=85',
		age: 41,
		city: 'Barcelona',
		gender: 'Female',
		orientation: 'straight',
		bio: 'Golf lover! Weekend matches? ⛳',
		activities: [
			{ id: 'golf', format: '1v1', level: 'Basic' },
			{ id: 'cycling', format: '1v1', level: 'Expert' }
		]
	},
	{
		displayName: 'Rosa',
		photoURL: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=900&h=1200&q=85',
		age: 20,
		city: 'Barcelona',
		gender: 'Female',
		orientation: 'straight',
		bio: 'Swimming and frescobol! Competitive spirit 🏊',
		activities: [
			{ id: 'swimming', format: '1v1', level: 'Expert' },
			{ id: 'frescobol', format: '1v1', level: 'Basic' }
		]
	},
	{
		displayName: 'Alex',
		photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&h=1200&q=85',
		age: 36,
		city: 'Barcelona',
		gender: 'Male',
		orientation: 'straight',
		bio: 'Early runs and weekend tennis are my thing! 🎾',
		activities: [
			{ id: 'jogging', format: '1v1', level: 'Basic' },
			{ id: 'tennis', format: '1v1', level: 'Expert' }
		]
	},
	{
		displayName: 'Daniel',
		photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&h=1200&q=85',
		age: 47,
		city: 'Barcelona',
		gender: 'Male',
		orientation: 'gay',
		bio: 'Looking for regular padel games after work 🎾',
		activities: [
			{ id: 'padel', format: '2v2', level: 'Basic' },
			{ id: 'gym', format: '1v1', level: 'Expert' }
		]
	},
	{
		displayName: 'Mateo',
		photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&h=1200&q=85',
		age: 22,
		city: 'Barcelona',
		gender: 'Male',
		orientation: 'straight',
		bio: 'Basketball and good competition 🏀',
		activities: [
			{ id: 'basketball', format: '2v2', level: 'Expert' },
			{ id: 'calisthenics', format: '1v1', level: 'Basic' }
		]
	},
	{
		displayName: 'Leo',
		photoURL: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=900&h=1200&q=85',
		age: 31,
		city: 'Barcelona',
		gender: 'Male',
		orientation: 'straight',
		bio: 'Cycling around the coast whenever I can 🚴',
		activities: [
			{ id: 'cycling', format: '1v1', level: 'Expert' },
			{ id: 'swimming', format: '1v1', level: 'Basic' }
		]
	},
	{
		displayName: 'Hugo',
		photoURL: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&h=1200&q=85',
		age: 43,
		city: 'Barcelona',
		gender: 'Male',
		orientation: 'gay',
		bio: 'Weekend hikes and climbing sessions 🧗',
		activities: [
			{ id: 'hiking', format: '1v1', level: 'Basic' },
			{ id: 'rock-climbing', format: '1v1', level: 'Expert' }
		]
	},
	{
		displayName: 'Adrian',
		photoURL: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=900&h=1200&q=85',
		age: 25,
		city: 'Barcelona',
		gender: 'Male',
		orientation: 'straight',
		bio: 'Badminton player searching for a new rival 🏸',
		activities: [
			{ id: 'badminton', format: '1v1', level: 'Basic' },
			{ id: 'ping-pong', format: '1v1', level: 'Expert' }
		]
	},
	{
		displayName: 'Nico',
		photoURL: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=900&h=1200&q=85',
		age: 49,
		city: 'Barcelona',
		gender: 'Male',
		orientation: 'straight',
		bio: 'Always ready for a pickleball match 🥒',
		activities: [
			{ id: 'pickleball', format: '2v2', level: 'Expert' },
			{ id: 'squash', format: '1v1', level: 'Basic' }
		]
	},
	{
		displayName: 'Marc',
		photoURL: 'https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=900&h=1200&q=85',
		age: 34,
		city: 'Barcelona',
		gender: 'Male',
		orientation: 'straight',
		bio: 'Golf on Sundays, gym during the week ⛳',
		activities: [
			{ id: 'golf', format: '1v1', level: 'Basic' },
			{ id: 'gym', format: '1v1', level: 'Expert' }
		]
	},
	{
		displayName: 'Eric',
		photoURL: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=900&h=1200&q=85',
		age: 40,
		city: 'Barcelona',
		gender: 'Male',
		orientation: 'gay',
		bio: 'Training martial arts and looking for partners 🥋',
		activities: [
			{ id: 'martial-arts', format: '1v1', level: 'Expert' },
			{ id: 'frescobol', format: '1v1', level: 'Basic' }
		]
	},
	{
		displayName: 'Pablo',
		photoURL: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&h=1200&q=85',
		age: 28,
		city: 'Barcelona',
		gender: 'Male',
		orientation: 'straight',
		bio: 'Beach volleyball and swimming all summer 🏐',
		activities: [
			{ id: 'beach-volley', format: '2v2', level: 'Basic' },
			{ id: 'swimming', format: '1v1', level: 'Expert' }
		]
	}
];

const activityPool = [
	'jogging',
	'padel',
	'tennis',
	'beach-volley',
	'basketball',
	'cycling',
	'swimming',
	'hiking',
	'badminton',
	'ping-pong',
	'pickleball',
	'squash',
	'gym',
	'calisthenics',
	'rock-climbing',
	'golf',
	'martial-arts',
	'frescobol'
];

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
			level: (profileIndex + offset) % 2 === 0 ? 'Basic' : 'Expert'
		});
	}

	return { ...profile, activities };
}

// Give each profile 3 photos by repeating their single curated shot.
function attachPhotos(profiles) {
	return profiles.map(profile => {
		const photos = [profile.photoURL, profile.photoURL, profile.photoURL];
		return { ...profile, photos, photoURL: photos[0] };
	});
}


async function seedDatabase() {
	console.log('🌱 Seeding fake profiles...\n');

	const profilesWithPhotos = attachPhotos(fakeProfiles);

	for (const [profileIndex, sourceProfile] of profilesWithPhotos.entries()) {
		try {
			const profile = prepareProfile(sourceProfile, profileIndex);
			// Spread test profiles from 5km up to ~105km away so the distance filter has something to bite on
			const distanceKm = (profileIndex + 1) * 5;
			const { lat, lng } = locationAtDistance(profileIndex, distanceKm);
			// Create a fake user ID (e.g., user_sarah_001)
			const userId = `fake_${profile.displayName.toLowerCase()}_${Math.random().toString(36).substr(2, 9)}`;

			const userData = {
				...profile,
				lat,
				lng,
				uid: userId,
				createdAt: FieldValue.serverTimestamp(),
				updatedAt: FieldValue.serverTimestamp()
			};

			await db.collection('users').doc(userId).set(userData);
			console.log(`✅ Created: ${profile.displayName} (${profile.age}y, ~${distanceKm}km away) - ${profile.activities.map(a => a.id).join(', ')}`);
		} catch (error) {
			console.error(`❌ Error creating ${profile.displayName}:`, error.message);
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
