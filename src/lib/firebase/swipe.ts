import {
	collection,
	doc,
	deleteDoc,
	setDoc,
	getDoc,
	addDoc,
	query,
	where,
	getDocs,
	serverTimestamp,
	limit,
	writeBatch
} from 'firebase/firestore';
import { db } from '$lib/firebase/client';
import type {
	ActivityFormat,
	Gender,
	SexualOrientation,
	SkillLevel,
	UserProfile,
	YesNoFilter
} from '$lib/types';
import { distanceKm, nearbyFakeLocation } from '$lib/location';

export async function recordSwipe(
	fromUid: string,
	toUid: string,
	direction: 'like' | 'pass',
	activities: string[]
) {
	await setDoc(doc(db, 'swipes', fromUid, 'sent', toUid), {
		direction,
		activities,
		timestamp: serverTimestamp()
	});

	if (direction === 'like') {
		// Check if the other user already liked us back
		const reverseSnap = await getDoc(doc(db, 'swipes', toUid, 'sent', fromUid));
		if (reverseSnap.exists() && reverseSnap.data().direction === 'like') {
			// Prefer the activities both sides actually picked; fall back to this swipe's
			// picks if the two selections don't overlap (or the other swipe predates this field)
			const reverseActivities: string[] = reverseSnap.data().activities ?? [];
			const shared = activities.filter((id) => reverseActivities.includes(id));
			await createMatch(fromUid, toUid, shared.length ? shared : activities);
			return true; // it's a match!
		}
	}
	return false;
}

async function createMatch(uid1: string, uid2: string, activities: string[]) {
	const matchId = [uid1, uid2].sort().join('_');
	await setDoc(
		doc(db, 'matches', matchId),
		{
			userIds: [uid1, uid2],
			activities,
			status: 'confirmed',
			createdAt: serverTimestamp()
		},
		{ merge: true }
	);
}

// Premium-only: lets a user contact someone directly without a mutual swipe match first.
// Reuses the match doc if one already exists (e.g. they matched normally too), otherwise
// creates one tagged `isDirectMessage` so it stands out in the matches list. The match is
// only created once the composed message is actually sent, so browsing never creates a match.
export async function startDirectMessage(
	fromUid: string,
	toUid: string,
	activities: string[],
	text: string
): Promise<string> {
	const matchId = [fromUid, toUid].sort().join('_');
	const existing = await getDoc(doc(db, 'matches', matchId));
	if (!existing.exists()) {
		await setDoc(doc(db, 'matches', matchId), {
			userIds: [fromUid, toUid],
			activities,
			status: 'confirmed',
			isDirectMessage: true,
			createdAt: serverTimestamp()
		});
	}
	await addDoc(collection(db, 'chats', matchId, 'messages'), {
		senderId: fromUid,
		text,
		timestamp: serverTimestamp()
	});
	await setDoc(
		doc(db, 'matches', matchId),
		{
			lastMessage: text,
			lastMessageAt: serverTimestamp(),
			lastMessageSenderId: fromUid,
			[`readBy.${fromUid}`]: serverTimestamp()
		},
		{ merge: true }
	);
	return matchId;
}

// Removes a previously recorded swipe so the target profile can reappear in the discover feed.
export async function undoSwipe(fromUid: string, toUid: string) {
	await deleteDoc(doc(db, 'swipes', fromUid, 'sent', toUid));
}

