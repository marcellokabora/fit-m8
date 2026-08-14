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
		age: 26,
		city: 'Barcelona',
		gender: 'Female',
		bio: 'Love tennis and outdoor activities! 🎾',
		activities: [
			{ id: 'tennis', format: '1v1', level: 'intermediate' },
			{ id: 'jogging', format: '1v1', level: 'beginner' }
		]
	},
	{
		displayName: 'Emma',
		age: 24,
		city: 'Barcelona',
		gender: 'Female',
		bio: 'Padel enthusiast! Looking for a partner 🎾',
		activities: [
			{ id: 'padel', format: '1v1', level: 'advanced' },
			{ id: 'gym', format: '1v1', level: 'intermediate' }
		]
	},
	{
		displayName: 'Lisa',
		age: 28,
		city: 'Barcelona',
		gender: 'Female',
		bio: 'Pickleball addict! Casual vibes 🥒',
		activities: [
			{ id: 'pickleball', format: '1v1', level: 'beginner' },
			{ id: 'cycling', format: '1v1', level: 'intermediate' }
		]
	},
	{
		displayName: 'Maria',
		age: 25,
		city: 'Barcelona',
		gender: 'Female',
		bio: 'Badminton player. Let\'s match! 🏸',
		activities: [
			{ id: 'badminton', format: '1v1', level: 'intermediate' },
			{ id: 'gym', format: '1v1', level: 'beginner' }
		]
	},
	{
		displayName: 'Julia',
		age: 27,
		city: 'Barcelona',
		gender: 'Female',
		bio: 'Rock climbing partner needed 🧗',
		activities: [
			{ id: 'rock-climbing', format: '1v1', level: 'advanced' },
			{ id: 'hiking', format: '1v1', level: 'intermediate' }
		]
	},
	{
		displayName: 'Anna',
		age: 23,
		city: 'Barcelona',
		gender: 'Female',
		bio: 'Ping pong is life! 🏓',
		activities: [
			{ id: 'ping-pong', format: '1v1', level: 'intermediate' },
			{ id: 'swimming', format: '1v1', level: 'beginner' }
		]
	},
	{
		displayName: 'Sophie',
		age: 26,
		city: 'Barcelona',
		gender: 'Female',
		bio: 'Squash player looking for regular matches 📦',
		activities: [
			{ id: 'squash', format: '1v1', level: 'advanced' },
			{ id: 'gym', format: '1v1', level: 'intermediate' }
		]
	},
	{
		displayName: 'Lucia',
		age: 24,
		city: 'Barcelona',
		gender: 'Female',
		bio: 'Martial arts enthusiast! Come train with me 🥋',
		activities: [
			{ id: 'martial-arts', format: '1v1', level: 'intermediate' },
			{ id: 'gym', format: '1v1', level: 'advanced' }
		]
	},
	{
		displayName: 'Vera',
		age: 29,
		city: 'Barcelona',
		gender: 'Female',
		bio: 'Golf lover! Weekend matches? ⛳',
		activities: [
			{ id: 'golf', format: '1v1', level: 'beginner' },
			{ id: 'cycling', format: '1v1', level: 'intermediate' }
		]
	},
	{
		displayName: 'Rosa',
		age: 25,
		city: 'Barcelona',
		gender: 'Female',
		bio: 'Swimming and fencing! Competitive spirit 🏊',
		activities: [
			{ id: 'swimming', format: '1v1', level: 'advanced' },
			{ id: 'fencing', format: '1v1', level: 'intermediate' }
		]
	}
];

async function seedDatabase() {
	console.log('🌱 Seeding fake female profiles...\n');

	for (const profile of fakeProfiles) {
		try {
			// Create a fake user ID (e.g., user_sarah_001)
			const userId = `fake_${profile.displayName.toLowerCase()}_${Math.random().toString(36).substr(2, 9)}`;

			const userData = {
				...profile,
				uid: userId,
				photoURL: `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile.displayName}`,
				createdAt: FieldValue.serverTimestamp(),
				updatedAt: FieldValue.serverTimestamp()
			};

			await db.collection('users').doc(userId).set(userData);
			console.log(`✅ Created: ${profile.displayName} (${profile.age}y) - ${profile.activities.map(a => a.id).join(', ')}`);
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
