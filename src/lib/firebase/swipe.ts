import {
	collection,
	doc,
	setDoc,
	getDoc,
	query,
	where,
	getDocs,
	serverTimestamp,
	limit
} from 'firebase/firestore';
import { db } from '$lib/firebase/client';
import type { ActivityFormat, SexualOrientation, UserProfile } from '$lib/types';

export async function recordSwipe(
	fromUid: string,
	toUid: string,
	direction: 'like' | 'pass',
	activity: string,
	format: ActivityFormat
) {
	await setDoc(doc(db, 'swipes', fromUid, 'sent', toUid), {
		direction,
		activity,
		format,
		timestamp: serverTimestamp()
	});

	if (direction === 'like') {
		// Check if the other user already liked us back
		const reverseSnap = await getDoc(doc(db, 'swipes', toUid, 'sent', fromUid));
		if (reverseSnap.exists() && reverseSnap.data().direction === 'like') {
			await createMatch(fromUid, toUid, activity, format);
			return true; // it's a match!
		}
	}
	return false;
}

async function createMatch(uid1: string, uid2: string, activity: string, format: ActivityFormat) {
	const matchId = [uid1, uid2].sort().join('_');
	await setDoc(
		doc(db, 'matches', matchId),
		{
			userIds: [uid1, uid2],
			activity,
			format,
			status: 'confirmed',
			createdAt: serverTimestamp()
		},
		{ merge: true }
	);
}

export async function getDiscoverFeed(
	currentUid: string,
	activityFilter: string,
	formatFilter: ActivityFormat | '',
	genderFilter: string = '',
	sexualOrientationFilter: SexualOrientation | '' = ''
): Promise<UserProfile[]> {
	// Get users who we already swiped
	const sentSnap = await getDocs(collection(db, 'swipes', currentUid, 'sent'));
	const alreadySwiped = new Set(sentSnap.docs.map((d) => d.id));
	alreadySwiped.add(currentUid);

	let q = query(collection(db, 'users'), limit(20));
	const snap = await getDocs(q);

	const candidates: UserProfile[] = [];
	for (const d of snap.docs) {
		if (alreadySwiped.has(d.id)) continue;
		const data = d.data() as Omit<UserProfile, 'uid'>;

		if (genderFilter && data.gender !== genderFilter) continue;
		if (
			sexualOrientationFilter &&
			(data.sexualOrientation ?? 'straight') !== sexualOrientationFilter
		)
			continue;

		// Filter by activity + format if set
		if (activityFilter || formatFilter) {
			const match = data.activities?.some(
				(a) =>
					(!activityFilter || a.id === activityFilter) &&
					(!formatFilter || a.format === formatFilter)
			);
			if (!match) continue;
		}
		candidates.push({ uid: d.id, ...data });
	}
	return candidates;
}