export async function getDiscoverFeed(
	currentUid: string,
	myActivityIds: string[],
	activityFilter: string[],
	formatFilter: ActivityFormat | '',
	levelFilter: SkillLevel | '',
	genderFilter: Gender | '' = '',
	sexualOrientationFilter: SexualOrientation | '' = '',
	minAge: number | null = null,
	maxAge: number | null = null,
	maxDistanceKm: number | null = null,
	currentCoords: { lat?: number; lng?: number } = {},
	singleFilter: YesNoFilter = '',
	trainerFilter: YesNoFilter = ''
): Promise<UserProfile[]> {
	// Get users who we already swiped
	const sentSnap = await getDocs(collection(db, 'swipes', currentUid, 'sent'));
	const alreadySwiped = new Set(sentSnap.docs.map((d) => d.id));
	alreadySwiped.add(currentUid);

	// High cap rather than unbounded: keeps the read cost predictable while comfortably
	// covering the current user base for filtering below.
	let q = query(collection(db, 'users'), limit(500));
	const snap = await getDocs(q);

	const hasOrigin = currentCoords.lat !== undefined && currentCoords.lng !== undefined;
	// "All sports" means any sport we ourselves practice, not literally any sport on the platform
	const relevantActivityIds = activityFilter.length ? activityFilter : myActivityIds;

	// A specific sport filter means we rank by `priority`, how high that sport sits in the
	// candidate's own list (their #1 sport outranks someone who only has it 2nd/3rd); with no
	// filter (all our sports) there's no single sport to rank by, so the feed is shuffled instead.
	const isSpecificSport = activityFilter.length > 0;
	const candidates: { profile: UserProfile; priority: number }[] = [];
	for (const d of snap.docs) {
		if (alreadySwiped.has(d.id)) continue;
		const data = d.data() as Omit<UserProfile, 'uid'>;

		// Unverified email/password accounts stay hidden from Discover until they confirm their inbox;
		// `undefined` means the profile predates this field (or is a Google account), so it's kept.
		if (data.emailVerified === false) continue;

		if (genderFilter && data.gender !== genderFilter) continue;
		if (
			sexualOrientationFilter &&
			(data.orientation ?? 'hetero') !== sexualOrientationFilter
		)
			continue;
		if (minAge !== null && data.age < minAge) continue;
		if (maxAge !== null && data.age > maxAge) continue;
		if (singleFilter === 'yes' && !data.isSingle) continue;
		if (singleFilter === 'no' && data.isSingle) continue;
		if (trainerFilter === 'yes' && !data.isTrainer) continue;
		if (trainerFilter === 'no' && data.isTrainer) continue;

		// Fake seed accounts keep a fixed seeded location in Firestore, but every real user should
		// see them nearby instead of all sharing that same fixed spot — override at read time.
		if (hasOrigin && d.id.startsWith('fake_')) {
			Object.assign(data, nearbyFakeLocation(currentCoords.lat!, currentCoords.lng!, d.id));
		}

		// Distance filter only applies when we know both locations; candidates without
		// coordinates can't be verified as out of range, so they're kept rather than dropped.
		if (maxDistanceKm !== null && hasOrigin && data.lat !== undefined && data.lng !== undefined) {
			const km = distanceKm(currentCoords.lat!, currentCoords.lng!, data.lat, data.lng);
			if (km > maxDistanceKm) continue;
		}

		// Candidate must share one of our own sports (or the specifically chosen one), matching format/level too;
		// `priority` is the earliest matching sport in the candidate's own list.
		let priority = Infinity;
		data.activities?.forEach((a, index) => {
			if (
				index < priority &&
				relevantActivityIds.includes(a.id) &&
				(!formatFilter || a.format === formatFilter || a.format === 'all') &&
				(!levelFilter || a.level === levelFilter)
			) {
				priority = index;
			}
		});
		if (priority === Infinity) continue;
		candidates.push({ profile: { uid: d.id, ...data }, priority });
	}
	if (isSpecificSport) {
		candidates.sort((a, b) => a.priority - b.priority);
	} else {
		// Shuffle so the feed doesn't always surface the same candidates in the same order.
		for (let i = candidates.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[candidates[i], candidates[j]] = [candidates[j], candidates[i]];
		}
	}
	// Real users surface before fake seed accounts ("fake_<name>" doc ids, see scripts/seed.cjs),
	// stable sort keeps the ordering above intact within each group.
	candidates.sort(
		(a, b) => Number(a.profile.uid.startsWith('fake_')) - Number(b.profile.uid.startsWith('fake_'))
	);
	return candidates.map((c) => c.profile);
}


// Deletes every recorded swipe and match so previously liked/passed profiles reappear in the discover feed.
export async function resetSwipes(uid: string) {
	const sentSnap = await getDocs(collection(db, 'swipes', uid, 'sent'));
	const matchesSnap = await getDocs(
		query(collection(db, 'matches'), where('userIds', 'array-contains', uid))
	);

	// Chat messages live in a separate top-level collection, so clear each thread before the match doc is gone.
	for (const matchDoc of matchesSnap.docs) {
		const messagesSnap = await getDocs(collection(db, 'chats', matchDoc.id, 'messages'));
		if (messagesSnap.empty) continue;
		const messagesBatch = writeBatch(db);
		messagesSnap.docs.forEach((m) => messagesBatch.delete(m.ref));
		await messagesBatch.commit();
	}

	const batch = writeBatch(db);
	sentSnap.docs.forEach((d) => batch.delete(d.ref));
	matchesSnap.docs.forEach((d) => batch.delete(d.ref));
	await batch.commit();
}

// Deletes a single match and its chat thread (used from the chat screen's "remove match" action).
export async function unmatch(matchId: string) {
	const messagesSnap = await getDocs(collection(db, 'chats', matchId, 'messages'));
	if (!messagesSnap.empty) {
		const messagesBatch = writeBatch(db);
		messagesSnap.docs.forEach((m) => messagesBatch.delete(m.ref));
		await messagesBatch.commit();
	}
	await deleteDoc(doc(db, 'matches', matchId));
}

